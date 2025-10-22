import React from 'react';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ReferenceImage {
  id: number;
  url: string;
}

interface ReferenceImagesProps {
  images: ReferenceImage[];
  onAddImages: (files: FileList) => void;
  onRemoveImage: (id: number) => void;
}

export const ReferenceImages: React.FC<ReferenceImagesProps> = ({ images, onAddImages, onRemoveImage }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onAddImages(event.target.files);
    }
    if(event.target) {
        event.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-4 animate-fade-in">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
        multiple
        aria-hidden="true"
      />
      {images.length > 0 && (
          <p className="text-sm text-gray-400 mb-2 font-semibold">Reference Images:</p>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        {images.map(image => (
          <div key={image.id} className="relative group flex-shrink-0">
            <img src={image.url} alt="Reference" className="w-20 h-20 object-cover rounded-md border-2 border-gray-600" />
            <button
              onClick={() => onRemoveImage(image.id)}
              className="absolute -top-2 -right-2 p-1 bg-gray-800 rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Remove image"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddClick}
          className="w-20 h-20 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-teal-500 hover:text-teal-400 transition-colors"
          aria-label="Add reference images"
        >
          <PlusCircleIcon className="w-8 h-8" />
          <span className="text-xs mt-1 font-medium">Add Ref</span>
        </button>
      </div>
    </div>
  );
};