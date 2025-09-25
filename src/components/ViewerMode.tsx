import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, AlertTriangle, Image, Settings, ArrowLeft, List, Grid3X3, ChevronDown, ChevronRight, Wrench, Zap, Cog, Droplets, Layers, Plus, ArrowRight, History, ShoppingCart, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { inventoryApi } from '../services/api';
import { AddItemModal } from './AddItemModal';
import { NewInventoryItem } from '../types/inventory';
import { CategoryReassignModal } from './CategoryReassignModal';
import { MaterialExitModal } from './MaterialExitModal';
import { MaterialExitHistoryModal } from './MaterialExitHistoryModal';
import { materialExitApi } from '../services/materialExitApi';
import { NewMaterialExit } from '../types/materialExit';

import { searchInventoryItem } from '../utils/search';

interface ViewerModeProps {
  onBackToEditor?: () => void;
}

export function ViewerMode({ onBackToEditor }: ViewerModeProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'critical'>('all');
  const [currentView, setCurrentView] = useState<'list' | 'categories'>('list');
  const [sortBy, setSortBy] = useState<'nombre' | 'codigo' | 'ubicacion'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [itemToReassign, setItemToReassign] = useState<InventoryItem | null>(null);
  const [currentItemCategory, setCurrentItemCategory] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [selectedMaterialForExit, setSelectedMaterialForExit] = useState<InventoryItem | null>(null);
  const [isProcessingExit, setIsProcessingExit] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedMaterialForHistory, setSelectedMaterialForHistory] = useState<{ id: number; name: string } | null>(null);

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

  const getStockStatus = (stock: number, item: InventoryItem) => {
    const puntoPedido = item.puntoPedido || 5;
    if (stock <= Math.floor(puntoPedido / 2)) return { color: 'text-red-600', bg: 'bg-red-100', status: 'Crítico' };
    if (stock <= puntoPedido) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Bajo' };
    return { color: 'text-green-600', bg: 'bg-green-100', status: 'Normal' };
  };

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

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Agrupar items por categoría
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const category = item.categoria || determineCategory(item);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as { [key: string]: InventoryItem[] });

  const categories = Object.keys(itemsByCategory).sort();

  const handleAddToCategory = (category: string) => {
    setSelectedCategory(category);
    setIsAddModalOpen(true);
  };

  const handleAddItem = async (item: NewInventoryItem) => {
    try {
      setIsAdding(true);
      const itemWithCategory = { ...item, categoria: selectedCategory };
      await inventoryApi.create(itemWithCategory);
      await loadInventory();
      setIsAddModalOpen(false);
      setSelectedCategory('');
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsAdding(false);
    }
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
      if (itemToUpdate) {
        const updatedItem = { ...itemToUpdate, categoria: newCategory };
        await inventoryApi.update(itemId, updatedItem);
        await loadInventory();
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

  const handleMaterialExit = (material: InventoryItem) => {
    setSelectedMaterialForExit(material);
    setIsExitModalOpen(true);
  };

  const handleConfirmExit = async (exitData: NewMaterialExit) => {
    if (!selectedMaterialForExit) return;

    try {
      setIsProcessingExit(true);
      
      // Registrar la salida
      await materialExitApi.create(exitData, selectedMaterialForExit);
      
      // Actualizar el stock del material
      const newStock = selectedMaterialForExit.stock - exitData.quantity;
      
      // Actualizar el stock en el inventario usando la API
      await inventoryApi.updateStock(selectedMaterialForExit.id, newStock);
      
      setIsExitModalOpen(false);
      setSelectedMaterialForExit(null);
      
      // Recargar inventario para obtener datos actualizados
      await loadInventory();
    } catch (error) {
      console.error('Error processing material exit:', error);
    } finally {
      setIsProcessingExit(false);
    }
  };

  const handleViewHistory = (material: InventoryItem) => {
    setSelectedMaterialForHistory({ id: material.id, name: material.nombre });
    setIsHistoryModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header optimizado para pantalla táctil */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {onBackToEditor && (
              <button
                onClick={onBackToEditor}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Modo Editor</span>
              </button>
            )}
            <div className="flex items-center space-x-4 mx-auto">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-slate-200">
                <img
                  src="https://ecuajugos.com/wp-content/uploads/2019/06/ecuajugos-color@2xv1.png"
                  alt="Ecuajugos Logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="bg-blue-600 p-2 rounded-lg hidden">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900">Consulta de Inventario</h1>
                <p className="text-lg text-slate-600">Sistema de Gestión Industrial - Ecuajugos S.A.</p>
              </div>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Barra de búsqueda optimizada para táctil */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar materiales... (usa * para búsqueda avanzada, ej: *Tuerca*M8*)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm"
            />
          </div>
          
          <div className="flex justify-center">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'critical')}
              className="px-6 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white shadow-sm"
            >
              <option value="all">Todos los niveles de stock</option>
              <option value="low">Stock bajo (≤4)</option>
              <option value="critical">Stock crítico (≤1)</option>
            </select>
          </div>
          
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 bg-white rounded-xl p-2 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5 text-slate-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 text-lg border-0 bg-transparent focus:ring-0 focus:outline-none"
                >
                  <option value="nombre">Nombre</option>
                  <option value="codigo">Código</option>
                  <option value="ubicacion">Ubicación</option>
                </select>
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title={sortOrder === 'asc' ? 'Cambiar a descendente' : 'Cambiar a ascendente'}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="h-5 w-5 text-slate-600" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{items.length}</div>
            <div className="text-slate-600">Total Materiales</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {items.reduce((sum, item) => sum + item.stock, 0).toLocaleString()}
            </div>
            <div className="text-slate-600">Stock Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {items.filter(item => item.stock <= (item.puntoPedido || 5)).length}
            </div>
            <div className="text-slate-600">Stock Crítico</div>
          </div>
        </div>

        {/* Selector de vista */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setCurrentView('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setCurrentView('categories')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                currentView === 'categories'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Categorías</span>
            </button>
          </div>
        </div>

        {/* Lista de materiales */}
        {currentView === 'categories' ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Vista por Categorías</h3>
              <p className="text-sm text-blue-800">
                Los materiales se agrupan automáticamente por categorías basadas en su nombre y tipo.
                Toca cada categoría para expandir o contraer.
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
                        {categoryItems.map(item => {
                          const stockStatus = getStockStatus(item.stock, item);
                          return (
                            <div key={item.id} className="bg-slate-50 rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200 relative">
                              {/* Botón de reasignar categoría */}
                              <button
                                onClick={() => handleReassignCategory(item, category)}
                                className="absolute top-2 right-2 p-1 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                                title="Cambiar categoría"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </button>
                              
                              {/* Botones de acción en la esquina superior derecha */}
                              <div className="absolute top-2 right-10 flex space-x-1">
                                <button
                                  onClick={() => handleViewHistory(item)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                  title="Ver historial de salidas"
                                >
                                  <History className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleMaterialExit(item)}
                                  className="p-1 text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
                                  title="Registrar salida"
                                >
                                  <ShoppingCart className="h-3 w-3" />
                                </button>
                              </div>
                              
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
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.nombre}</h3>
                                    <div className="flex items-center space-x-1 text-sm text-slate-500">
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
                                <div>
                                  <p className="text-sm text-slate-500">Stock disponible</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-2xl font-bold text-slate-900">{item.stock}</p>
                                    <span className="text-sm text-slate-500">{item.unidad}</span>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewHistory(item)}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    <History className="h-3 w-3" />
                                    <span>Historial</span>
                                  </button>
                                  <button
                                    onClick={() => handleMaterialExit(item)}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                  >
                                    <ShoppingCart className="h-3 w-3" />
                                    <span>Salida</span>
                                  </button>
                                </div>
                                
                                {item.stock <= (item.puntoPedido || 5) && (
                                  <div className="flex items-center space-x-1 text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Reabastecer</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="max-w-sm mx-auto">
              <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                <Search className="h-12 w-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                No se encontraron materiales
              </h3>
              <p className="text-lg text-slate-600">
                Intenta ajustar los términos de búsqueda o filtros
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const stockStatus = getStockStatus(item.stock, item);
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
                  {item.foto && (
                    <div className="mb-4">
                      <img
                        src={item.foto}
                        alt={item.nombre}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-3 rounded-lg ${item.tipo === 'ERSA' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {item.foto ? (
                          <Image className={`h-6 w-6 ${item.tipo === 'ERSA' ? 'text-red-600' : 'text-blue-600'}`} />
                        ) : (
                          <Package className={`h-6 w-6 ${item.tipo === 'ERSA' ? 'text-red-600' : 'text-blue-600'}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded ${
                            item.tipo === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.tipo}
                          </span>
                          <span className="text-sm text-slate-500">#{item.codigo}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.nombre}</h3>
                        <div className="flex items-center space-x-2 text-slate-500">
                          <MapPin className="h-5 w-5" />
                          <span className="text-lg">{item.ubicacion}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 mb-1">Stock disponible</p>
                      <div className="flex items-center space-x-3">
                        <p className="text-3xl font-bold text-slate-900">{item.stock}</p>
                        <span className="text-lg text-slate-500">{item.unidad}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleViewHistory(item)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <History className="h-4 w-4" />
                        <span>Historial</span>
                      </button>
                      <button
                        onClick={() => handleMaterialExit(item)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Registrar Salida</span>
                      </button>
                    </div>
                    
                    {item.stock <= (item.puntoPedido || 5) && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                        <span className="font-medium">Reabastecer</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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

      <MaterialExitModal
        isOpen={isExitModalOpen}
        onClose={() => {
          setIsExitModalOpen(false);
          setSelectedMaterialForExit(null);
        }}
        onConfirm={handleConfirmExit}
        material={selectedMaterialForExit}
        isProcessing={isProcessingExit}
      />

      <MaterialExitHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedMaterialForHistory(null);
        }}
        materialId={selectedMaterialForHistory?.id || null}
        materialName={selectedMaterialForHistory?.name || ''}
      />
    </div>
  );
}