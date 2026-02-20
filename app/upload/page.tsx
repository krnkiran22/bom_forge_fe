'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadBOMFile, startConversion } from '@/lib/api';
import Link from 'next/link';

import { UploadCloud, FileText, CheckCircle2, ChevronRight, LayoutDashboard, History } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File size must be less than 10MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Only .xlsx, .xls, and .csv files are supported');
      } else {
        setError('File upload failed. Please try again.');
      }
    },
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadResponse = await uploadBOMFile(file);
      if (!uploadResponse.success) throw new Error(uploadResponse.error || 'Upload failed');
      const uploadId = uploadResponse.data.uploadId;
      const conversionResponse = await startConversion(uploadId);
      if (!conversionResponse.success) throw new Error(conversionResponse.error || 'Conversion start failed');
      const conversionId = conversionResponse.data.conversionId;
      router.push(`/convert?conversionId=${conversionId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col font-sans">
      {/* Premium Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-lg mac-shadow" />
            <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">BOMForge <span className="text-teal-600">AI</span></span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/upload" className="text-sm font-bold text-teal-600 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Convert
            </Link>
            <Link href="/history" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
              <History className="w-4 h-4" /> History
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 container mx-auto">
        <div className="text-center mb-16 space-y-4 max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-[0.3em] border border-teal-100">
            Industrial Neural Mapping
          </span>
          <h1 className="text-7xl font-black text-[#1D1D1F] tracking-tight leading-[1.1]">
            Transformation <br />
            <span className="text-gradient-teal">Reimagined</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
            Upload your Engineering BOM and witness AI-driven manufacturing synthesis in real-time.
          </p>
        </div>

        {/* Upload Interface */}
        <div className="w-full max-w-2xl">
          <div className={`p-1 rounded-3xl bg-gradient-to-br from-white to-slate-200/50 mac-shadow transition-all duration-500 ${isDragActive ? 'scale-[1.02] ring-4 ring-teal-50' : ''}`}>
            <div
              {...getRootProps()}
              className={`
                  relative overflow-hidden rounded-[22px] border-2 border-dashed transition-all duration-300
                  ${file ? 'border-teal-400/50 bg-teal-50/20' : 'border-slate-300 bg-white/80 hover:bg-white'}
                  flex flex-col items-center justify-center p-20 cursor-pointer
                `}
            >
              <input {...getInputProps()} />

              {!file ? (
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mac-shadow group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {isDragActive ? 'Release to Import' : 'Drop Engineering BOM'}
                    </h3>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                        <FileText className="w-3 h-3" /> CSV
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-sm font-bold leading-none">📊</span> XLSX
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-sm font-bold leading-none">📉</span> XLS
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" className="rounded-full px-8 bg-slate-900 text-white hover:bg-black font-bold text-sm tracking-wide mac-btn">
                    Browse Filesystems
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center border-2 border-teal-100 mac-shadow relative">
                    <FileText className="w-12 h-12 text-teal-600" />
                    <CheckCircle2 className="w-8 h-8 text-green-500 absolute -top-3 -right-3 bg-white rounded-full p-1 border-2 border-green-100" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900 tracking-tight">{file.name}</p>
                    <p className="text-sm font-bold text-teal-600 uppercase tracking-widest mt-1">Ready for synthesis</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500">{formatFileSize(file.size)}</span>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold hover:bg-red-100 transition-colors">Discard</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm font-bold animate-pulse">
              {error}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`
                  w-full max-w-sm h-16 rounded-2xl text-lg font-black tracking-wide transition-all duration-300
                  ${file && !uploading
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white mac-shadow scale-105 hover:scale-110 active:scale-95'
                  : 'bg-slate-200 text-slate-400'}
                `}
            >
              {uploading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Neural Map...
                </span>
              ) : (
                <span className="flex items-center gap-2 uppercase">
                  Initialize Conversion <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-xl mac-shadow flex items-center justify-center text-teal-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Knowledge Graph Enhanced</h4>
            <p className="text-sm text-slate-500 leading-relaxed">System learns from your past corrections to automatically map complex parts with 98% accuracy.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-xl mac-shadow flex items-center justify-center text-teal-600">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Ultra-Fast Synthesis</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Processed in under 3 seconds per BOM, saving engineers over 8 hours of manual mapping per assembly.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-xl mac-shadow flex items-center justify-center text-teal-600">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Manufacturing Ready</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Direct export to Excel, CSV, and PDF optimized for ERP integration and floor operators.</p>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="py-12 border-t border-gray-200/50 bg-white/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-sm font-black text-slate-900 uppercase">Bomforge AI Systems</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-slate-900 transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
