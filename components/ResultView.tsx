
import React, { useState, useRef, useCallback } from 'react';
import { CompareIcon } from './icons/CompareIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';

interface ResultViewProps {
  original: string;
  edited: string;
  prompt: string;
  isLast: boolean;
  referenceImageUrls?: string[];
  onAddNewMainImage?: () => void;
}

export const ResultView = React.forwardRef<HTMLDivElement, ResultViewProps>(({ original, edited, prompt, isLast, referenceImageUrls, onAddNewMainImage }, ref) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const showSlider = original !== edited;

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    
    setSliderPosition(percent);
  }, [isDragging]);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMouseLeave = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleMove(e.clientX);
  }, [handleMove]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = edited;
    const filename = `edited-${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div ref={ref} className="w-full max-w-2xl mx-auto bg-gray-800/20 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 animate-fade-in shadow-xl">
      <div 
        ref={imageContainerRef}
        className="relative w-full select-none overflow-hidden rounded-lg group"
        onMouseUp={showSlider ? handleMouseUp : undefined}
        onMouseLeave={showSlider ? handleMouseLeave : undefined}
        onMouseMove={showSlider ? handleMouseMove : undefined}
        onTouchEnd={showSlider ? handleMouseUp : undefined}
        onTouchMove={showSlider ? handleTouchMove : undefined}
      >
        {showSlider ? (
          <>
            <img 
              src={original} 
              alt="Original" 
              className="w-full h-auto object-contain pointer-events-none"
            />

            <div 
              className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none" 
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img 
                src={edited} 
                alt="Edited" 
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
            
            <div 
              className="absolute top-0 h-full w-1.5 bg-pink-500/70 cursor-ew-resize -translate-x-1/2" 
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            >
              <div 
                className="absolute top-1/2 -translate-y-1/2 -left-4 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg cursor-ew-resize transition-transform group-hover:scale-110"
                >
                <CompareIcon className="w-6 h-6" />
              </div>
            </div>
          </>
        ) : (
          <img 
            src={edited} 
            alt="Generated image" 
            className="w-full h-auto object-contain"
          />
        )}
      </div>
      
      <div className="bg-gray-950/50 border border-gray-700 rounded-md p-3 mt-4">
        <p className="text-white font-medium">{prompt}</p>
      </div>
      
      {referenceImageUrls && referenceImageUrls.length > 0 && (
        <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Reference Images Used:</p>
            <div className="flex items-center gap-2 flex-wrap">
                {referenceImageUrls.map((url, index) => (
                    <img 
                        key={index} 
                        src={url} 
                        alt={`Reference image ${index + 1}`} 
                        className="w-16 h-16 object-cover rounded-md border-2 border-gray-600"
                    />
                ))}
            </div>
        </div>
      )}

      <div className="mt-4 flex justify-end items-center gap-4">
          {onAddNewMainImage && (
            <button
              onClick={onAddNewMainImage}
              className="group flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-md transition-all duration-300"
            >
              <UploadIcon className="w-5 h-5" />
              New Image
            </button>
          )}
          <button
            onClick={handleDownload}
            className="group flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white font-semibold py-2 px-4 rounded-md transition-all duration-300"
          >
            <DownloadIcon className="w-5 h-5" />
            Download
          </button>
      </div>
    </div>
  );
});
