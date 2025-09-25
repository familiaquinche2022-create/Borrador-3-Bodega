import React, { useState } from 'react';
import { X, ArrowRight, Package } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface CategoryReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReassign: (itemId: number, newCategory: string) => void;
  item: InventoryItem | null;
  currentCategory: string;
  isReassigning: boolean;
}

export function CategoryReassignModal({
  isOpen,
  onClose,
  onReassign,
  item,
  currentCategory,
  isReassigning,
}: CategoryReassignModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'Tornillería y Fijación',
    'Transmisión',
    'Lubricantes y Fluidos',
    'Rodamientos',
    'Sellos y Empaques',
    'Filtros',
    'Válvulas y Conexiones',
    'Equipos Rotativos',
    'Eléctricos',
    'Tuberías y Mangueras',
    'Repuestos ERSA',
    'Materiales UNBW',
    'Otros',
  ];

  const handleConfirm = () => {
    if (item && selectedCategory && selectedCategory !== currentCategory) {
      onReassign(item.id, selectedCategory);
    }
  };

  const handleClose = () => {
    setSelectedCategory('');
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Cambiar Categoría</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${item.tipo === 'ERSA' ? 'bg-red-100' : 'bg-blue-100'}`}>
                <Package className={`h-5 w-5 ${item.tipo === 'ERSA' ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{item.nombre}</h3>
                <p className="text-sm text-slate-600">Código: {item.codigo}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categoría actual: <span className="font-semibold text-purple-600">{currentCategory}</span>
            </label>
          </div>

          <div>
            <label htmlFor="newCategory" className="block text-sm font-medium text-slate-700 mb-2">
              Nueva categoría *
            </label>
            <select
              id="newCategory"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            >
              <option value="">Seleccionar nueva categoría</option>
              {categories
                .filter(category => category !== currentCategory)
                .map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isReassigning}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isReassigning || !selectedCategory || selectedCategory === currentCategory}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isReassigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cambiando...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  <span>Cambiar Categoría</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}