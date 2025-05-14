"use client";
import { useRef, useState } from "react";

const IMAGE_SRC = "/gui-elements.png";
const IMAGE_WIDTH = 192; // px, adjust to your actual image size
const IMAGE_HEIGHT = 304; // px, adjust to your actual image size

export default function SpriteToolPage() {
  const [selecting, setSelecting] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Mouse down: start selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const bounds = imgRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - bounds.left);
    const y = Math.round(e.clientY - bounds.top);
    setStart({ x, y });
    setRect(null);
    setSelecting(true);
  };

  // Mouse move: update selection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selecting || !start || !imgRef.current) return;
    const bounds = imgRef.current.getBoundingClientRect();
    let x2 = Math.round(e.clientX - bounds.left);
    let y2 = Math.round(e.clientY - bounds.top);
    // Clamp to image bounds
    x2 = Math.max(0, Math.min(x2, bounds.width));
    y2 = Math.max(0, Math.min(y2, bounds.height));
    const x = Math.min(start.x, x2);
    const y = Math.min(start.y, y2);
    const w = Math.abs(x2 - start.x);
    const h = Math.abs(y2 - start.y);
    setRect({ x, y, w, h });
  };

  // Mouse up: finish selection
  const handleMouseUp = () => {
    setSelecting(false);
  };

  // Copy CSS to clipboard
  const handleCopy = () => {
    if (!rect) return;
    const css = `width: ${rect.w}px; height: ${rect.h}px; background-position: -${rect.x}px -${rect.y}px;`;
    navigator.clipboard.writeText(css);
  };

  return (
    <div style={{ display: "flex", gap: 32, padding: 32 }}>
      {/* Image and selection overlay */}
      <div style={{ position: "relative", width: IMAGE_WIDTH, height: IMAGE_HEIGHT, userSelect: "none" }}>
        <img
          ref={imgRef}
          src={IMAGE_SRC}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          alt="gui-elements"
          style={{ display: "block", imageRendering: "pixelated", border: "1px solid #ccc" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          draggable={false}
        />
        {/* Selection rectangle */}
        {rect && (
          <div
            style={{
              position: "absolute",
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              border: "2px dashed #00f",
              background: "rgba(0, 128, 255, 0.2)",
              pointerEvents: "none",
            }}
          />
        )}
        {/* Overlay for mouse events */}
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            zIndex: 10,
            cursor: selecting ? "crosshair" : "pointer",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
      {/* CSS output panel */}
      <div style={{ minWidth: 320 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>CSS Output</h2>
        {rect ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <strong>width:</strong> {rect.w}px<br />
              <strong>height:</strong> {rect.h}px<br />
              <strong>background-position:</strong> -{rect.x}px -{rect.y}px
            </div>
            <div style={{ marginBottom: 12 }}>
              <code style={{ background: "#f4f4f4", padding: 8, borderRadius: 4, display: "block" }}>
                width: {rect.w}px; height: {rect.h}px; background-position: -{rect.x}px -{rect.y}px;
              </code>
            </div>
            <button onClick={handleCopy} style={{ padding: "6px 16px", fontSize: 16, cursor: "pointer" }}>Copy CSS</button>
          </>
        ) : (
          <div style={{ color: "#888" }}>Drag to select a region on the image.</div>
        )}
        <div style={{ marginTop: 32, fontSize: 12, color: "#888" }}>
          <div>Tip: Hold and drag on the image to select a sprite region.</div>
        </div>
      </div>
    </div>
  );
}