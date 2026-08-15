import { useRef, useState } from "react";

interface ImagePickerProps {
  onImage: (file: File) => void;
  disabled?: boolean;
}

function makeSampleFile(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 700;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#16181d";
    ctx.font = "bold 72px Arial, sans-serif";
    ctx.fillText("Hello, PaddleOCR!", 70, 190);
    ctx.font = "54px Arial, sans-serif";
    ctx.fillText("Mabuhay! Kumusta ka na?", 70, 330);
    ctx.fillText("This text is being extracted", 70, 470);
    ctx.fillText("from a generated sample image.", 70, 610);
    canvas.toBlob(
      (blob) => {
        resolve(new File([blob!], "sample.png", { type: "image/png" }));
      },
      "image/png",
    );
  });
}

export default function ImagePicker({ onImage, disabled }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File | undefined | null) => {
    if (file && file.type.startsWith("image/")) {
      onImage(file);
    }
  };

  return (
    <div
      className={`picker${dragging ? " dragging" : ""}${disabled ? " disabled" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="picker-icon">🖼️</div>
      <p className="picker-title">Drop an image here</p>
      <p className="picker-sub">or click to browse your files</p>
      <div className="picker-actions">
        <button
          type="button"
          className="btn"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Choose image
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={async (e) => {
            e.stopPropagation();
            onImage(await makeSampleFile());
          }}
        >
          Try a sample
        </button>
      </div>
    </div>
  );
}
