import React, { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, Eye, Settings, Trash2 } from 'lucide-react';
import { Layout } from './components/Layout';
import { InventoryCard } from './components/InventoryCard';
import { EditItemModal } from './components/EditItemModal';
import { ImportExcelModal } from './components/ImportExcelModal';
import { ClearAllModal } from './components/ClearAllModal';
import { CriticalStockNotification } from './components/CriticalStockNotification';
import { CategoryView } from './components/CategoryView';
import { ViewerMode } from './components/ViewerMode';
import { SearchBar } from './components/SearchBar';
import { StatsGrid } from './components/StatsGrid';
import { StockCriticalityCharts } from './components/StockCriticalityCharts';
import { ReportsModal } from './components/ReportsModal';
import { InventoryItem, NewInventoryItem } from './types/inventory';
import { AddItemModal } from './components/AddItemModal';
import { inventoryApi } from './services/api';
import { searchInventoryItem } from './utils/search';

function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'editor' | 'viewer'>('editor');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'critical'>('all');
  const [currentView, setCurrentView] = useState<'list' | 'categories'>('list');
  const [sortBy, setSortBy] = useState<'nombre' | 'codigo' | 'ubicacion'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (newItem: NewInventoryItem) => {
    try {
      setIsAdding(true);
      const addedItem = await inventoryApi.create(newItem);
      // Reload the entire inventory to ensure consistency
      await loadInventory();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleImportItems = async (newItems: NewInventoryItem[]) => {
    try {
      setIsImporting(true);
      await inventoryApi.createBulk(newItems);
      await loadInventory();
      setIsImportModalOpen(false);
    } catch (error) {
      console.error('Error importing items:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpdateStock = async (id: number, stock: number) => {
    try {
      setUpdatingItems(prev => new Set([...prev, id]));
      const updatedItem = await inventoryApi.updateStock(id, stock);
      if (updatedItem) {
        setItems(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveItem = async (updatedItem: InventoryItem) => {
    try {
      setIsSaving(true);
      const savedItem = await inventoryApi.update(updatedItem.id, updatedItem);
      if (savedItem) {
        setItems(prev => prev.map(item => 
          item.id === updatedItem.id ? savedItem : item
        ));
        setIsEditModalOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este material?')) {
      try {
        setDeletingItems(prev => new Set([...prev, id]));
        const deleted = await inventoryApi.delete(id);
        if (deleted) {
          await loadInventory();
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        setDeletingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      const cleared = await inventoryApi.clearAll();
      if (cleared) {
        await loadInventory();
        setIsClearAllModalOpen(false);
      }
    } catch (error) {
      console.error('Error clearing inventory:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchInventoryItem(item, searchTerm);
    
    const puntoPedido = item.puntoPedido || 5;
    const criticalThreshold = Math.floor(puntoPedido / 2);
    const matchesFilter = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.stock <= puntoPedido && item.stock > criticalThreshold) ||
      (stockFilter === 'critical' && item.stock <= criticalThreshold);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const aValue = String(a[sortBy]).toLowerCase();
    const bValue = String(b[sortBy]).toLowerCase();
    
    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Modo espectador
  if (viewMode === 'viewer') {
    return <ViewerMode onBackToEditor={() => setViewMode('editor')} />;
  }

  return (
    <Layout>
      <CriticalStockNotification items={items} />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Inventario Industrial</h2>
            <p className="text-slate-600">Gestión completa de materiales y suministros</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <button
              onClick={() => setViewMode('viewer')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              <Eye className="h-4 w-4" />
              <span>Modo Espectador</span>
            </button>
            <button
              onClick={() => setIsReportsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Reportes</span>
            </button>
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Borrar Todo</span>
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Importar Excel</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Material</span>
            </button>
          </div>
        </div>

        <StatsGrid items={items} />

        <StockCriticalityCharts items={items} />

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          stockFilter={stockFilter}
          onFilterChange={setStockFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {currentView === 'categories' ? (
          <CategoryView
            items={filteredItems}
            onUpdateStock={handleUpdateStock}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            updatingItems={updatingItems}
            deletingItems={deletingItems}
            isAdding={isAdding}
          />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="max-w-sm mx-auto">
              <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Plus className="h-8 w-8 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchTerm || stockFilter !== 'all' ? 'No se encontraron materiales' : 'No hay materiales'}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || stockFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer material al inventario'
                }
              </p>
              {!searchTerm && stockFilter === 'all' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Material</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <InventoryCard
                key={item.id}
                item={item}
                onUpdateStock={handleUpdateStock}
                onEditItem={handleEditItem}
               onDeleteItem={handleDeleteItem}
                isUpdating={updatingItems.has(item.id)}
               isDeleting={deletingItems.has(item.id)}
              />
            ))}
          </div>
        )}

        <AddItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddItem}
          isAdding={isAdding}
        />

        {editingItem && (
          <EditItemModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSaveItem}
            item={editingItem}
            isSaving={isSaving}
          />
        )}

        <ImportExcelModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportItems}
          isImporting={isImporting}
        />

        <ClearAllModal
          isOpen={isClearAllModalOpen}
          onClose={() => setIsClearAllModalOpen(false)}
          onConfirm={handleClearAll}
          isClearing={isClearing}
          totalItems={items.length}
        />

        <ReportsModal
          isOpen={isReportsModalOpen}
          onClose={() => setIsReportsModalOpen(false)}
        />
      </div>
    </Layout>
  );
}

export default App;