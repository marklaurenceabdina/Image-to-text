import { useCallback, useEffect, useRef, useState } from "react";
import ImagePicker from "./components/ImagePicker";
import ImagePreview from "./components/ImagePreview";
import type { Box } from "./components/ImagePreview";
import ResultPanel from "./components/ResultPanel";
import { disposeOCR, getOCR, recognizeImage } from "./lib/ocr";
import type { OcrResult } from "./lib/ocr";

type Status = "idle" | "loading" | "recognizing" | "done" | "error";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [ocrReady, setOcrReady] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      void disposeOCR();
    };
  }, []);

  const handleImage = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setBoxes([]);
    setError(null);
    setStatus("idle");
    setOcrReady(false);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(f);
    urlRef.current = url;
    setImageUrl(url);
    getOCR()
      .then(() => setOcrReady(true))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const recognize = useCallback(async () => {
    if (!file) return;
    setError(null);
    setStatus("loading");
    try {
      await getOCR();
      setStatus("recognizing");
      const res = await recognizeImage(file);
      setResult(res);
      setBoxes(res.boxes);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setResult(null);
    setBoxes([]);
    setError(null);
    setOcrReady(false);
    setStatus("idle");
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setImageUrl(null);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Image Reader</h1>
        <p>Extract text from images using PaddleOCR — runs entirely in your browser.</p>
      </header>

      <main className="main">
        {!imageUrl ? (
          <ImagePicker onImage={handleImage} />
        ) : (
          <>
            <ImagePreview
              imageUrl={imageUrl}
              boxes={status === "done" ? boxes : undefined}
            />

            {status === "idle" && (
              <div className="action-row">
                <button type="button" className="btn big" onClick={recognize}>
                  Extract text
                  {ocrReady ? "" : "  (loads model first time)"}
                </button>
                <button type="button" className="btn ghost" onClick={reset}>
                  Change image
                </button>
              </div>
            )}

            {(status === "loading" || status === "recognizing") && (
              <div className="status-card">
                <span className="spinner" />
                <p>
                  {status === "loading"
                    ? ocrReady
                      ? "Preparing engine…"
                      : "Downloading OCR model (first run only)…"
                    : "Recognizing text…"}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="status-card error">
                <p>Failed to run OCR:</p>
                <p className="muted">{error}</p>
                <button type="button" className="btn" onClick={recognize}>
                  Retry
                </button>
              </div>
            )}

            {status === "done" && result && (
              <ResultPanel result={result} onReset={reset} />
            )}
          </>
        )}
      </main>

      <footer className="footer">
        Filipino + English · PaddleOCR PP-OCRv6 · your images never leave this device
      </footer>
    </div>
  );
}
