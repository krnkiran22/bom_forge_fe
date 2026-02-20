'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Target, Shield, ArrowRight, BarChart3, Box, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FBFBFD] overflow-hidden">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
                <div className="container mx-auto px-6 h-18 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="BOMForge AI Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
                        <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">BOMForge <span className="text-teal-600">AI</span></span>
                    </Link>
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Platform</Link>
                        <Link href="#analytics" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Intelligence</Link>
                        <Link href="/history" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">History</Link>
                        <Link href="/upload">
                            <Button className="rounded-full px-8 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs tracking-[0.2em] h-12 mac-btn uppercase">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6">
                <div className="container mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <span className="inline-block px-5 py-2 rounded-full bg-teal-50 text-teal-700 text-[11px] font-black uppercase tracking-[0.4em] border border-teal-100 mac-shadow animate-float">
                            Enterprise Grade BOM Intelligence
                        </span>
                        <h1 className="text-8xl md:text-9xl font-black text-[#1D1D1F] tracking-tighter leading-[0.9] text-balance">
                            Engineered for <br />
                            <span className="text-gradient-teal">Production</span>
                        </h1>
                        <p className="text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
                            Automate the complex mapping between Engineering and Manufacturing Bill of Materials with neural-enhanced semantics and real-time validation.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                            <Link href="/upload">
                                <Button className="h-20 px-12 rounded-[24px] bg-slate-900 text-white hover:bg-black text-xl font-black tracking-tight group mac-btn flex items-center gap-3">
                                    Initialize First Conversion
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden mac-shadow">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="user" />
                                    </div>
                                ))}
                                <div className="pl-6 flex flex-col items-start justify-center">
                                    <span className="text-sm font-black text-slate-900 tracking-tight">Trusted by 500+ Engineers</span>
                                    <div className="flex gap-1 text-orange-400">
                                        {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Abstract 3D Background Visuals */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] pointer-events-none -z-10 opacity-40">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-[40px] border-slate-100 rounded-[200px] blur-3xl"
                    />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-[120px] animate-float" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[150px] animate-float" style={{ animationDelay: '2s' }} />
                </div>
            </section>

            {/* Feature Section */}
            <section id="features" className="py-32 px-6 bg-white border-y border-slate-100">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="space-y-6 group">
                            <div className="w-16 h-16 bg-teal-50 rounded-[20px] flex items-center justify-center text-teal-600 mac-shadow group-hover:bg-teal-500 group-hover:text-white transition-all duration-500">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Real-time Synthesis</h3>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">System handles thousands of parts in seconds, replacing hours of manual spreadsheet reconciliation with instant AI logic.</p>
                        </div>
                        <div className="space-y-6 group">
                            <div className="w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 mac-shadow group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                <Target className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Adaptive Learning</h3>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">Integrated Knowledge Graph remembers your specific assembly constraints and shop-floor rules for future accuracy.</p>
                        </div>
                        <div className="space-y-6 group">
                            <div className="w-16 h-16 bg-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-600 mac-shadow group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Verified Precision</h3>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">Cross-referenced validation ensures every part number, quantity, and work center is compliant with ERP standards.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Analytics Preview */}
            <section id="analytics" className="py-48 px-6 bg-[#FBFBFD]">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-24">
                        <div className="flex-1 space-y-8">
                            <span className="text-sm font-black text-teal-600 uppercase tracking-widest">Multi-Model Orchestration</span>
                            <h2 className="text-6xl font-black tracking-tighter text-[#1D1D1F] leading-tight">Human-in-the-Loop <br />Architecture</h2>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed">
                                We don't just generate data; we provide a collaborative interface. Review AI changes, provide feedback, and let the system evolve with your manufacturing expertise.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {[
                                    "Infinite BOM level nesting support",
                                    "Automatic work center classification",
                                    "Material specification normalization",
                                    "Delta-tracking between eBOM and mBOM"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-lg font-bold text-slate-700">
                                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="relative z-10 p-4 glass-card rounded-[40px] mac-shadow bg-white/40">
                                <div className="rounded-[28px] overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center p-12">
                                    <div className="w-full space-y-8">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-2">
                                                <div className="h-4 w-32 bg-slate-800 rounded-full" />
                                                <div className="h-8 w-64 bg-slate-700 rounded-full" />
                                            </div>
                                            <div className="h-20 w-20 bg-teal-500 rounded-2xl animate-pulse" />
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 items-end h-40">
                                            {[60, 80, 45, 90, 65, 85, 70, 95].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className="bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t-xl"
                                                />
                                            ))}
                                        </div>
                                        <div className="h-px bg-slate-800 w-full" />
                                        <div className="flex gap-4">
                                            <div className="h-10 flex-1 bg-slate-800 rounded-xl" />
                                            <div className="h-10 flex-1 bg-slate-800 rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-100 rounded-full blur-[80px] -z-10" />
                            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-100 rounded-full blur-[80px] -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-48 px-6">
                <div className="container mx-auto px-6 py-24 rounded-[60px] bg-[#1D1D1F] relative overflow-hidden text-center space-y-12 mac-shadow">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 opacity-50" />
                    <h2 className="text-7xl font-black text-white tracking-tighter relative z-10">Start your Digital <br />Transformation.</h2>
                    <div className="flex justify-center relative z-10 pt-8">
                        <Link href="/upload">
                            <Button className="h-24 px-16 rounded-full bg-white text-black hover:bg-slate-100 text-2xl font-black tracking-tight mac-btn uppercase">
                                Launch Dashboard
                            </Button>
                        </Link>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] relative z-10">Trusted by Global Manufacturing Leaders</p>
                </div>
            </section>

            <footer className="py-20 px-6 border-t border-slate-100 bg-white">
                <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4 gap-20">
                    <div className="col-span-2 lg:col-span-1 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img src="/logo.png" alt="BOMForge AI Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
                            <span className="text-xl font-bold tracking-tight text-slate-900">BOMForge <span className="text-teal-600">AI</span></span>
                        </Link>
                        <p className="text-slate-500 font-medium leading-relaxed">The next generation of Bill of Materials management. Built for modern factory orchestration and digital twin synchronization.</p>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                            <li><Link href="#" className="hover:text-teal-600 transition-colors">Neural Mapping</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 transition-colors">Knowledge Graph</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 transition-colors">API Access</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Company</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                            <li><Link href="#" className="hover:text-teal-600 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 transition-colors">Security</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 transition-colors">Status</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Legal</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                            <li><Link href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
