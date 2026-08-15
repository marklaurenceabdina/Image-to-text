import { useEffect, useRef } from "react";

export interface Box {
  poly: number[][];
  text: string;
  score: number;
}

interface ImagePreviewProps {
  imageUrl: string;
  boxes?: Box[];
}

function fitPoint(
  point: number[],
  scaleX: number,
  scaleY: number,
): { x: number; y: number } {
  return { x: point[0] * scaleX, y: point[1] * scaleY };
}

export default function ImagePreview({ imageUrl, boxes }: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (boxes && boxes.length > 0) {
        for (const box of boxes) {
          const pts = box.poly.map((p) => fitPoint(p, 1, 1));
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y);
          ctx.closePath();
          ctx.strokeStyle = "#22d3ee";
          ctx.lineWidth = Math.max(2, Math.round(img.width / 400));
          ctx.stroke();

          const minX = Math.min(...pts.map((p) => p.x));
          const minY = Math.min(...pts.map((p) => p.y));
          const label = `${box.text}  (${Math.round(box.score * 100)}%)`;
          ctx.font = `bold ${Math.max(12, Math.round(img.width / 90))}px Arial, sans-serif`;
          const tw = ctx.measureText(label).width;
          ctx.fillStyle = "rgba(11, 16, 32, 0.75)";
          ctx.fillRect(minX, minY - 20, tw + 8, 20);
          ctx.fillStyle = "#22d3ee";
          ctx.fillText(label, minX + 4, minY - 4);
        }
      }
    };
    img.src = imageUrl;
  }, [imageUrl, boxes]);

  return (
    <div className="preview">
      <canvas ref={canvasRef} className="preview-canvas" />
    </div>
  );
}
