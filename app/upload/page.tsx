'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadBOMFile, startConversion } from '@/lib/api';
import Link from 'next/link';

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
    maxSize: 10 * 1024 * 1024, // 10MB
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
      // Upload file
      const uploadResponse = await uploadBOMFile(file);
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'Upload failed');
      }

      const uploadId = uploadResponse.data.uploadId;

      // Start conversion
      const conversionResponse = await startConversion(uploadId);
      if (!conversionResponse.success) {
        throw new Error(conversionResponse.error || 'Conversion start failed');
      }

      const conversionId = conversionResponse.data.conversionId;

      // Redirect to processing page
      router.push(`/convert?conversionId=${conversionId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-orange-500 rounded-lg" />
            <span className="text-2xl font-bold text-slate-800">BOMForge AI</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-slate-600 hover:text-slate-900">Home</Link>
            <Link href="/upload" className="text-teal-600 font-semibold">Convert</Link>
            <Link href="/history" className="text-slate-600 hover:text-slate-900">History</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Upload Your eBOM</h1>
          <p className="text-lg text-slate-600">
            Upload your Engineering BOM file and let AI transform it into a Manufacturing BOM
          </p>
        </div>

        <Card className="p-8">
          {/* File Upload Zone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
              ${isDragActive 
                ? 'border-teal-500 bg-teal-50' 
                : file 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {!file ? (
                <>
                  <svg
                    className="w-16 h-16 text-slate-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-xl font-semibold text-slate-700 mb-2">
                    {isDragActive ? 'Drop your file here' : 'Drag and drop your eBOM file here'}
                  </p>
                  <p className="text-slate-500 mb-4">or click to browse</p>
                  <p className="text-sm text-slate-400">
                    Supported formats: .xlsx, .xls, .csv (Max 10MB)
                  </p>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <svg
                    className="w-12 h-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-lg py-6"
              size="lg"
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Upload and Convert'
              )}
            </Button>
            {file && !uploading && (
              <Button
                onClick={handleRemove}
                variant="outline"
                className="text-lg py-6"
                size="lg"
              >
                Remove File
              </Button>
            )}
          </div>
        </Card>

        {/* Format Requirements */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold text-slate-900 mb-3">📋 File Format Requirements</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• File must contain columns: <code className="bg-slate-100 px-2 py-1 rounded">Part Number</code>, <code className="bg-slate-100 px-2 py-1 rounded">Description</code>, <code className="bg-slate-100 px-2 py-1 rounded">Quantity</code></li>
            <li>• Optional columns: Material, BOM Level, Notes</li>
            <li>• First row should be column headers</li>
            <li>• Maximum file size: 10MB</li>
            <li>• Supported formats: Excel (.xlsx, .xls) and CSV (.csv)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
