
import React, { useState } from 'react';
import { Copy, Download, RefreshCw, X, Plus, Check } from 'lucide-react';
import { UploadedImage, StockMetadata } from '../types';

interface MetadataEditorProps {
  image: UploadedImage;
  onUpdate: (id: string, metadata: StockMetadata) => void;
  onRegenerate: (id: string) => void;
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({ image, onUpdate, onRegenerate }) => {
  const [newTag, setNewTag] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!image.metadata) return null;

  const { title, description, keywords } = image.metadata;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const removeTag = (tag: string) => {
    onUpdate(image.id, {
      ...image.metadata!,
      keywords: keywords.filter(k => k !== tag)
    });
  };

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag && !keywords.includes(newTag)) {
      onUpdate(image.id, {
        ...image.metadata!,
        keywords: [...keywords, newTag.trim()]
      });
      setNewTag('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-full">
      <div className="md:w-1/2 bg-slate-50 p-6 flex flex-col items-center justify-center border-r border-slate-200">
        <div className="relative group w-full h-full flex items-center justify-center">
          <img 
            src={image.previewUrl} 
            alt="Preview" 
            className="max-h-[500px] w-auto rounded-lg shadow-xl object-contain"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => onRegenerate(image.id)}
              className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
              title="Regenerate"
            >
              <RefreshCw size={18} className={image.status === 'processing' ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Metadata Editor</h2>
          <div className="flex gap-3">
             <button 
              onClick={() => handleCopy(keywords.join(', '), 'all')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
            >
              {copiedField === 'all' ? <Check size={18} /> : <Copy size={18} />}
              Copy All
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Title</label>
              <button onClick={() => handleCopy(title, 'title')} className="text-indigo-600 hover:text-indigo-700">
                {copiedField === 'title' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <input 
              value={title}
              onChange={(e) => onUpdate(image.id, { ...image.metadata!, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800"
            />
            <p className="text-right text-xs text-slate-400">{title.length} / 80 characters</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Description</label>
              <button onClick={() => handleCopy(description, 'description')} className="text-indigo-600 hover:text-indigo-700">
                {copiedField === 'description' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <textarea 
              value={description}
              rows={3}
              onChange={(e) => onUpdate(image.id, { ...image.metadata!, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 resize-none"
            />
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Keywords ({keywords.length})</label>
              <form onSubmit={addTag} className="flex gap-2">
                <input 
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="px-3 py-1 text-sm border-b border-slate-200 outline-none focus:border-indigo-500 transition-colors"
                />
                <button type="submit" className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                  <Plus size={18} />
                </button>
              </form>
            </div>
            
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 min-h-[200px]">
              {keywords.map((tag, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 group hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-default"
                >
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)}
                    className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataEditor;
