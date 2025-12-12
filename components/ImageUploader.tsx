import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onFilesSelected: (files: FileList | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelected }) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(event.target.files);
  }, [onFilesSelected]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onFilesSelected(event.dataTransfer.files);
  }, [onFilesSelected]);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full min-h-[400px]"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex-1 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-800/30 hover:bg-gray-800/50 hover:border-brand-500/50 transition-all cursor-pointer group relative overflow-hidden">
        <label className="absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer">
          <div className="p-5 bg-gray-800 rounded-full mb-6 group-hover:scale-110 group-hover:bg-gray-700 transition-all duration-300 shadow-xl shadow-black/20">
            <Upload className="w-10 h-10 text-gray-400 group-hover:text-brand-500 transition-colors" />
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Upload Images</h3>
          <p className="text-gray-400 text-sm mb-6 text-center max-w-xs">
            Drag & drop multiple images here, or click to browse.
          </p>
          <div className="flex gap-2 text-xs text-gray-500 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-700/50">
            <span>JPG</span>
            <span className="w-px h-3 bg-gray-700 my-auto"></span>
            <span>PNG</span>
            <span className="w-px h-3 bg-gray-700 my-auto"></span>
            <span>WEBP</span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;