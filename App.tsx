import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Uploader from './components/Uploader';
import MetadataEditor from './components/MetadataEditor';
import { UploadedImage, StockMetadata, ViewMode } from './types';
import { generateImageMetadata } from './services/geminiService';
// Added Plus icon to the imports
import { Search, Grid, List, Download, Loader2, Image as ImageIcon, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('upload');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedImage = images.find(img => img.id === selectedImageId);

  const processImage = async (image: UploadedImage) => {
    setImages(prev => prev.map(img => img.id === image.id ? { ...img, status: 'processing' } : img));

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(image.file);
      const base64 = await base64Promise;

      const metadata = await generateImageMetadata(base64, image.file.type);
      setImages(prev => prev.map(img => img.id === image.id ? { 
        ...img, 
        metadata, 
        status: 'completed' 
      } : img));
    } catch (err: any) {
      setImages(prev => prev.map(img => img.id === image.id ? { 
        ...img, 
        status: 'error', 
        error: err.message || 'Analysis failed' 
      } : img));
    }
  };

  const handleUpload = (files: FileList) => {
    const newImages: UploadedImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
    }));

    setImages(prev => [...newImages, ...prev]);
    setView('editor');
    
    // Auto-process the first one and select it
    if (newImages.length > 0) {
      setSelectedImageId(newImages[0].id);
      newImages.forEach(img => processImage(img));
    }
  };

  const updateMetadata = (id: string, metadata: StockMetadata) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, metadata } : img));
  };

  const downloadCsv = () => {
    const header = ['Filename', 'Title', 'Description', 'Keywords'];
    const rows = images
      .filter(img => img.status === 'completed' && img.metadata)
      .map(img => [
        img.file.name,
        `"${img.metadata!.title.replace(/"/g, '""')}"`,
        `"${img.metadata!.description.replace(/"/g, '""')}"`,
        `"${img.metadata!.keywords.join(', ').replace(/"/g, '""')}"`
      ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [header, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stock_metadata.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredImages = images.filter(img => 
    img.file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.metadata?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar currentView={view} setView={setView} />

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {view === 'upload' ? 'New Generation' : 
               view === 'editor' ? 'Image Dashboard' : 'Project History'}
            </h1>
            <p className="text-slate-500 mt-1">
              {images.length} assets in this session
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-64"
              />
            </div>
            {images.some(img => img.status === 'completed') && (
              <button 
                onClick={downloadCsv}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
              >
                <Download size={20} />
                Export CSV
              </button>
            )}
          </div>
        </header>

        {view === 'upload' ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Uploader 
              onUpload={handleUpload} 
              isProcessing={images.some(i => i.status === 'processing')} 
            />
            
            {images.length > 0 && (
              <div className="mt-12 w-full max-w-4xl">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Uploads</h2>
                <div className="grid grid-cols-4 gap-4">
                  {images.slice(0, 8).map(img => (
                    <div 
                      key={img.id}
                      onClick={() => { setView('editor'); setSelectedImageId(img.id); }}
                      className="aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-indigo-500 cursor-pointer transition-all relative group"
                    >
                      <img src={img.previewUrl} className="w-full h-full object-cover" alt="prev" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-8 h-[calc(100vh-200px)]">
            {/* Asset List Sidebar */}
            <div className="w-80 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Assets</span>
                <button 
                  onClick={() => setView('upload')}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredImages.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageId(img.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      selectedImageId === img.id ? 'bg-indigo-50 ring-1 ring-indigo-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                      <img src={img.previewUrl} className="w-full h-full object-cover" alt="Asset" />
                      {img.status === 'processing' && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <Loader2 size={16} className="text-indigo-600 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {img.metadata?.title || img.file.name}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {img.status}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 min-w-0 h-full">
              {selectedImage ? (
                <MetadataEditor 
                  image={selectedImage} 
                  onUpdate={updateMetadata}
                  onRegenerate={processImage}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                  <ImageIcon size={64} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">Select an asset to edit its metadata</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;