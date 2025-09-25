import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import { InventoryItem } from '../types/inventory';
import { AlertTriangle, TrendingUp, Package } from 'lucide-react';

interface StockCriticalityChartsProps {
  items: InventoryItem[];
}

export function StockCriticalityCharts({ items }: StockCriticalityChartsProps) {
  // Calcular estadísticas de criticidad
  const criticalityStats = items.reduce((acc, item) => {
    const puntoPedido = item.puntoPedido || 5;
    const criticalThreshold = Math.floor(puntoPedido / 2);
    
    if (item.stock <= criticalThreshold) {
      acc.critical++;
    } else if (item.stock <= puntoPedido) {
      acc.low++;
    } else {
      acc.normal++;
    }
    
    return acc;
  }, { critical: 0, low: 0, normal: 0 });

  // Datos para gráfica de pastel
  const pieData = [
    { name: 'Stock Normal', value: criticalityStats.normal, color: '#10b981' },
    { name: 'Stock Bajo', value: criticalityStats.low, color: '#f59e0b' },
    { name: 'Stock Crítico', value: criticalityStats.critical, color: '#ef4444' }
  ];

  // Datos para gráfica de barras por categoría
  const categoryStats = items.reduce((acc, item) => {
    const category = item.categoria || 'Sin Categoría';
    const puntoPedido = item.puntoPedido || 5;
    const criticalThreshold = Math.floor(puntoPedido / 2);
    
    if (!acc[category]) {
      acc[category] = { category, normal: 0, low: 0, critical: 0 };
    }
    
    if (item.stock <= criticalThreshold) {
      acc[category].critical++;
    } else if (item.stock <= puntoPedido) {
      acc[category].low++;
    } else {
      acc[category].normal++;
    }
    
    return acc;
  }, {} as Record<string, { category: string; normal: number; low: number; critical: number }>);

  const barData = Object.values(categoryStats).slice(0, 8); // Mostrar solo las primeras 8 categorías

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value} materiales`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfica de Pastel - Distribución General */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Distribución de Stock</h3>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Normal</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{criticalityStats.normal}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Bajo</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{criticalityStats.low}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Crítico</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{criticalityStats.critical}</p>
          </div>
        </div>
      </div>

      {/* Gráfica de Barras - Por Categoría */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Criticidad por Categoría</h3>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="normal" stackId="a" fill="#10b981" name="Normal" />
            <Bar dataKey="low" stackId="a" fill="#f59e0b" name="Bajo" />
            <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Crítico" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Indicadores de Alerta */}
      {(criticalityStats.critical > 0 || criticalityStats.low > 0) && (
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Alertas de Stock</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalityStats.critical > 0 && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Stock Crítico</span>
                  </div>
                  <p className="text-red-800">
                    <span className="text-2xl font-bold">{criticalityStats.critical}</span> materiales requieren reabastecimiento inmediato
                  </p>
                </div>
              )}
              
              {criticalityStats.low > 0 && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Stock Bajo</span>
                  </div>
                  <p className="text-yellow-800">
                    <span className="text-2xl font-bold">{criticalityStats.low}</span> materiales próximos al punto de pedido
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}