import { PaddleOCR } from "@paddleocr/paddleocr-js";

export interface OcrLine {
  text: string;
  score: number;
}

export interface OcrBox {
  poly: number[][];
  text: string;
  score: number;
}

export interface OcrResult {
  text: string;
  lines: OcrLine[];
  boxes: OcrBox[];
  totalMs: number;
}

interface OcrItem {
  poly: number[][];
  text: string;
  score: number;
}

const WASM_CDN = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";

type OcrInstance = Awaited<ReturnType<typeof PaddleOCR.create>>;

let instance: OcrInstance | null = null;
let initPromise: Promise<OcrInstance> | null = null;

export async function getOCR(): Promise<OcrInstance> {
  if (instance) return instance;
  if (!initPromise) {
    initPromise = PaddleOCR.create({
      lang: "tl",
      ocrVersion: "PP-OCRv6",
      ortOptions: {
        backend: "wasm",
        wasmPaths: WASM_CDN,
        simd: true,
        numThreads: 4,
      },
    }).then((ocr) => {
      instance = ocr;
      return ocr;
    });
  }
  return initPromise;
}

export async function recognizeImage(blob: Blob): Promise<OcrResult> {
  const ocr = await getOCR();
  const [result] = await ocr.predict(blob);
  const items = (result.items ?? []) as OcrItem[];
  const entries = items.filter((item) => item.text.trim().length > 0);
  const boxes: OcrBox[] = entries.map((item) => ({
    poly: item.poly,
    text: item.text,
    score: item.score,
  }));
  return {
    text: entries.map((item) => item.text).join("\n"),
    lines: entries.map((item) => ({ text: item.text, score: item.score })),
    boxes,
    totalMs: result.metrics?.totalMs ?? 0,
  };
}

export async function disposeOCR(): Promise<void> {
  if (instance) {
    try {
      instance.dispose();
    } catch {
      // ignore dispose errors
    }
  }
  instance = null;
  initPromise = null;
}
