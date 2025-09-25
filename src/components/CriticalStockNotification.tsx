import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Package } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface CriticalStockNotificationProps {
  items: InventoryItem[];
}

export function CriticalStockNotification({ items }: CriticalStockNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const criticalItems = items.filter(item => {
    const puntoPedido = item.puntoPedido || 5;
    return item.stock <= Math.floor(puntoPedido / 2);
  });

  useEffect(() => {
    if (criticalItems.length > 0 && !hasShown) {
      setIsVisible(true);
      setHasShown(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [criticalItems.length, hasShown]);

  if (!isVisible || criticalItems.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              ¡Stock Crítico Detectado!
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p className="mb-2">
                {criticalItems.length} material{criticalItems.length > 1 ? 'es' : ''} en estado crítico:
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {criticalItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center space-x-2 text-xs">
                    <Package className="h-3 w-3" />
                    <span className="font-medium">{item.nombre}</span>
                    <span className="text-red-600">({item.stock} {item.unidad})</span>
                  </div>
                ))}
                {criticalItems.length > 5 && (
                  <p className="text-xs font-medium">
                    ...y {criticalItems.length - 5} más
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}