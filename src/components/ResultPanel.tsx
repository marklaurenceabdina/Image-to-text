import { useMemo, useState } from "react";
import type { OcrResult } from "../lib/ocr";

interface ResultPanelProps {
  result: OcrResult;
  onReset: () => void;
}

export default function ResultPanel({ result, onReset }: ResultPanelProps) {
  const [minScore, setMinScore] = useState(0);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () => result.lines.filter((line) => line.score >= minScore),
    [result, minScore],
  );
  const filteredText = useMemo(
    () => filtered.map((line) => line.text).join("\n"),
    [filtered],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(filteredText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = filteredText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([filteredText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="result">
      <div className="result-head">
        <div>
          <h2>Extracted text</h2>
          <p className="muted">
            {filtered.length} of {result.lines.length} lines ·{" "}
            {(result.totalMs / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="result-actions">
          <button type="button" className="btn" onClick={copy}>
            {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" className="btn ghost" onClick={download}>
            Download .txt
          </button>
          <button type="button" className="btn ghost" onClick={onReset}>
            New image
          </button>
        </div>
      </div>

      <label className="filter">
        <span>
          Min confidence: <strong>{minScore.toFixed(2)}</strong>
        </span>
        <input
          type="range"
          min="0"
          max="0.99"
          step="0.01"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
        />
      </label>

      <textarea
        className="result-text"
        readOnly
        value={filteredText}
        spellCheck={false}
        aria-label="Extracted text"
      />
    </div>
  );
}
