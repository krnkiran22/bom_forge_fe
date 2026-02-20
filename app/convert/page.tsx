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

import { ConversionAnimation } from '@/components/ConversionAnimation';
import { BetaGate } from '@/components/BetaGate';

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

          if (response.data.status === 'completed') {
            setTimeout(() => {
              router.push(`/editor?conversionId=${conversionId}`);
            }, 3000); // Give more time to see the completion state
          }
        } else {
          setError(response.error || 'Failed to get status');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [conversionId, router]);

  const getCurrentStage = (): 'parsing' | 'analysis' | 'generation' | 'validation' | 'completed' => {
    if (!status) return 'parsing';
    if (status.status === 'completed') return 'completed';

    const stages = status.stages || {};
    if (stages.validation === 'in_progress') return 'validation';
    if (stages.generation === 'in_progress') return 'generation';
    if (stages.analysis === 'in_progress') return 'analysis';
    return 'parsing';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center p-4">
        <div className="p-12 glass-card rounded-3xl mac-shadow max-w-md w-full bg-white/70">
          <Alert variant="destructive" className="border-none bg-red-50 text-red-700">
            <AlertDescription className="font-semibold">{error}</AlertDescription>
          </Alert>
          <Link href="/upload" className="mt-8 block">
            <Button className="w-full bg-[#1D1D1F] text-white hover:bg-black h-12 rounded-xl mac-btn">
              Return to Upload
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col">
      {/* Premium Header */}
      <header className="border-b border-gray-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img src="/logo.png" alt="BOMForge AI Logo" className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">BOMForge <span className="text-teal-600">AI</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest border border-teal-100">
              Processing Link
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12 flex flex-col items-center justify-center max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-2 rounded-full bg-white/50 text-slate-500 text-xs font-bold uppercase tracking-[0.2em] border border-slate-100 mac-shadow animate-float">
            Intelligence in Motion
          </span>
          <h1 className="text-6xl font-black text-[#1D1D1F] tracking-tight leading-tight">
            {status?.status === 'completed'
              ? <span className="text-gradient-teal">Transformation Complete</span>
              : "Synthesizing your mBOM"}
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            {status?.status === 'completed'
              ? 'Engineering data has been successfully restructured for manufacturing production.'
              : 'Our neural multi-model engine is mapping your physical engineering constraints to manufacturing workflows.'}
          </p>
        </div>

        {/* The Star: 3D Animation Component */}
        {status ? (
          <div className="w-full relative py-8">
            <ConversionAnimation
              stage={getCurrentStage()}
              progress={status.progress}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-32">
            <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Neural Engine...</p>
          </div>
        )}

        {/* Bottom Insight Card */}
        {status?.status !== 'completed' && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="p-6 glass-card rounded-2xl bg-white/40 border border-white/20 mac-shadow">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Efficiency</h4>
              <p className="text-sm font-semibold text-slate-700">Converting 185 parts in &lt; 3 seconds using hybrid-rule logic.</p>
            </div>
            <div className="p-6 glass-card rounded-2xl bg-white/40 border border-white/20 mac-shadow">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Intelligence</h4>
              <p className="text-sm font-semibold text-slate-700">98% classification accuracy via Knowledge Graph enhancement.</p>
            </div>
            <div className="p-6 glass-card rounded-2xl bg-white/40 border border-white/20 mac-shadow">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Compliance</h4>
              <p className="text-sm font-semibold text-slate-700">Automatic validation across ISO-9001 manufacturing standards.</p>
            </div>
          </div>
        )}
      </main>

      {/* Simplified Footer */}
      <footer className="py-8 border-t border-gray-200/50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 BOMForge AI Systems — Enterprise Grade Engineering</p>
        </div>
      </footer>
    </div>
  );
}

export default function ConvertPage() {
  return (
    <BetaGate>
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
    </BetaGate>
  );
}
