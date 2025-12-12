import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Sidebar from './components/Sidebar';
import ResultDisplay from './components/ResultDisplay';
import { removeWatermark } from './services/geminiService';
import { AppState, ImageItem } from './types';
import { AlertTriangle, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    apiKey: '',
    images: [],
    selectedId: null,
    isBatchProcessing: false,
  });

  const setApiKey = (key: string) => {
    setState(prev => ({ ...prev, apiKey: key }));
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    
    const newImages: ImageItem[] = [];
    const promises: Promise<void>[] = [];

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const match = result.match(/^data:(.+);base64,(.+)$/);
          if (match) {
            newImages.push({
              id: Math.random().toString(36).substring(2) + Date.now().toString(36),
              original: match[2],
              mimeType: match[1],
              processed: null,
              status: 'PENDING',
              error: null,
              name: file.name
            });
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    });

    Promise.all(promises).then(() => {
      setState(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        selectedId: prev.selectedId || (newImages.length > 0 ? newImages[0].id : prev.selectedId)
      }));
    });
  };

  const updateImageStatus = (id: string, updates: Partial<ImageItem>) => {
    setState(prev => ({
      ...prev,
      images: prev.images.map(img => img.id === id ? { ...img, ...updates } : img)
    }));
  };

  const handleRemoveImage = (id: string) => {
    setState(prev => {
      const newImages = prev.images.filter(img => img.id !== id);
      return {
        ...prev,
        images: newImages,
        selectedId: prev.selectedId === id ? (newImages.length > 0 ? newImages[0].id : null) : prev.selectedId
      };
    });
  };

  const processImage = async (id: string) => {
    const img = state.images.find(i => i.id === id);
    if (!img || !state.apiKey) return;

    updateImageStatus(id, { status: 'PROCESSING', error: null });

    try {
      const processedBase64 = await removeWatermark(state.apiKey, img.original, img.mimeType);
      updateImageStatus(id, { 
        status: 'SUCCESS', 
        processed: processedBase64 
      });
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || "Failed";
      
      if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED')) {
        errorMessage = "Permission Denied. Check API Key.";
      } else if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "Quota Exceeded (429). Please wait.";
      }

      updateImageStatus(id, { 
        status: 'ERROR', 
        error: errorMessage
      });
    }
  };

  const handleProcessAll = async () => {
    if (!state.apiKey) return;
    
    setState(prev => ({ ...prev, isBatchProcessing: true }));

    const toProcess = state.images.filter(img => img.status === 'PENDING' || img.status === 'ERROR');
    
    // SEQUENTIAL PROCESSING (Queue)
    // We process one by one to avoid 429 Resource Exhausted errors on Free Tier
    for (const img of toProcess) {
      // Select the current image so the user sees what's happening
      setState(prev => ({ ...prev, selectedId: img.id }));
      
      await processImage(img.id);
      
      // Add a small delay between requests to be kind to the API rate limiter
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setState(prev => ({ ...prev, isBatchProcessing: false }));
  };

  const selectedImage = state.images.find(img => img.id === state.selectedId) || null;
  const canProcess = Boolean(state.apiKey && !state.isBatchProcessing);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 font-sans text-gray-100">
      <Header apiKey={state.apiKey} setApiKey={setApiKey} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
        
        {/* Intro / API Key Warning */}
        {state.images.length === 0 && (
          <div className="text-center py-12 px-4">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              Batch Watermark Remover
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Upload multiple images and let AI reconstruct the background. 
            </p>
            
            <div className="grid gap-4 max-w-2xl mx-auto md:grid-cols-2">
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 flex items-start text-left gap-3">
                 <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                 <div className="text-sm text-blue-200/90">
                    <p className="font-semibold text-blue-100 mb-1">Privacy Focused</p>
                    <p>Your API key is used directly from your browser to Google's servers. We never store or see your key or images.</p>
                 </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4 flex items-start text-left gap-3">
                 <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                 <div className="text-sm text-yellow-200/90">
                    <p className="font-semibold text-yellow-100 mb-1">API Usage & Safety</p>
                    <p>Requires a valid Gemini API Key. Free keys have strict rate limits, so we process images one by one.</p>
                 </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-6">
              Model: <code>gemini-2.5-flash-image</code> • Preserves Aspect Ratio • Queue Processing
            </p>
          </div>
        )}

        {/* Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {state.images.length === 0 ? (
            <div className="w-full max-w-2xl mx-auto h-[300px]">
              <ImageUploader onFilesSelected={handleFilesSelected} />
            </div>
          ) : (
            <>
              {/* Sidebar List */}
              <div className="lg:flex-shrink-0">
                <Sidebar 
                  images={state.images}
                  selectedId={state.selectedId}
                  onSelect={(id) => setState(prev => ({ ...prev, selectedId: id }))}
                  onRemove={handleRemoveImage}
                  onAddFiles={handleFilesSelected}
                  onProcessAll={handleProcessAll}
                  isBatchProcessing={state.isBatchProcessing}
                />
              </div>

              {/* Main Editor Area */}
              <div className="flex-1 min-w-0">
                <ResultDisplay 
                  item={selectedImage}
                  onProcess={() => selectedImage && processImage(selectedImage.id)}
                  canProcess={canProcess}
                  hasApiKey={!!state.apiKey}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
