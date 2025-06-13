import React, { useState } from "react";
import {
  Plus,
  Minus,
  Palette,
  Download,
  RotateCcw,
  Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernToolbarProps {
  isRemoveMode: boolean;
  onToggleRemoveMode: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

export const COLORS = [
  "#ffffff",
  "#f1f5f9",
  "#e2e8f0",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
];

export const INITIAL_COLOR = COLORS[8];

export function ModernToolbar({
  isRemoveMode,
  onToggleRemoveMode,
  currentColor,
  onColorChange,
}: ModernToolbarProps) {
  const [showColors, setShowColors] = useState(false);

  return (
    <>
      {/* Main Toolbar */}
      <div className="fixed top-6 left-6 z-50">
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
          {/* Mode Buttons */}
          <button
            onClick={onToggleRemoveMode}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
              !isRemoveMode
                ? "bg-white text-black shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
            title="Build Mode"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleRemoveMode}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
              isRemoveMode
                ? "bg-red-500 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
            title="Remove Mode"
          >
            <Minus className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Color Picker Button */}
          <button
            onClick={() => setShowColors(!showColors)}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
            title="Choose Color"
          >
            <div className="absolute inset-0 rounded-xl border-2 border-transparent">
              <div
                className="w-full h-full rounded-xl border-2 border-white/30"
                style={{ backgroundColor: currentColor }}
              />
            </div>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 mx-1" />

          {/* Action Buttons */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            title="Export STL"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            title="Clear All"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Color Palette */}
      {showColors && (
        <div className="fixed top-20 left-6 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
            <div
              className="grid grid-cols-8 gap-2 max-w-[315px]"
              style={{ padding: "9px 7px" }}
            >
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onColorChange(color);
                    setShowColors(false);
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110",
                    currentColor === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110"
                      : "hover:ring-1 hover:ring-white/50"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Bar - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 shadow-2xl">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-sm text-white/90 font-medium">
              {isRemoveMode ? "Remove" : "Build"}
            </span>
          </div>
        </div>
      </div>

      {/* Click outside to close color picker */}
      {showColors && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowColors(false)}
        />
      )}
    </>
  );
}
