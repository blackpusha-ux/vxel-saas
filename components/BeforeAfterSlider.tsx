'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  description?: string;
  initialPosition?: number; // 0 to 100
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Avant',
  afterLabel = 'Après',
  title,
  description,
  initialPosition = 50,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMouseMove, handleEnd, handleTouchMove]);

  return (
    <div className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/40 rounded-3xl p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between">
      {title && (
        <div className="space-y-1">
          <h4 className="text-base font-extrabold text-white">{title}</h4>
          {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
        </div>
      )}

      {/* Slider Container with Checkerboard */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[#2E2E2E]"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #1c1c1c 25%, transparent 25%), linear-gradient(-45deg, #1c1c1c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c1c 75%), linear-gradient(-45deg, transparent 75%, #1c1c1c 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#0F0F0F',
        }}
      >
        {/* Before Image (Bottom layer) */}
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* After Image (Top layer, clipped) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#F7941D] shadow-[0_0_12px_rgba(247,148,29,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Drag Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F7941D] text-black font-extrabold flex items-center justify-center shadow-xl border-2 border-black">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M8.5 7l-5 5 5 5V7zm7 0v10l5-5-5-5z" />
            </svg>
          </div>
        </div>

        {/* Labels Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 bg-[#F7941D] text-black text-[10px] font-black rounded-lg uppercase tracking-wider shadow-md">
            {afterLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
