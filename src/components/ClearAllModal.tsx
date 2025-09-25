import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface ClearAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isClearing: boolean;
  totalItems: number;
}

export function ClearAllModal({ isOpen, onClose, onConfirm, isClearing, totalItems }: ClearAllModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const requiredText = 'BORRAR TODO';

  const handleConfirm = () => {
    if (confirmText === requiredText) {
      onConfirm();
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Borrar Todo el Inventario</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-2">¡ADVERTENCIA!</h3>
                <p className="text-sm text-red-800">
                  Esta acción eliminará permanentemente <strong>todos los {totalItems} materiales</strong> del inventario.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="confirmText" className="block text-sm font-medium text-slate-700 mb-2">
              Para confirmar, escribe: <strong className="text-red-600">{requiredText}</strong>
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Escribe BORRAR TODO"
              disabled={isClearing}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isClearing}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isClearing || confirmText !== requiredText}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isClearing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Borrando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Borrar Todo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}