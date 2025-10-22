import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CropIcon } from './icons/CropIcon';
import { UndoIcon } from './icons/UndoIcon';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  imageUrl: string;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, onSave, imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [undoData, setUndoData] = useState<ImageData | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (crop) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, crop.y);
      ctx.fillRect(0, crop.y, crop.x, crop.height);
      ctx.fillRect(crop.x + crop.width, crop.y, canvas.width - (crop.x + crop.width), crop.height);
      ctx.fillRect(0, crop.y + crop.height, canvas.width, canvas.height - (crop.y + crop.height));

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
    }
  }, [crop]);

  useEffect(() => {
    if (isOpen) {
      const canvas = canvasRef.current;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imageUrl;
      image.onload = () => {
        if (!canvas) return;
        imageRef.current = image;
        
        // Fit image within max dimensions while preserving aspect ratio
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.6;
        let { width, height } = image;
        const ratio = width / height;

        if (width > maxWidth) {
            width = maxWidth;
            height = width / ratio;
        }
        if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        draw();
      };
      // Reset state on open
      setCrop(null);
      setUndoData(null);
    }
  }, [isOpen, imageUrl, draw]);
  
  useEffect(() => {
    draw();
  }, [crop, draw]);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCanvasCoordinates(e);
    setIsCropping(true);
    setStartPoint({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
  };
  
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isCropping || !startPoint) return;
    const { x: endX, y: endY } = getCanvasCoordinates(e);
    const newCrop = {
      x: Math.min(startPoint.x, endX),
      y: Math.min(startPoint.y, endY),
      width: Math.abs(endX - startPoint.x),
      height: Math.abs(endY - startPoint.y),
    };
    setCrop(newCrop);
  };
  
  const handleMouseUp = () => {
    setIsCropping(false);
    setStartPoint(null);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !crop || crop.width === 0 || crop.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setUndoData(ctx.getImageData(0, 0, canvas.width, canvas.height));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = crop.width;
    tempCanvas.height = crop.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      image.src = tempCanvas.toDataURL();
    }
    setCrop(null);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || !undoData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The image needs to be reloaded from the original undo data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = undoData.width;
    tempCanvas.height = undoData.height;
    tempCanvas.getContext('2d')?.putImageData(undoData, 0, 0);
    
    if (imageRef.current) {
        imageRef.current.src = tempCanvas.toDataURL();
    }
    setUndoData(null);
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in-fast">
      <div 
        className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl p-6 max-w-fit w-full m-4 text-white flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">Image Editor</h2>
        
        <div className="flex items-center justify-center bg-gray-950/50 p-2 rounded-lg">
            <canvas
              ref={canvasRef}
              className="rounded-md cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            />
        </div>

        <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <button
                onClick={handleCrop}
                disabled={!crop || crop.width === 0 || crop.height === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-purple-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <CropIcon className="w-5 h-5" />
                Crop
            </button>
            <button
                onClick={handleUndo}
                disabled={!undoData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-purple-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <UndoIcon className="w-5 h-5" />
                Undo
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors font-semibold">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add animations
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-fast {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  .animate-fade-in-fast {
    animation: fade-in-fast 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);
