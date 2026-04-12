'use client';
import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface EvidenceUploaderProps {
  caseId: string;
  onUploaded?: () => void;
}

export function EvidenceUploader({ caseId, onUploaded }: EvidenceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    if (description) formData.append('description', description);

    try {
      await api.post('/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      setDescription('');
      onUploaded?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-[#D9D5C7] rounded-lg p-6 text-center cursor-pointer hover:border-[#F0A500] transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setFile(e.dataTransfer.files[0] ?? null);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.mp4,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Upload className="h-7 w-7 text-[#888] mx-auto mb-2" />
        {file ? (
          <p className="text-sm font-medium text-[#1B3A6B]">{file.name}</p>
        ) : (
          <p className="text-sm text-[#888]">Drop evidence file here or click to browse</p>
        )}
      </div>

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full text-sm border border-[#D9D5C7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-[#1B3A6B] hover:bg-[#152d55] text-white"
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</>
        ) : (
          <><Upload className="h-4 w-4 mr-2" />Upload Evidence</>
        )}
      </Button>
    </div>
  );
}
