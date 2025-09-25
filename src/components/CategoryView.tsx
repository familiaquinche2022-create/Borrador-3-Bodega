import React, { useState } from 'react';
import { Package, Wrench, Zap, Cog, Droplets, Layers, Grid3X3, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { InventoryCard } from './InventoryCard';
import { AddItemModal } from './AddItemModal';
import { NewInventoryItem } from '../types/inventory';
import { CategoryReassignModal } from './CategoryReassignModal';

interface CategoryViewProps {
  items: InventoryItem[];
  onUpdateStock: (id: number, stock: number) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: number) => void;
  onAddItem: (item: NewInventoryItem) => void;
  updatingItems: Set<number>;
  deletingItems: Set<number>;
  isAdding: boolean;
  onReassignCategory?: (itemId: number, newCategory: string) => void;
  isReassigning?: boolean;
}

// Función para determinar la categoría automáticamente
const determineCategory = (item: InventoryItem): string => {
  const nombre = item.nombre.toLowerCase();
  const tipo = item.tipo.toLowerCase();
  
  // Categorías basadas en palabras clave
  if (nombre.includes('perno') || nombre.includes('tornillo') || nombre.includes('tuerca') || 
      nombre.includes('arandela') || nombre.includes('allen')) {
    return 'Tornillería y Fijación';
  }
  
  if (nombre.includes('correa') || nombre.includes('banda') || nombre.includes('cadena')) {
    return 'Transmisión';
  }
  
  if (nombre.includes('aceite') || nombre.includes('grasa') || nombre.includes('lubricante') ||
      nombre.includes('fluido') || nombre.includes('hidraulico')) {
    return 'Lubricantes y Fluidos';
  }
  
  if (nombre.includes('rodamiento') || nombre.includes('cojinete') || nombre.includes('bearing')) {
    return 'Rodamientos';
  }
  
  if (nombre.includes('sello') || nombre.includes('empaque') || nombre.includes('junta') ||
      nombre.includes('o-ring') || nombre.includes('gasket')) {
    return 'Sellos y Empaques';
  }
  
  if (nombre.includes('filtro') || nombre.includes('filter')) {
    return 'Filtros';
  }
  
  if (nombre.includes('valvula') || nombre.includes('valve') || nombre.includes('conexion') ||
      nombre.includes('fitting') || nombre.includes('acople')) {
    return 'Válvulas y Conexiones';
  }
  
  if (nombre.includes('motor') || nombre.includes('bomba') || nombre.includes('compresor')) {
    return 'Equipos Rotativos';
  }
  
  if (nombre.includes('cable') || nombre.includes('alambre') || nombre.includes('conductor') ||
      nombre.includes('electrico')) {
    return 'Eléctricos';
  }
  
  if (nombre.includes('manguera') || nombre.includes('tubo') || nombre.includes('tuberia') ||
      nombre.includes('pipe') || nombre.includes('hose')) {
    return 'Tuberías y Mangueras';
  }
  
  // Categorías por tipo
  if (tipo === 'ersa') {
    return 'Repuestos ERSA';
  }
  
  if (tipo === 'unbw') {
    return 'Materiales UNBW';
  }
  
  return 'Otros';
};

const categoryIcons: { [key: string]: React.ComponentType<any> } = {
  'Tornillería y Fijación': Cog,
  'Transmisión': Zap,
  'Lubricantes y Fluidos': Droplets,
  'Rodamientos': Package,
  'Sellos y Empaques': Layers,
  'Filtros': Grid3X3,
  'Válvulas y Conexiones': Wrench,
  'Equipos Rotativos': Cog,
  'Eléctricos': Zap,
  'Tuberías y Mangueras': Package,
  'Repuestos ERSA': Wrench,
  'Materiales UNBW': Package,
  'Otros': Package,
};

