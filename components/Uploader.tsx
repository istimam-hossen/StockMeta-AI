
import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface UploaderProps {
  onUpload: (files: FileList) => void;
  isProcessing: boolean;
}

const Uploader: React.FC<UploaderProps> = ({ onUpload, isProcessing }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative group h-96 border-2 border-dashed border-slate-300 rounded-[2rem] bg-white hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center p-12 text-center"
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-indigo-500">
          <Upload size={48} strokeWidth={1.5} />
        </div>

        <h3 className="text-3xl font-bold text-slate-800 mb-4">
          Drop your images here
        </h3>
        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
          We'll analyze your photos and generate the perfect SEO metadata for your stock portfolio.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-indigo-500" />
            AI Optimized Titles
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-indigo-500" />
            50 High-Value Keywords
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-indigo-500" />
            CSV Export Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploader;
