'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getConversionHistory, deleteConversion } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search, Calendar, FileText, Trash2, ArrowRight,
    LayoutDashboard, Sparkles, Filter, ChevronRight,
    Database, Clock, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const response = await getConversionHistory(1, 100);
            if (response.success) {
                setHistory(response.data.conversions);
            }
        } catch (err) {
            setError('Failed to fetch conversion history');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this conversion permanentely?')) {
            try {
                await deleteConversion(id);
                setHistory(prev => prev.filter(h => h.conversionId !== id));
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const filteredHistory = history.filter(item =>
        item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.conversionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FBFBFD] flex flex-col font-sans">
            {/* Premium Header */}
            <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="BOMForge AI Logo" className="w-8 h-8 object-contain drop-shadow-sm transition-transform group-hover:scale-110" />
                        <span className="text-xl font-bold tracking-tight text-slate-900">BOMForge <span className="text-teal-600">AI</span></span>
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link href="/upload" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" /> Convert
                        </Link>
                        <Link href="/history" className="text-sm font-bold text-teal-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> History
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 pt-32 pb-20 px-6 container mx-auto max-w-6xl">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <span className="inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            Synthesis Repository
                        </span>
                        <h1 className="text-6xl font-black text-[#1D1D1F] tracking-tighter leading-none">
                            Conversion <br />
                            <span className="text-gradient-teal">Archives</span>
                        </h1>
                    </div>

                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search archives..."
                            className="pl-12 h-14 bg-white border-slate-200 rounded-2xl mac-shadow text-sm font-medium focus:ring-2 focus:ring-teal-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Digital Twin Ledger...</p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center space-y-8 mac-shadow">
                        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto text-slate-200">
                            <Database className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight text-slate-900">Archive matches empty</h3>
                            <p className="text-slate-500 font-medium">No previous BOM syntheses found in your organization's environment.</p>
                        </div>
                        <Link href="/upload">
                            <Button className="h-14 px-10 rounded-2xl bg-slate-900 text-white hover:bg-black font-black uppercase text-xs tracking-widest mac-btn">
                                Launch First Session
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredHistory.map((item) => (
                            <div
                                key={item.conversionId}
                                className="group bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-teal-200 transition-all duration-500 hover:scale-[1.01] mac-shadow-sm"
                            >
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold tracking-tight text-slate-900">{item.filename || 'Untitled Assembly'}</h3>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-black uppercase tracking-tighter">Verified</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> {item.itemsCount || 0} Nodes</span>
                                            <span className="text-teal-600">ID: {item.conversionId.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDelete(item.conversionId)}
                                        className="h-14 w-14 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                    <Link href={`/editor?conversionId=${item.conversionId}`} className="flex-1 md:flex-none">
                                        <Button className="w-full h-14 px-8 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:border-slate-900 hover:bg-slate-50 font-black uppercase text-[11px] tracking-widest transition-all group-hover:mac-shadow">
                                            Re-Open Studio <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="py-12 border-t border-gray-100 bg-white/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-sm font-black text-slate-900 uppercase">Archive Management v4.0</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">All syntheses are versioned and stored in the enterprise neural cloud.</p>
                </div>
            </footer>
        </div>
    );
}
