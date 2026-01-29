'use client';

import React, { useState } from 'react';
import { Pencil, Save, X, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface BOMItem {
  partNumber: string;
  description: string;
  quantity?: number;
  level?: number;
  workCenter?: string;
  materialSpec?: string;
  confidence?: number;
  reasoning?: string;
  changeType?: 'added' | 'modified' | 'unchanged' | 'grouped';
}

interface EditableBOMItemProps {
  item: BOMItem;
  onSave: (partNumber: string, updates: Partial<BOMItem>) => void;
  onDelete: (partNumber: string) => void;
}

export function EditableBOMItem({ item, onSave, onDelete }: EditableBOMItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editedItem, setEditedItem] = useState(item);

  const handleSave = () => {
    onSave(item.partNumber, editedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete ${item.partNumber}?`)) {
      onDelete(item.partNumber);
    }
  };

  const getChangeColor = () => {
    switch (item.changeType) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'modified':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'grouped':
        return 'bg-blue-50 border-l-4 border-blue-500';
      default:
        return 'bg-white border-l-4 border-gray-300';
    }
  };

  if (isEditing) {
    return (
      <div className={`p-4 rounded-r-lg ${getChangeColor()} mb-2 shadow`}>
        <div className="space-y-3">
          {/* Part Number & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Part Number</label>
              <input
                type="text"
                value={editedItem.partNumber}
                onChange={(e) => setEditedItem({ ...editedItem, partNumber: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Quantity</label>
              <input
                type="number"
                value={editedItem.quantity || 1}
                onChange={(e) => setEditedItem({ ...editedItem, quantity: parseInt(e.target.value) })}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
            <textarea
              value={editedItem.description}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              rows={2}
            />
          </div>

          {/* Work Center & Material */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Work Center</label>
              <select
                value={editedItem.workCenter || ''}
                onChange={(e) => setEditedItem({ ...editedItem, workCenter: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                <option value="">Select...</option>
                <option value="WC-01-MACHINING">WC-01-MACHINING</option>
                <option value="WC-02-WELDING">WC-02-WELDING</option>
                <option value="WC-03-FABRICATION">WC-03-FABRICATION</option>
                <option value="WC-04-ASSEMBLY">WC-04-ASSEMBLY</option>
                <option value="WC-05-PAINTING">WC-05-PAINTING</option>
                <option value="WC-06-INSPECTION">WC-06-INSPECTION</option>
                <option value="WC-07-PACKAGING">WC-07-PACKAGING</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Material Spec</label>
              <input
                type="text"
                value={editedItem.materialSpec || ''}
                onChange={(e) => setEditedItem({ ...editedItem, materialSpec: e.target.value })}
                placeholder="e.g., Steel A36"
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm shadow-sm"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-sm"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-r-lg ${getChangeColor()} mb-2 group hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {/* Expand/Collapse */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            <span className="font-bold text-gray-900">{item.partNumber}</span>
            
            {item.confidence && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                {(item.confidence * 100).toFixed(0)}% confident
              </span>
            )}
          </div>

          {isExpanded && (
            <>
              <p className="text-sm text-gray-600 mt-2 ml-6">{item.description}</p>
              
              <div className="flex flex-wrap gap-2 ml-6 mt-2 text-xs">
                <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                  Qty: {item.quantity || 1}
                </span>
                {item.workCenter && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                    {item.workCenter}
                  </span>
                )}
                {item.materialSpec && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                    {item.materialSpec}
                  </span>
                )}
              </div>

              {item.reasoning && (
                <div className="ml-6 mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded italic">
                  💡 {item.reasoning}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
