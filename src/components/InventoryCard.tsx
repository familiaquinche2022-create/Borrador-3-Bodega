import React, { useState } from 'react';
import { Package, MapPin, Edit3, Check, X, AlertTriangle, Image, Settings, Trash2, ArrowRight } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface InventoryCardProps {
  item: InventoryItem;
  onUpdateStock: (id: number, stock: number) => void;
  onEditItem?: (item: InventoryItem) => void;
  onDeleteItem?: (id: number) => void;
  onReassignCategory?: (item: InventoryItem) => void;
  isUpdating: boolean;
  isDeleting?: boolean;
  isViewerMode?: boolean;
}

export function InventoryCard({ item, onUpdateStock, onEditItem, onDeleteItem, onReassignCategory, isUpdating, isDeleting = false, isViewerMode = false }: InventoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState(item.stock);

  const getStockStatus = (stock: number) => {
    const puntoPedido = item.puntoPedido || 5;
    if (stock <= Math.floor(puntoPedido / 2)) return { color: 'text-red-600', bg: 'bg-red-100', status: 'Crítico' };
    if (stock <= puntoPedido) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Bajo' };
    return { color: 'text-green-600', bg: 'bg-green-100', status: 'Normal' };
  };

  const stockStatus = getStockStatus(item.stock);

  const handleSaveStock = () => {
    if (newStock !== item.stock) {
      onUpdateStock(item.id, newStock);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNewStock(item.stock);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
      {item.foto && (
        <div className="mb-4">
          <img
            src={item.foto}
            alt={item.nombre}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${item.tipo === 'ERSA' ? 'bg-red-100' : 'bg-blue-100'}`}>
            {item.foto ? (
              <Image className={`h-5 w-5 ${item.tipo === 'ERSA' ? 'text-red-600' : 'text-blue-600'}`} />
            ) : (
              <Package className={`h-5 w-5 ${item.tipo === 'ERSA' ? 'text-red-600' : 'text-blue-600'}`} />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                item.tipo === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {item.tipo}
              </span>
              <span className="text-xs text-slate-500">#{item.codigo}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{item.nombre}</h3>
            <div className="flex items-center space-x-1 text-sm text-slate-500 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{item.ubicacion}</span>
            </div>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
          {stockStatus.status}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-sm text-slate-500">Stock disponible</p>
            {isEditing ? (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <button
                  onClick={handleSaveStock}
                  disabled={isUpdating}
                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-2xl font-bold text-slate-900">{item.stock}</p>
                <span className="text-sm text-slate-500">{item.unidad}</span>
              </div>
            )}
          </div>
          
          {item.stock <= (item.puntoPedido || 5) && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Reabastecer</span>
            </div>
          )}
        </div>

        {!isViewerMode && (
          <div className="flex space-x-1">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Stock</span>
              </button>
            )}
            {onEditItem && (
              <button
                onClick={() => onEditItem(item)}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Editar</span>
              </button>
            )}
            {onReassignCategory && (
              <button
                onClick={() => onReassignCategory(item)}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors"
                title="Cambiar categoría"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Categoría</span>
              </button>
            )}
            {onDeleteItem && (
              <button
                onClick={() => onDeleteItem(item.id)}
                disabled={isDeleting}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
              </button>
            )}
          </div>
        )}

        {isViewerMode && (
          <button
            disabled
            className="flex items-center space-x-1 px-3 py-2 text-sm text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed"
          >
            <Package className="h-4 w-4" />
            <span>Solo lectura</span>
          </button>
        )}
      </div>
    </div>
  );
}