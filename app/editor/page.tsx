'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getBOMData, getExplanation, saveBOMEdits, submitFeedback } from '@/lib/api';
import { BOMItem, MBOMItem } from '@/lib/types';
import { DependencyGraph } from '@/components/DependencyGraph';
import { EnhancedAIPanel } from '@/components/EnhancedAIPanel';
import { EditableBOMItem } from '@/components/EditableBOMItem';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/utils/exportUtils';
import Link from 'next/link';
import { FeedbackModal } from '@/components/FeedbackModal';
import {
  Network, List, Download, Save, Plus, ArrowLeft, History, Filter,
  FileSpreadsheet, Settings2, Sparkles, ChevronDown, ChevronRight,
  Info, AlertTriangle, LayoutDashboard, Box, CheckCircle2
} from 'lucide-react';

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversionId = searchParams.get('conversionId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ebomItems, setEbomItems] = useState<BOMItem[]>([]);
  const [mbomItems, setMbomItems] = useState<MBOMItem[]>([]);
  const [explanation, setExplanation] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'graph'>('tree');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('mbom');
  const [stats, setStats] = useState({
    totalParts: 0,
    addedParts: 0,
    modifiedParts: 0,
    groupedParts: 0,
    unchangedParts: 0,
    avgConfidence: 0,
  });

  useEffect(() => {
    if (!conversionId) {
      setError('No conversion ID provided');
      setLoading(false);
      return;
    }
    loadConversionData();
  }, [conversionId]);

  const loadConversionData = async () => {
    try {
      setLoading(true);
      const [bomResponse, explanationResponse] = await Promise.all([
        getBOMData(conversionId!),
        getExplanation(conversionId!),
      ]);

      if (!bomResponse.success || !explanationResponse.success) throw new Error('Failed to load conversion data');

      const { ebomData, mbomData } = bomResponse.data;
      setEbomItems(ebomData?.items || []);
      setMbomItems(mbomData?.items || []);
      setExplanation(explanationResponse.data);

      const mbom = mbomData?.items || [];
      const added = mbom.filter((item: MBOMItem) => item.changeType === 'added').length;
      const modified = mbom.filter((item: MBOMItem) => item.changeType === 'modified').length;
      const grouped = mbom.filter((item: MBOMItem) => item.changeType === 'grouped').length;
      const unchanged = mbom.filter((item: MBOMItem) => item.changeType === 'unchanged').length;
      const avgConf = mbom.reduce((sum: number, item: MBOMItem) => sum + (item.confidence || 0), 0) / mbom.length;

      setStats({
        totalParts: mbom.length,
        addedParts: added,
        modifiedParts: modified,
        groupedParts: grouped,
        unchangedParts: unchanged,
        avgConfidence: Math.round(avgConf * 100),
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversion data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = (partNumber: string, updates: Partial<any>) => {
    setMbomItems(prev => prev.map(item => item.partNumber === partNumber ? { ...item, ...updates } : item));
    setHasUnsavedChanges(true);
  };

  const handleDeleteItem = (partNumber: string) => {
    setMbomItems(prev => prev.filter(item => item.partNumber !== partNumber));
    setHasUnsavedChanges(true);
  };

  const handleAddItem = () => {
    const newItem: MBOMItem = {
      id: `new-${Date.now()}`,
      partNumber: `MAN-P${mbomItems.length + 1}`,
      description: 'Newly synthesized manufacturing item',
      quantity: 1,
      level: 0,
      changeType: 'added',
      confidence: 1.0,
      reasoning: 'User initiated addition',
    };
    setMbomItems(prev => [...prev, newItem]);
    setHasUnsavedChanges(true);
  };

  const handleFeedback = async (partNumber: string, isPositive: boolean) => {
    if (isPositive) {
      try {
        await submitFeedback(conversionId!, [{
          itemId: partNumber, field: 'all', originalValue: 'ai_generated', correctedValue: 'confirmed', reasoning: 'User confirmed accuracy'
        }], true);
        alert('✅ AI Knowledge Graph Updated.');
      } catch (err) { console.error(err); }
    } else {
      const item = mbomItems.find(i => i.partNumber === partNumber);
      setFeedbackItem(item);
      setIsFeedbackModalOpen(true);
    }
  };

  const handleReorder = (partNumber: string, direction: 'up' | 'down') => {
    const index = mbomItems.findIndex(i => i.partNumber === partNumber);
    if (index === -1) return;
    const newItems = [...mbomItems];
    if (direction === 'up' && index > 0) [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    else if (direction === 'down' && index < newItems.length - 1) [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    else return;
    setMbomItems(newItems);
    setHasUnsavedChanges(true);
  };

  const onSubmitFeedback = async (feedback: any) => {
    try {
      await submitFeedback(conversionId!, [feedback], true);
      alert('🚀 Semantic learning update submitted.');
    } catch (err) { alert('❌ Submission failed'); }
  };

  const handleResetChanges = () => {
    if (confirm('Discard all session edits?')) window.location.reload();
  };

  const handleSaveAllChanges = async () => {
    try {
      const response = await saveBOMEdits(conversionId!, mbomItems);
      if (response.success) {
        setHasUnsavedChanges(false);
        alert('✅ Persisted to Database');
      }
    } catch (error) { alert('❌ Save failed'); }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `bomforge-export-${timestamp}`;
    if (format === 'csv') exportToCSV(mbomItems, `${filename}.csv`);
    else if (format === 'excel') exportToExcel(mbomItems, `${filename}.xlsx`);
    else exportToPDF(mbomItems, `${filename}.pdf`);
    setShowExportMenu(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Neural Environment...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col font-sans">
      {/* Premium Studio Header */}
      <header className="border-b border-gray-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="BOMForge AI Logo" className="w-8 h-8 object-contain drop-shadow-sm transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">BOMForge <span className="text-teal-600 font-black">STUDIO</span></span>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
              <Settings2 className="w-3 h-3" /> Assembly v1.2.4
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/history">
              <Button variant="ghost" className="h-10 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-xl px-6">
                <History className="w-4 h-4 mr-2" /> History
              </Button>
            </Link>

            <div className="relative">
              <Button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-10 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl px-6 text-xs font-bold uppercase tracking-widest mac-shadow"
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-3 w-56 glass-card rounded-2xl overflow-hidden p-1 z-50 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 text-slate-700">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> RAW CSV Map
                  </button>
                  <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 text-slate-700">
                    <FileSpreadsheet className="w-4 h-4 text-blue-500" /> Excel Spreadsheet
                  </button>
                  <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 text-slate-700">
                    <Sparkles className="w-4 h-4 text-purple-500" /> Document PDF
                  </button>
                </div>
              )}
            </div>

            <Button
              onClick={handleSaveAllChanges}
              disabled={!hasUnsavedChanges}
              className={`h-10 rounded-xl px-8 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${hasUnsavedChanges ? 'bg-teal-600 text-white mac-shadow scale-105' : 'bg-slate-200 text-slate-400'
                }`}
            >
              {hasUnsavedChanges ? <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Finalize Changes</span> : 'No Pending Edits'}
            </Button>
          </div>
        </div>
      </header>

      {/* Modern Control Strip */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Density</span>
              <span className="text-sm font-bold text-slate-900">{stats.totalParts} Parts</span>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex gap-3">
              {[
                { label: 'Added', val: stats.addedParts, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100' },
                { label: 'Modified', val: stats.modifiedParts, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100' },
              ].map((s, i) => (
                <div key={i} className={`px-4 py-1.5 rounded-full border ${s.bg} flex items-center gap-2`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}:</span>
                  <span className={`text-xs font-black ${s.color}`}>{s.val}</span>
                </div>
              ))}
              <div className="px-6 py-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-3 mac-shadow ml-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-teal-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conversion Accuracy</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <span className="text-sm font-black text-teal-400">{stats.avgConfidence}%</span>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'tree' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-4 h-4" /> Layout
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'graph' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Network className="w-4 h-4" /> Graph
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-12">
          {/* Main Inspector - Left 8/12 */}
          <div className="col-span-8 border-r border-slate-100 bg-[#FBFBFD] overflow-y-auto p-8">
            {viewMode === 'tree' ? (
              <div className="space-y-8 max-w-5xl mx-auto">
                {/* Hierarchy Selection */}
                <div className="flex gap-2">
                  {[
                    { id: 'mbom', label: 'Manufacturing Map', icon: Sparkles },
                    { id: 'comparison', label: 'Cross-Reference', icon: Filter },
                    { id: 'ebom', label: 'Engineering Root', icon: Box }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 ${activeTab === tab.id
                        ? 'bg-white mac-shadow text-slate-900 ring-1 ring-slate-100 font-bold'
                        : 'text-slate-400 font-medium hover:text-slate-600'
                        }`}
                    >
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span className="text-sm tracking-tight">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="glass-card rounded-[32px] p-8 min-h-[600px] border border-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-[100px] -z-10" />

                  {activeTab === 'ebom' && <BOMTree items={ebomItems} type="ebom" />}
                  {activeTab === 'mbom' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Active Manufacturing BOM</h2>
                          <p className="text-sm text-slate-500 font-medium">Mapped from engineering definitions using multi-model synthesis.</p>
                        </div>
                        <Button onClick={handleAddItem} className="rounded-full bg-slate-900 text-white hover:bg-black font-bold h-10 px-6 mac-btn">
                          <Plus className="w-4 h-4 mr-2" /> Add Part
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {mbomItems.map((item) => (
                          <EditableBOMItem
                            key={item.id || item.partNumber}
                            item={item}
                            onSave={handleSaveItem}
                            onDelete={handleDeleteItem}
                            onFeedback={handleFeedback}
                            onReorder={handleReorder}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === 'comparison' && (
                    <div className="grid grid-cols-2 gap-8 h-full">
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Engineering Input
                        </h3>
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                          <BOMTree items={ebomItems} type="ebom" compact />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-500 px-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Manufacturing Map
                        </h3>
                        <div className="bg-teal-50/20 rounded-2xl p-4 border border-teal-100">
                          <BOMTree items={mbomItems} type="mbom" compact />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full space-y-6">
                <div className="glass-card rounded-[32px] p-4 h-[70vh] border border-white mac-shadow">
                  <DependencyGraph items={mbomItems} onNodeClick={(item) => setSelectedNode(item)} />
                </div>
                {selectedNode && (
                  <div className="p-8 glass-card-dark rounded-3xl mac-shadow text-white animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-3xl font-black tracking-tight">{selectedNode.partNumber}</h3>
                          <Badge className="bg-teal-500/20 text-teal-300 border-none px-3 py-1">{(selectedNode.confidence * 100).toFixed(0)}% Confident</Badge>
                        </div>
                        <p className="text-lg text-slate-400 font-medium">{selectedNode.description}</p>
                      </div>
                      <button onClick={() => setSelectedNode(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">×</button>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                      {[
                        { label: 'Work Center', val: selectedNode.workCenter || 'N/A' },
                        { label: 'Level', val: selectedNode.level },
                        { label: 'Quantity', val: selectedNode.quantity },
                        { label: 'Material', val: selectedNode.materialSpec || 'Generic' }
                      ].map((att, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{att.label}</p>
                          <p className="text-lg font-bold">{att.val}</p>
                        </div>
                      ))}
                    </div>
                    {selectedNode.reasoning && (
                      <div className="mt-6 p-6 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0 text-white"><Sparkles className="w-6 h-6" /></div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-teal-400">AI Synthesis Reason</p>
                          <p className="text-sm text-slate-300 italic leading-relaxed">{selectedNode.reasoning}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Neural Panel - Right 4/12 */}
          <div className="col-span-4 bg-white/50 backdrop-blur-3xl overflow-y-auto p-8 border-l border-slate-100">
            <div className="space-y-8">
              <div className="p-1.5 rounded-full bg-slate-900 inline-flex items-center gap-3 pr-6 text-white text-[10px] font-black uppercase tracking-[0.2em] mac-shadow">
                <div className="w-6 h-6 bg-teal-500 rounded-full animate-pulse" /> Neural Co-Pilot Active
              </div>

              <EnhancedAIPanel
                stats={{
                  totalParts: stats.totalParts,
                  added: stats.addedParts,
                  modified: stats.modifiedParts,
                  grouped: stats.groupedParts,
                  avgConfidence: stats.avgConfidence,
                }}
                explanation={explanation}
              />

              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 space-y-4">
                <div className="flex items-center gap-3 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                  <h4 className="font-black text-sm uppercase tracking-widest">Manual Review Required</h4>
                </div>
                <p className="text-xs text-amber-600 font-medium leading-relaxed">System detected 3 ambiguity clusters in the hierarchy mapping. Please verify the Work Center for nodes marked with &lt; 90% confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Action Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 p-2 bg-slate-900/90 backdrop-blur-2xl rounded-[24px] border border-white/10 mac-shadow animate-in slide-in-from-bottom-8 duration-500">
          <button onClick={handleResetChanges} className="px-8 py-4 text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 rounded-2xl transition-all">Discard Session</button>
          <button onClick={handleSaveAllChanges} className="px-10 py-4 bg-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center gap-3 mac-shadow scale-105">
            <Sparkles className="w-4 h-4 animate-spin-slow" /> Persist Synchronized Data
          </button>
        </div>
      )}

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={onSubmitFeedback}
        item={feedbackItem}
      />
    </div>
  );
}

function BOMTree({ items, type, compact = false }: { items: any[]; type: 'ebom' | 'mbom'; compact?: boolean }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedItems(newExpanded);
  };

  if (!items || items.length === 0) return <div className="text-center py-12 text-slate-300 font-black uppercase tracking-widest text-xs">Environment Empty</div>;

  return (
    <div className={`space-y-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      {items.map((item) => (
        <BOMTreeItem
          key={item.id || item.partNumber}
          item={item}
          type={type}
          compact={compact}
          expanded={expandedItems.has(item.id || item.partNumber)}
          onToggle={() => toggleExpand(item.id || item.partNumber)}
        />
      ))}
    </div>
  );
}

function BOMTreeItem({ item, type, compact, expanded, onToggle }: { item: any; type: 'ebom' | 'mbom'; compact: boolean; expanded: boolean; onToggle: () => void; }) {
  const getStyle = (changeType?: string) => {
    switch (changeType) {
      case 'added': return 'bg-emerald-50/50 border-emerald-100 text-emerald-900';
      case 'modified': return 'bg-amber-50/50 border-amber-100 text-amber-900';
      case 'grouped': return 'bg-blue-50/50 border-blue-100 text-blue-900';
      default: return 'bg-white border-slate-100/50 text-slate-800';
    }
  };

  return (
    <div className={`transition-all duration-300`} style={{ marginLeft: `${(item.level || 0) * 24}px` }}>
      <div className={`group border-l-2 ${getStyle(item.changeType)} rounded-r-xl p-4 mac-shadow-sm hover:translate-x-1 transition-transform relative overflow-hidden`}>
        {item.changeType === 'added' && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rotate-45 translate-x-8 -translate-y-8" />}

        <div className="flex items-start gap-4">
          {item.children && item.children.length > 0 && (
            <button onClick={onToggle} className="mt-1 text-slate-300 hover:text-slate-600 transition-colors">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-black text-xs tracking-widest font-mono text-slate-900">{item.partNumber}</span>
              {item.changeType && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${item.changeType === 'added' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {item.changeType}
                </span>
              )}
            </div>
            <p className={`${compact ? 'text-[11px]' : 'text-sm'} font-medium text-slate-500 leading-tight truncate`}>{item.description}</p>

            {!compact && (
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <LayoutDashboard className="w-3 h-3" /> QTY: {item.quantity}
                </div>
                {item.workCenter && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Settings2 className="w-3 h-3" /> WC: {item.workCenter}
                  </div>
                )}
              </div>
            )}
          </div>

          {!compact && (
            <button onClick={onToggle} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-teal-600">
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>

        {expanded && item.reasoning && (
          <div className="mt-4 p-4 rounded-xl bg-white/50 border border-slate-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-3">
              <Sparkles className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">{item.reasoning}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
