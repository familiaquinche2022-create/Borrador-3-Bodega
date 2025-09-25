import React from 'react';
import { Package, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface StatsGridProps {
  items: InventoryItem[];
}

export function StatsGrid({ items }: StatsGridProps) {
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
  const criticalItems = items.filter(item => item.stock <= (item.puntoPedido || 5)).length;
  const uniqueLocations = new Set(items.map(item => item.ubicacion)).size;

  const stats = [
    {
      label: 'Total de Materiales',
      value: totalItems,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Stock Total',
      value: totalStock.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Stock Crítico',
      value: criticalItems,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      label: 'Ubicaciones',
      value: uniqueLocations,
      icon: MapPin,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}