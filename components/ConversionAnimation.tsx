'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cpu, Database, CheckCircle2, Factory, Zap, Box, Layers } from 'lucide-react';

interface ConversionAnimationProps {
    stage: 'parsing' | 'analysis' | 'generation' | 'validation' | 'completed';
    progress: number;
}

const stages = [
    { id: 'parsing', label: 'Extracting eBOM Structure', icon: Database, color: 'text-blue-500' },
    { id: 'analysis', label: 'AI Semantic Analysis', icon: Cpu, color: 'text-purple-500' },
    { id: 'generation', label: 'Synthesizing mBOM Nodes', icon: Settings, color: 'text-teal-500' },
    { id: 'validation', label: 'Cross-Reference Validation', icon: Zap, color: 'text-amber-500' },
];

export function ConversionAnimation({ stage, progress }: ConversionAnimationProps) {
    const [dots, setDots] = useState<any[]>([]);

    useEffect(() => {
        // Generate some random floating particles for the 3D feel
        const newDots = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
        }));
        setDots(newDots);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto p-12 glass-card rounded-3xl mac-shadow overflow-hidden bg-white/40 backdrop-blur-xl border border-white/20">
            {/* 3D Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {dots.map((dot) => (
                    <motion.div
                        key={dot.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0.1, 0.4, 0.1],
                            scale: [1, 1.2, 1],
                            y: [0, -40, 0],
                            x: [0, Math.random() * 20 - 10, 0]
                        }}
                        transition={{
                            duration: dot.duration,
                            repeat: Infinity,
                            delay: dot.delay,
                        }}
                        style={{
                            position: 'absolute',
                            left: `${dot.x}%`,
                            top: `${dot.y}%`,
                            width: dot.size,
                            height: dot.size,
                            borderRadius: '50%',
                            backgroundColor: '#14b8a6', // teal
                            filter: 'blur(1px)',
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Main 3D Transformation Visual */}
                <div className="w-full flex justify-between items-center mb-16 relative">
                    {/* Left Side: eBOM Node */}
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            rotateY: stage === 'completed' ? 180 : 0
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center mac-shadow relative"
                    >
                        <Layers className="w-12 h-12 text-slate-400" />
                        <div className="absolute -bottom-8 text-xs font-bold text-slate-500 uppercase tracking-widest">eBOM Input</div>
                    </motion.div>

                    {/* Center: Processing Flow */}
                    <div className="flex-1 px-8 relative h-32 flex items-center justify-center">
                        {/* Connection Lines */}
                        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-slate-200 via-teal-400 to-slate-200" />

                        {/* Animated Pulses */}
                        <AnimatePresence>
                            {stage !== 'completed' && (
                                <motion.div
                                    initial={{ left: '0%', opacity: 0 }}
                                    animate={{ left: '100%', opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center"
                                >
                                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Stage Indicator */}
                        <div className="flex flex-col items-center">
                            <motion.div
                                key={stage}
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-white/80 p-6 rounded-2xl mac-shadow border border-white/50 backdrop-blur-md flex flex-col items-center gap-2"
                            >
                                {stage === 'completed' ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                                        {React.createElement(stages.find(s => s.id === stage)?.icon || Factory, {
                                            className: `w-12 h-12 ${stages.find(s => s.id === stage)?.color || 'text-teal-500'}`
                                        })}
                                    </motion.div>
                                )}
                                <span className="text-sm font-bold text-slate-800 text-center min-w-[200px]">
                                    {stage === 'completed' ? 'CONVERSION COMPLETE' : stages.find(s => s.id === stage)?.label}
                                </span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Side: mBOM Node */}
                    <motion.div
                        animate={{
                            y: [0, 10, 0],
                            scale: stage === 'completed' ? 1.1 : 1,
                            backgroundColor: stage === 'completed' ? '#f0fdfa' : '#fff'
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-32 h-32 rounded-2xl border flex items-center justify-center mac-shadow relative ${stage === 'completed' ? 'border-teal-300 ring-4 ring-teal-50/50' : 'border-slate-100 bg-white/40'
                            }`}
                    >
                        <Factory className={`w-12 h-12 ${stage === 'completed' ? 'text-teal-600' : 'text-slate-200'}`} />
                        <div className="absolute -bottom-8 text-xs font-bold text-teal-600 uppercase tracking-widest">mBOM Output</div>

                        {/* Completed Glow */}
                        {stage === 'completed' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-2xl bg-teal-400/20"
                            />
                        )}
                    </motion.div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full max-w-2xl bg-slate-100 rounded-full h-4 overflow-hidden mac-shadow relative mb-8">
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-emerald-400 group"
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                </div>

                {/* Process Steps */}
                <div className="grid grid-cols-4 gap-4 w-full px-4">
                    {stages.map((s, idx) => {
                        const isPast = stages.findIndex(curr => curr.id === stage) > idx || stage === 'completed';
                        const isCurrent = stage === s.id;

                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isPast ? 'bg-teal-500 text-white' : isCurrent ? 'bg-white text-teal-600 ring-2 ring-teal-500 mac-shadow' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isCurrent ? 'text-teal-600' : 'text-slate-400'}`}>
                                    {s.id}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
