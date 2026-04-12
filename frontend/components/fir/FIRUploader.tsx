'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Case } from '@/types';

interface FIRUploaderProps {
  onSuccess: (caseData: Case) => void;
}

export function FIRUploader({ onSuccess }: FIRUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [firText, setFirText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a FIR file'); return; }
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (firText) formData.append('firText', firText);

    try {
      const res = await api.post('/fir/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      onSuccess(res.data.case);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="font-semibold text-[#1B3A6B]">FIR uploaded and processed successfully!</p>
        <p className="text-sm text-[#555]">AI agents have analysed your document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-[#D9D5C7] rounded-xl p-8 text-center cursor-pointer hover:border-[#F0A500] transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-[#1B3A6B]" />
            <div className="text-left">
              <p className="font-medium text-[#1A1A1A]">{file.name}</p>
              <p className="text-xs text-[#888]">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-[#888] mx-auto mb-3" />
            <p className="font-medium text-[#1A1A1A]">Drag & drop your FIR here</p>
            <p className="text-sm text-[#888] mt-1">or click to browse — PDF, TXT, DOC, JPG, PNG (max 10MB)</p>
          </>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-[#555] block mb-1">
          FIR Text (optional — paste or type if document text extraction needed)
        </label>
        <textarea
          value={firText}
          onChange={(e) => setFirText(e.target.value)}
          className="w-full h-28 text-sm border border-[#D9D5C7] rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          placeholder="Paste FIR text here for better AI parsing..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!file || uploading}
        className="w-full bg-[#1B3A6B] hover:bg-[#152d55] text-white"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Uploading & Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload FIR & Run AI Analysis
          </>
        )}
      </Button>
    </div>
  );
}
