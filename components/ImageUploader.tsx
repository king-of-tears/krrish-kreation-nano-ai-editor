import React, { useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export interface ImageUploaderRef {
  open: () => void;
}

export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(({ onImageUpload }, ref) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles.length > 0) {
      setError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: false,
  });

  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <div
      {...getRootProps()}
      className={`w-full max-w-lg cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
        isDragActive ? 'border-teal-400 bg-teal-950/40 scale-105' : 'border-sky-700 hover:border-teal-500 hover:bg-sky-950/30'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
        <UploadIcon className="w-12 h-12 text-gray-500" />
        {isDragActive ? (
          <p className="text-lg font-semibold">Drop the image here...</p>
        ) : (
          <>
            <p className="text-lg font-semibold">
              <span className="text-teal-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm">Supports: JPG, PNG, WEBP</p>
          </>
        )}
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
});