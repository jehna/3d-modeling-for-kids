import React from "react";

interface FloatingToolbarProps {
  isRemoveMode: boolean;
  onToggleRemoveMode: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

const COLORS = [
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF",
  "#FF8000", "#8000FF", "#80FF00", "#00FF80", "#FF0080", "#0080FF",
  "#FFFFFF", "#C0C0C0", "#808080", "#000000"
];

export function FloatingToolbar({
  isRemoveMode,
  onToggleRemoveMode,
  currentColor,
  onColorChange,
}: FloatingToolbarProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        zIndex: 1000,
      }}
    >
      <button
        onClick={onToggleRemoveMode}
        style={{
          background: isRemoveMode ? "#ef4444" : "#22c55e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.2s ease",
        }}
      >
        {isRemoveMode ? "Remove Mode" : "Build Mode"}
      </button>
      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "4px",
        }}
      >
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            style={{
              width: "32px",
              height: "32px",
              background: color,
              border: currentColor === color ? "2px solid white" : "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              transform: currentColor === color ? "scale(1.1)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}