export function CategoryView({ items, onUpdateStock, onEditItem, onDeleteItem, onAddItem, updatingItems, deletingItems, isAdding }: CategoryViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [itemToReassign, setItemToReassign] = useState<InventoryItem | null>(null);
  const [currentItemCategory, setCurrentItemCategory] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Agrupar items por categoría
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.categoria || determineCategory(item);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as { [key: string]: InventoryItem[] });

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories = Object.keys(itemsByCategory).sort();

  const handleAddToCategory = (category: string) => {
    setSelectedCategory(category);
    setIsAddModalOpen(true);
  };

  const handleAddItem = (item: NewInventoryItem) => {
    const itemWithCategory = { ...item, categoria: selectedCategory };
    onAddItem(itemWithCategory);
  };

  const handleReassignCategory = (item: InventoryItem, currentCategory: string) => {
    setItemToReassign(item);
    setCurrentItemCategory(currentCategory);
    setIsReassignModalOpen(true);
  };

  const handleConfirmReassign = async (itemId: number, newCategory: string) => {
    try {
      setIsReassigning(true);
      // Actualizar el item con la nueva categoría
      const itemToUpdate = items.find(item => item.id === itemId);
      if (itemToUpdate && onEditItem) {
        const updatedItem = { ...itemToUpdate, categoria: newCategory };
        onEditItem(updatedItem);
      }
      setIsReassignModalOpen(false);
      setItemToReassign(null);
      setCurrentItemCategory('');
    } catch (error) {
      console.error('Error reassigning category:', error);
    } finally {
      setIsReassigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Vista por Categorías</h3>
        <p className="text-sm text-blue-800">
          Los materiales se agrupan automáticamente por categorías basadas en su nombre y tipo.
          Haz clic en cada categoría para expandir o contraer.
        </p>
      </div>

      {categories.map(category => {
        const categoryItems = itemsByCategory[category];
        const isExpanded = expandedCategories.has(category);
        const Icon = categoryIcons[category] || Package;
        
        // Estadísticas de la categoría
        const totalItems = categoryItems.length;
        const criticalItems = categoryItems.filter(item => {
          const puntoPedido = item.puntoPedido || 5;
          return item.stock <= Math.floor(puntoPedido / 2);
        }).length;
        const lowStockItems = categoryItems.filter(item => {
          const puntoPedido = item.puntoPedido || 5;
          return item.stock <= puntoPedido && item.stock > Math.floor(puntoPedido / 2);
        }).length;

        return (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span>{totalItems} materiales</span>
                    {criticalItems > 0 && (
                      <span className="text-red-600 font-medium">
                        {criticalItems} crítico{criticalItems > 1 ? 's' : ''}
                      </span>
                    )}
                    {lowStockItems > 0 && (
                      <span className="text-yellow-600 font-medium">
                        {lowStockItems} bajo{lowStockItems > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right text-sm text-slate-500">
                  <div>Total: {categoryItems.reduce((sum, item) => sum + item.stock, 0)}</div>
                </div>
                <button
                  onClick={() => handleAddToCategory(category)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title={`Agregar material a ${category}`}
                >
                  <Plus className="h-3 w-3" />
                </button>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </button>
            
            {isExpanded && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {categoryItems.map(item => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onUpdateStock={onUpdateStock}
                      onEditItem={onEditItem}
                      onDeleteItem={onDeleteItem}
                      onReassignCategory={(item) => handleReassignCategory(item, category)}
                      isUpdating={updatingItems.has(item.id)}
                      isDeleting={deletingItems.has(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedCategory('');
        }}
        onAdd={handleAddItem}
        isAdding={isAdding}
        preselectedCategory={selectedCategory}
      />

      <CategoryReassignModal
        isOpen={isReassignModalOpen}
        onClose={() => {
          setIsReassignModalOpen(false);
          setItemToReassign(null);
          setCurrentItemCategory('');
        }}
        onReassign={handleConfirmReassign}
        item={itemToReassign}
        currentCategory={currentItemCategory}
        isReassigning={isReassigning}
      />
    </div>
  );
}