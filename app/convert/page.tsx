'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getConversionStatus } from '@/lib/api';
import { ConversionStatus } from '@/lib/types';

function ConversionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversionId = searchParams.get('conversionId');

  const [status, setStatus] = useState<ConversionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversionId) {
      setError('No conversion ID provided');
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await getConversionStatus(conversionId);
        if (response.success && response.data) {
          setStatus(response.data);

          // Redirect to editor when complete
          if (response.data.status === 'completed') {
            setTimeout(() => {
              router.push(`/editor?conversionId=${conversionId}`);
            }, 1500);
          }
        } else {
          setError(response.error || 'Failed to get status');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [conversionId, router]);

  const getStageInfo = (stageName: string) => {
    const stages = {
      parsing: {
        icon: '📄',
        title: 'File Parsing',
        description: 'Parsing eBOM structure...',
      },
      analysis: {
        icon: '🤖',
        title: 'AI Analysis',
        description: 'AI analyzing parts and relationships...',
      },
      generation: {
        icon: '⚙️',
        title: 'mBOM Generation',
        description: 'Generating manufacturing BOM...',
      },
      validation: {
        icon: '✅',
        title: 'Validation',
        description: 'Validating output...',
      },
    };
    return stages[stageName as keyof typeof stages] || stages.parsing;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Link href="/upload" className="mt-4 block">
            <Button className="w-full">Try Again</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-orange-500 rounded-lg" />
            <span className="text-2xl font-bold text-slate-800">BOMForge AI</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {status.status === 'completed' ? 'Conversion Complete! 🎉' : 'Converting Your BOM'}
          </h1>
          <p className="text-lg text-slate-600">
            {status.status === 'completed'
              ? 'Redirecting to editor...'
              : 'AI is transforming your eBOM into a manufacturing-ready mBOM'}
          </p>
        </div>

        <Card className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm font-bold text-teal-600">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-3" />
            {status.estimatedTimeRemaining !== undefined && status.estimatedTimeRemaining > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Estimated time remaining: ~{Math.ceil(status.estimatedTimeRemaining)} seconds
              </p>
            )}
          </div>

          {/* Processing Stages */}
          <div className="space-y-4">
            {Object.entries(status.stages).map(([stageName, stageStatus]) => {
              const stageInfo = getStageInfo(stageName);
              const isCompleted = stageStatus === 'completed';
              const isInProgress = stageStatus === 'in_progress';
              const isPending = stageStatus === 'pending';

              return (
                <div
                  key={stageName}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-300
                    ${isCompleted ? 'bg-green-50 border-green-400' : ''}
                    ${isInProgress ? 'bg-teal-50 border-teal-400 animate-pulse' : ''}
                    ${isPending ? 'bg-gray-50 border-gray-200' : ''}
                  `}
                >
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">{stageInfo.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{stageInfo.title}</h3>
                      <p className="text-sm text-slate-600">
                        {isCompleted && '✓ Complete'}
                        {isInProgress && stageInfo.description}
                        {isPending && 'Pending...'}
                      </p>
                    </div>
                    {isCompleted && (
                      <svg
                        className="w-6 h-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {isInProgress && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          {status.status === 'completed' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-400 rounded-lg">
              <div className="flex items-center">
                <span className="text-3xl mr-4">🎉</span>
                <div>
                  <h4 className="font-bold text-slate-900">Conversion Successful!</h4>
                  <p className="text-sm text-slate-600">Redirecting to interactive editor...</p>
                </div>
              </div>
            </div>
          )}

          {status.status === 'failed' && (
            <div className="mt-6">
              <Alert variant="destructive">
                <AlertDescription>
                  {status.errorMessage || 'Conversion failed. Please try again.'}
                </AlertDescription>
              </Alert>
              <Link href="/upload" className="mt-4 block">
                <Button className="w-full">Upload New File</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ConvertPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <ConversionContent />
    </Suspense>
  );
}
