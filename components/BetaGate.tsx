'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldAlert, X } from 'lucide-react';
import { Button } from './ui/button';

export const BetaGate = ({ children }: { children: React.ReactNode }) => {
    const [showGate, setShowGate] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const env = process.env.NEXT_PUBLIC_APP_ENV;
        if (env !== 'dev') {
            setShowGate(true);
        }
    }, []);

    if (!showGate || isDismissed) return <>{children}</>;

    return (
        <div className="relative min-h-screen">
            <div className="filter blur-sm pointer-events-none select-none">
                {children}
            </div>

            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-lg bg-white rounded-[40px] mac-shadow overflow-hidden relative"
                >
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="absolute top-6 right-6 group transition-transform active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-900 transition-colors">
                            <X className="w-5 h-5" />
                        </div>
                    </button>

                    <div className="p-12 text-center space-y-8">
                        <div className="w-24 h-24 bg-amber-50 rounded-[32px] flex items-center justify-center mx-auto border-2 border-amber-100 mac-shadow animate-float">
                            <ShieldAlert className="w-12 h-12 text-amber-500" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                                Private Beta <br />
                                <span className="text-amber-500">Access Restricted</span>
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed px-4">
                                BOMForge AI is currently in early-access synthesis mode. Conversions are restricted to verified industrial partners.
                            </p>
                        </div>

                        <div className="pt-4">
                            <a href="mailto:kiradev2210@gmail.com" className="block p-1 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 mac-shadow hover:scale-[1.02] transition-transform group">
                                <div className="bg-slate-900 rounded-xl py-5 px-8 flex items-center justify-center gap-3">
                                    <Mail className="w-5 h-5 text-teal-400" />
                                    <span className="text-white font-black uppercase text-xs tracking-[0.2em]">Request Credentials</span>
                                </div>
                            </a>
                            <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Direct Inquiries: <span className="text-slate-900">kiradev2210@gmail.com</span>
                            </p>
                        </div>
                    </div>

                    <div className="h-2 bg-gradient-to-r from-amber-400 via-teal-500 to-emerald-400" />
                </motion.div>
            </div>
        </div>
    );
};
