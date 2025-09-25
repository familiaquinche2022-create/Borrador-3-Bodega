import React from 'react';
import { Package, Wrench } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border border-slate-200">
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
              <div>
                <h1 className="text-xl font-bold text-slate-900">Mi bodega EJ-TEC</h1>
                <p className="text-sm text-slate-600">Sistema de Gestión Industrial -  Ecuajugos S.A.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Wrench className="h-5 w-5" />
              <span className="text-sm font-medium">Stock de Inventario</span>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}