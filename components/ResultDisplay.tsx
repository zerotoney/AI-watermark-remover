import React from 'react';
import { Download, Wand2, Loader2, ImageOff, CheckCircle2 } from 'lucide-react';
import { ImageItem } from '../types';

interface ResultDisplayProps {
  item: ImageItem | null;
  onProcess: () => void;
  canProcess: boolean;
  hasApiKey: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  item, 
  onProcess, 
  canProcess,
  hasApiKey
}) => {

  const handleDownload = () => {
    if (!item?.processed) return;
    const link = document.createElement('a');
    link.href = `data:${item.mimeType};base64,${item.processed}`;
    link.download = `watermark-removed-${item.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
        <Wand2 className="w-12 h-12 mb-3 opacity-20" />
        <p>Select an image from the queue to view or process</p>
      </div>
    );
  }

  const isProcessing = item.status === 'PROCESSING';
  const isSuccess = item.status === 'SUCCESS';
  const isError = item.status === 'ERROR';

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 px-4 flex items-center justify-between bg-gray-800/50">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-200 truncate max-w-[200px]">{item.name}</h2>
          {isSuccess && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full border border-green-900/50">Restored</span>}
        </div>
        
        <div className="flex items-center gap-2">
          {!isSuccess && !isProcessing && (
            <button
              onClick={onProcess}
              disabled={!canProcess}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                 canProcess 
                  ? 'bg-brand-600 hover:bg-brand-500 text-white' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              {isError ? 'Retry' : 'Process'}
            </button>
          )}
          
          {isSuccess && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-gray-700"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 relative flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
        
        {/* Original */}
        <div className="flex-1 relative bg-gray-950/50 group">
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded z-10 pointer-events-none">Original</span>
          <div className="w-full h-full p-4 flex items-center justify-center">
             <img 
              src={`data:${item.mimeType};base64,${item.original}`} 
              alt="Original" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* Processed Result */}
        <div className="flex-1 relative bg-gray-950/50">
          <span className="absolute top-3 left-3 bg-brand-900/80 backdrop-blur text-brand-100 text-xs px-2 py-1 rounded z-10 pointer-events-none">
            {isSuccess ? 'AI Result' : 'Output Preview'}
          </span>
          
          <div className="w-full h-full p-4 flex items-center justify-center">
            {isProcessing ? (
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto mb-3" />
                <p className="text-brand-200 font-medium animate-pulse">Removing watermark...</p>
              </div>
            ) : isError ? (
              <div className="text-center px-6">
                <ImageOff className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-400 font-medium mb-1">Processing Failed</p>
                <p className="text-red-400/60 text-xs">{item.error || 'Unknown error'}</p>
              </div>
            ) : isSuccess ? (
              <img 
                src={`data:${item.mimeType};base64,${item.processed}`} 
                alt="Processed" 
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            ) : (
              <div className="text-center text-gray-600">
                <Wand2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Click Process to start</p>
                {!hasApiKey && <p className="text-xs text-yellow-600 mt-2">API Key required</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;