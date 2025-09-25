import React, { useState, useEffect } from 'react';
import { X, History, User, Building, Calendar, Package, Trash2 } from 'lucide-react';
import { MaterialExit } from '../types/materialExit';
import { materialExitApi } from '../services/materialExitApi';

interface MaterialExitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: number | null;
  materialName: string;
}

export function MaterialExitHistoryModal({ isOpen, onClose, materialId, materialName }: MaterialExitHistoryModalProps) {
  const [exits, setExits] = useState<MaterialExit[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && materialId) {
      loadExits();
    }
  }, [isOpen, materialId]);

  const loadExits = async () => {
    if (!materialId) return;
    
    try {
      setLoading(true);
      const data = await materialExitApi.getByMaterial(materialId);
      setExits(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading exits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExit = async (exitId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro de salida?')) {
      return;
    }

    try {
      setDeletingId(exitId);
      await materialExitApi.delete(exitId);
      await loadExits();
    } catch (error) {
      console.error('Error deleting exit:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Historial de Salidas</h2>
              <p className="text-sm text-slate-600">{materialName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Cargando historial...</span>
            </div>
          ) : exits.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                <History className="h-12 w-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Sin registros de salida</h3>
              <p className="text-slate-600">Este material no tiene registros de salida aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exits.map((exit) => (
                <div key={exit.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Información de la persona */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-slate-600" />
                          <span className="font-medium text-slate-900">Persona</span>
                        </div>
                        <p className="text-slate-700">{exit.personName} {exit.personLastName}</p>
                      </div>

                      {/* Información del destino */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="h-4 w-4 text-slate-600" />
                          <span className="font-medium text-slate-900">Destino</span>
                        </div>
                        <p className="text-slate-700">{exit.area}</p>
                        {exit.ceco && <p className="text-sm text-slate-600">CECO: {exit.ceco}</p>}
                        {exit.sapCode && <p className="text-sm text-slate-600">SAP: {exit.sapCode}</p>}
                        {exit.workOrder && <p className="text-sm text-slate-600">OT: {exit.workOrder}</p>}
                      </div>

                      {/* Información de cantidad y fecha */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="h-4 w-4 text-slate-600" />
                          <span className="font-medium text-slate-900">Cantidad</span>
                        </div>
                        <p className="text-slate-700 font-semibold">{exit.quantity} unidades</p>
                        <div className="flex items-center space-x-1 text-sm text-slate-600 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{exit.exitDate} - {exit.exitTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de eliminar */}
                    <button
                      onClick={() => handleDeleteExit(exit.id)}
                      disabled={deletingId === exit.id}
                      className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar registro"
                    >
                      {deletingId === exit.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}