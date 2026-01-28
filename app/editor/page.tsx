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

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export feature coming soon!');
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
              <Button variant="outline" onClick={handleSave}>
                Save Changes
              </Button>
              <Button onClick={handleExport} className="bg-teal-600 hover:bg-teal-700">
                Export →
              </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BOM Comparison - Left 2/3 */}
          <div className="lg:col-span-2">
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
                  <BOMTree items={mbomItems} type="mbom" />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* AI Explanation - Right 1/3 */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">🧠</span>
                AI Analysis
              </h2>

              {explanation && (
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Summary</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {explanation.summary || 'AI successfully converted eBOM to manufacturing-ready mBOM with optimized grouping and work center assignments.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Key Changes</h3>
                    <ul className="space-y-2">
                      {explanation.keyChanges?.map((change: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-teal-600 mt-1">•</span>
                          <span className="text-slate-600">{change}</span>
                        </li>
                      )) || (
                        <>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-slate-600">Added manufacturing tooling and fixtures</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-600">↻</span>
                            <span className="text-slate-600">Grouped sub-assemblies for efficient production</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-orange-600">⚙</span>
                            <span className="text-slate-600">Assigned optimal work centers</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {explanation.reasoning && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">AI Reasoning</h3>
                      <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded">
                        {explanation.reasoning}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" size="sm">
                      📝 Provide Feedback
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
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
