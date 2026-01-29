'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getBOMData, getExplanation, saveBOMEdits } from '@/lib/api';
import { BOMItem, MBOMItem } from '@/lib/types';
import { DependencyGraph } from '@/components/DependencyGraph';
import { EnhancedAIPanel } from '@/components/EnhancedAIPanel';
import { EditableBOMItem } from '@/components/EditableBOMItem';
import { Network, List, Download, Save } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/utils/exportUtils';
import Link from 'next/link';


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

      if (!bomResponse.success || !explanationResponse.success) {
        throw new Error('Failed to load conversion data');
      }

      const { ebomData, mbomData } = bomResponse.data;
      setEbomItems(ebomData?.items || []);
      setMbomItems(mbomData?.items || []);
      setExplanation(explanationResponse.data);

      // Calculate statistics
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
      console.error('Error loading conversion data:', err);
      setError(err.message || 'Failed to load conversion data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveBOMEdits(conversionId!, mbomItems);
      alert('Changes saved successfully!');
    } catch (err) {
      alert('Failed to save changes');
    }
  };

  const handleSaveItem = (partNumber: string, updates: Partial<any>) => {
    setMbomItems(prev =>
      prev.map(item =>
        item.partNumber === partNumber ? { ...item, ...updates } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleDeleteItem = (partNumber: string) => {
    setMbomItems(prev => prev.filter(item => item.partNumber !== partNumber));
    setHasUnsavedChanges(true);
  };

  const handleSaveAllChanges = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/convert/bom/${conversionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mbomData: { items: mbomItems, totalParts: mbomItems.length }
          })
        }
      );

      if (response.ok) {
        setHasUnsavedChanges(false);
        alert('✅ Changes saved successfully!');
      } else {
        alert('❌ Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('❌ Failed to save changes');
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `mbom-${timestamp}`;
    
    switch (format) {
      case 'csv':
        exportToCSV(mbomItems, `${filename}.csv`);
        break;
      case 'excel':
        exportToExcel(mbomItems, `${filename}.xlsx`);
        break;
      case 'pdf':
        exportToPDF(mbomItems, `${filename}.pdf`);
        break;
    }
    
    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading conversion data...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto mt-20">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Link href="/upload">
              <Button>Back to Upload</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-orange-500 rounded-lg" />
                <span className="text-xl font-bold">BOMForge AI</span>
              </Link>
              <span className="text-slate-400">|</span>
              <h1 className="text-lg font-semibold text-slate-700">BOM Editor</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push('/history')}>
                History
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAllChanges}
                disabled={!hasUnsavedChanges}
                className={hasUnsavedChanges ? 'bg-yellow-50 border-yellow-300' : ''}
              >
                {hasUnsavedChanges ? '💾 Save Changes *' : 'Save Changes'}
              </Button>
              
              {/* Export Dropdown */}
              <div className="relative">
                <Button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 flex items-center gap-2"
                    >
                      <span>📊</span>
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 flex items-center gap-2"
                    >
                      <span>📈</span>
                      <span>Export as Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <span>📄</span>
                      <span>Export as PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Total Parts:</span>
              <Badge variant="secondary" className="text-sm">{stats.totalParts}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Added:</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{stats.addedParts}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Modified:</span>
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{stats.modifiedParts}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Grouped:</span>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{stats.groupedParts}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Unchanged:</span>
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{stats.unchangedParts}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Avg Confidence:</span>
              <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">{stats.avgConfidence}%</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* View Mode Toggle */}
        <div className="flex bg-white rounded-lg p-1 mb-4 w-fit shadow-sm border">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'tree'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <List className="h-4 w-4" />
            <span>Tree View</span>
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'graph'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Network className="h-4 w-4" />
            <span>Graph View</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BOM View - Left 2/3 */}
          <div className="lg:col-span-2">
            {viewMode === 'tree' ? (
              <Card className="p-6">
                <Tabs defaultValue="comparison" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ebom">eBOM ({ebomItems.length})</TabsTrigger>
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                    <TabsTrigger value="mbom">mBOM ({mbomItems.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ebom" className="mt-4">
                    <BOMTree items={ebomItems} type="ebom" />
                  </TabsContent>

                  <TabsContent value="comparison" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">eBOM</h3>
                        <BOMTree items={ebomItems} type="ebom" compact />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">mBOM</h3>
                        <BOMTree items={mbomItems} type="mbom" compact />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="mbom" className="mt-4">
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {mbomItems.map((item) => (
                        <EditableBOMItem
                          key={item.partNumber}
                          item={item}
                          onSave={handleSaveItem}
                          onDelete={handleDeleteItem}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                      <Network className="h-5 w-5 text-teal-600" />
                      <span>Dependency Graph</span>
                    </h2>
                    <Badge variant="secondary">{mbomItems.length} nodes</Badge>
                  </div>
                  <DependencyGraph
                    items={mbomItems}
                    onNodeClick={(item) => setSelectedNode(item)}
                  />
                </Card>

                {/* Selected Node Details */}
                {selectedNode && (
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{selectedNode.partNumber}</h3>
                          {selectedNode.confidence && (
                            <Badge className="bg-purple-100 text-purple-700">
                              {(selectedNode.confidence * 100).toFixed(0)}% confident
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-4">{selectedNode.description}</p>

                        <div className="grid grid-cols-2 gap-3">
                          {selectedNode.quantity && (
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-slate-500">Quantity</p>
                              <p className="text-sm font-semibold text-slate-900">{selectedNode.quantity}</p>
                            </div>
                          )}
                          {selectedNode.workCenter && (
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-slate-500">Work Center</p>
                              <p className="text-sm font-semibold text-slate-900">{selectedNode.workCenter}</p>
                            </div>
                          )}
                          {selectedNode.materialSpec && (
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-slate-500">Material</p>
                              <p className="text-sm font-semibold text-slate-900">{selectedNode.materialSpec}</p>
                            </div>
                          )}
                          {selectedNode.level !== undefined && (
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-slate-500">Level</p>
                              <p className="text-sm font-semibold text-slate-900">{selectedNode.level}</p>
                            </div>
                          )}
                        </div>

                        {selectedNode.reasoning && (
                          <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-purple-500">
                            <p className="text-xs text-slate-500 mb-1 font-semibold">AI Reasoning:</p>
                            <p className="text-sm text-slate-700 italic">{selectedNode.reasoning}</p>
                          </div>
                        )}

                        {selectedNode.dependencies && selectedNode.dependencies.length > 0 && (
                          <div className="mt-4 p-4 bg-white rounded-lg">
                            <p className="text-xs text-slate-500 mb-2 font-semibold">Depends on:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedNode.dependencies.map((dep: string) => (
                                <Badge key={dep} variant="secondary" className="font-mono text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedNode(null)}
                        className="ml-4 p-2 hover:bg-blue-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                      >
                        <span className="text-xl">×</span>
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Enhanced AI Panel - Right 1/3 */}
          <div className="lg:col-span-1">
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
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSaveAllChanges}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all font-bold flex items-center gap-2 animate-bounce"
          >
            <Save className="h-5 w-5" />
            Save All Changes
          </button>
        </div>
      )}
    </div>
  );
}

// BOM Tree Component
function BOMTree({ items, type, compact = false }: { items: any[]; type: 'ebom' | 'mbom'; compact?: boolean }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No items found
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'} max-h-[600px] overflow-y-auto`}>
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

// BOM Tree Item Component
function BOMTreeItem({
  item,
  type,
  compact,
  expanded,
  onToggle,
}: {
  item: any;
  type: 'ebom' | 'mbom';
  compact: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const getChangeTypeColor = (changeType?: string) => {
    switch (changeType) {
      case 'added':
        return 'bg-green-50 border-green-200';
      case 'modified':
        return 'bg-yellow-50 border-yellow-200';
      case 'grouped':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getChangeTypeBadge = (changeType?: string) => {
    switch (changeType) {
      case 'added':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Added</Badge>;
      case 'modified':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">Modified</Badge>;
      case 'grouped':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">Grouped</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`border rounded p-3 ${getChangeTypeColor(item.changeType)} ${
        compact ? 'py-2' : ''
      }`}
      style={{ marginLeft: `${(item.level || 0) * 20}px` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {item.children && item.children.length > 0 && (
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                {expanded ? '▼' : '▶'}
              </button>
            )}
            <span className={`font-mono ${compact ? 'text-xs' : 'text-sm'} font-medium text-slate-800`}>
              {item.partNumber}
            </span>
            {type === 'mbom' && getChangeTypeBadge(item.changeType)}
            {type === 'mbom' && item.confidence && (
              <Badge variant="secondary" className="text-xs">
                {Math.round(item.confidence * 100)}%
              </Badge>
            )}
          </div>
          <p className={`text-slate-600 ${compact ? 'text-xs' : ''}`}>
            {item.description}
          </p>
          {!compact && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-500">Qty: {item.quantity}</span>
              {item.workCenter && (
                <span className="text-slate-500">• WC: {item.workCenter}</span>
              )}
              {item.materialSpec && (
                <span className="text-slate-500">• Material: {item.materialSpec}</span>
              )}
            </div>
          )}
          {expanded && item.reasoning && (
            <div className="mt-2 text-xs text-slate-600 bg-white/50 p-2 rounded">
              💡 {item.reasoning}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
