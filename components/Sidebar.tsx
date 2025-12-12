import React, { useRef } from 'react';
import { Plus, Trash2, Play, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { ImageItem } from '../types';

interface SidebarProps {
  images: ImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddFiles: (files: FileList | null) => void;
  onProcessAll: () => void;
  isBatchProcessing: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  images,
  selectedId,
  onSelect,
  onRemove,
  onAddFiles,
  onProcessAll,
  isBatchProcessing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'PROCESSING': return <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />;
      default: return null;
    }
  };

  const pendingCount = images.filter(img => img.status === 'PENDING' || img.status === 'ERROR').length;

  return (
    <div className="w-full lg:w-64 flex flex-col bg-gray-900 border-r border-gray-800 h-[600px] rounded-l-xl overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-200 font-semibold mb-3">Image Queue ({images.length})</h3>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-sm text-white py-2 px-3 rounded-lg transition-colors border border-gray-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => {
              onAddFiles(e.target.files);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          />
          <button
            onClick={onProcessAll}
            disabled={isBatchProcessing || pendingCount === 0}
            className={`flex-1 flex items-center justify-center gap-2 text-sm text-white py-2 px-3 rounded-lg transition-colors ${
              isBatchProcessing || pendingCount === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-800'
                : 'bg-brand-600 hover:bg-brand-500 border border-brand-500'
            }`}
          >
            <Play className="w-4 h-4" />
            Process
          </button>
        </div>
      </div>

      {/* Image List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelect(img.id)}
            className={`group relative flex items-center p-2 rounded-lg cursor-pointer transition-all ${
              selectedId === img.id ? 'bg-gray-800 ring-1 ring-brand-500' : 'hover:bg-gray-800/50'
            }`}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded bg-gray-950 flex-shrink-0 overflow-hidden border border-gray-700 relative">
              <img 
                src={`data:${img.mimeType};base64,${img.original}`} 
                alt="thumb" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="ml-3 flex-1 min-w-0">
              <p className={`text-sm truncate ${selectedId === img.id ? 'text-white' : 'text-gray-400'}`}>
                {img.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(img.status)}
                <span className={`text-xs ${
                  img.status === 'ERROR' ? 'text-red-400' : 
                  img.status === 'SUCCESS' ? 'text-green-400' : 'text-gray-600'
                }`}>
                  {img.status === 'PENDING' ? 'Ready' : img.status}
                </span>
              </div>
            </div>

            {/* Remove Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(img.id);
              }}
              className="absolute right-2 top-2 p-1.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {images.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
            <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
            <p>No images in queue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;