'use client';

import React, { useState } from 'react';
import { Brain, TrendingUp, Lightbulb, Shield, CheckCircle } from 'lucide-react';

interface EnhancedAIPanelProps {
  stats: {
    totalParts: number;
    added: number;
    modified: number;
    grouped: number;
    avgConfidence: number;
  };
  explanation?: any;
}

export function EnhancedAIPanel({ stats, explanation }: EnhancedAIPanelProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'changes' | 'insights' | 'confidence'>('summary');

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow-lg border-2 border-slate-200 sticky top-24">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Explainable AI</h2>
            <p className="text-sm text-slate-600">Understanding AI decisions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <div className="flex space-x-1 bg-white/60 p-1 rounded-lg shadow-inner">
          {[
            { id: 'summary', label: 'Summary', icon: TrendingUp },
            { id: 'changes', label: 'Changes', icon: CheckCircle },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'confidence', label: 'Confidence', icon: Shield },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center space-x-1 ${
                activeTab === tab.id
                  ? 'bg-white text-teal-700 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 pt-0">
        <div className="bg-white rounded-xl shadow-sm p-4 max-h-[500px] overflow-y-auto">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <span className="text-lg">📊</span>
                  <span>Overall Assessment</span>
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {explanation?.overallAssessment || 
                    'AI successfully converted eBOM to manufacturing-ready mBOM with optimized grouping and work center assignments.'}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Processing Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Total Parts</span>
                    <span className="font-bold text-gray-900">{stats.totalParts}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm text-gray-600">Modified</span>
                    <span className="font-bold text-yellow-700">{stats.modified}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-600">Grouped</span>
                    <span className="font-bold text-blue-700">{stats.grouped}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-teal-50 rounded">
                    <span className="text-sm text-gray-600">Avg Confidence</span>
                    <span className="font-bold text-teal-700">{stats.avgConfidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-lg">🔄</span>
                <span>Key Changes Made</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="mt-1 p-1.5 bg-green-500 rounded">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Added manufacturing tooling and fixtures</p>
                    <p className="text-xs text-gray-600 mt-1">Required for proper assembly sequencing</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="mt-1 p-1.5 bg-blue-500 rounded">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Grouped sub-assemblies for efficient production</p>
                    <p className="text-xs text-gray-600 mt-1">{stats.grouped} items optimized</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="mt-1 p-1.5 bg-purple-500 rounded">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Assigned optimal work centers</p>
                    <p className="text-xs text-gray-600 mt-1">Based on part characteristics and processes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-lg">💡</span>
                <span>AI Insights</span>
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-teal-500 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900 mb-1">🎯 Context-Aware Intelligence</p>
                  <p className="text-xs text-slate-600">
                    AI understood part descriptions and manufacturing context to make intelligent work center assignments
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900 mb-1">📦 Smart Grouping</p>
                  <p className="text-xs text-slate-600">
                    Similar parts were grouped into kits for efficient assembly and inventory management
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-600 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900 mb-1">⚡ Assembly Optimization</p>
                  <p className="text-xs text-slate-600">
                    Assembly sequence optimized to reduce steps and enable parallel operations (18% faster)
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-600 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900 mb-1">📚 Knowledge Applied</p>
                  <p className="text-xs text-slate-600">
                    Company-specific patterns and industry best practices were applied automatically
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'confidence' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-lg">🎯</span>
                <span>Confidence Breakdown</span>
              </h3>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Overall Confidence</span>
                  <span className="font-bold text-teal-700 text-lg">{stats.avgConfidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500 shadow-sm"
                    style={{ width: `${stats.avgConfidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-3">CONFIDENCE FACTORS:</p>
                
                <div className="space-y-2">
                  {[
                    { label: 'Classification Accuracy', value: 95, color: 'teal' },
                    { label: 'Work Center Assignment', value: 92, color: 'blue' },
                    { label: 'Grouping Logic', value: 90, color: 'emerald' },
                    { label: 'Sequence Optimization', value: 88, color: 'slate' },
                  ].map(factor => (
                    <div key={factor.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{factor.label}</span>
                        <span className="font-semibold text-gray-900">{factor.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full bg-${factor.color}-500`}
                          style={{ width: `${factor.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <strong>💡 Note:</strong> Higher confidence indicates AI is more certain about its decisions. Lower confidence items may benefit from manual review.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Button */}
        <button
          onClick={() => {
            alert('Feedback feature coming soon! Your input will help improve AI accuracy.');
          }}
          className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-semibold"
        >
          <span>📝</span>
          <span>Provide Feedback</span>
        </button>
      </div>
    </div>
  );
}
