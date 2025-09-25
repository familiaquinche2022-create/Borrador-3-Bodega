import React, { useState } from 'react';
import { X, ShoppingCart, Package, User, Building, Hash, Calendar, Clock } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { NewMaterialExit } from '../types/materialExit';

interface MaterialExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (exitData: NewMaterialExit) => void;
  material: InventoryItem | null;
  isProcessing: boolean;
}

export function MaterialExitModal({ isOpen, onClose, onConfirm, material, isProcessing }: MaterialExitModalProps) {
  const [formData, setFormData] = useState<NewMaterialExit>({
    materialId: 0,
    quantity: 1,
    personName: '',
    personLastName: '',
    area: '',
    ceco: '',
    sapCode: '',
    workOrder: '',
  });

  const [errors, setErrors] = useState<Partial<NewMaterialExit>>({});

  const validateForm = () => {
    const newErrors: Partial<NewMaterialExit> = {};

    if (!formData.personName.trim()) {
      newErrors.personName = 'El nombre es requerido';
    }

    if (!formData.personLastName.trim()) {
      newErrors.personLastName = 'El apellido es requerido';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'El área es requerida';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    if (material && formData.quantity > material.stock) {
      newErrors.quantity = `No hay suficiente stock (disponible: ${material.stock})`;
    }

    // Para materiales ERSA, la OT es obligatoria
    if (material?.tipo === 'ERSA' && !formData.workOrder?.trim()) {
      newErrors.workOrder = 'La Orden de Trabajo es obligatoria para materiales ERSA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!material || !validateForm()) return;

    const exitData: NewMaterialExit = {
      ...formData,
      materialId: material.id,
    };

    onConfirm(exitData);
  };

  const handleInputChange = (field: keyof NewMaterialExit, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    setFormData({
      materialId: 0,
      quantity: 1,
      personName: '',
      personLastName: '',
      area: '',
      ceco: '',
      sapCode: '',
      workOrder: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !material) return null;

  const currentDate = new Date().toLocaleDateString('es-ES');
  const currentTime = new Date().toLocaleTimeString('es-ES');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Registrar Salida de Material</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Material */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Información del Material</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-700">Nombre:</span>
                <p className="text-slate-900">{material.nombre}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Código:</span>
                <p className="text-slate-900">{material.codigo}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Ubicación:</span>
                <p className="text-slate-900">{material.ubicacion}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Stock Disponible:</span>
                <p className="text-slate-900 font-semibold">{material.stock} {material.unidad}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Tipo:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  material.tipo === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {material.tipo}
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Fecha y Hora:</span>
                <p className="text-slate-900">{currentDate} - {currentTime}</p>
              </div>
            </div>
          </div>

          {/* Datos de la Persona */}
          <div>
            <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Datos de la Persona</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="personName" className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="personName"
                  value={formData.personName}
                  onChange={(e) => handleInputChange('personName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.personName ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Ej: Juan"
                />
                {errors.personName && <p className="mt-1 text-sm text-red-600">{errors.personName}</p>}
              </div>

              <div>
                <label htmlFor="personLastName" className="block text-sm font-medium text-slate-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="personLastName"
                  value={formData.personLastName}
                  onChange={(e) => handleInputChange('personLastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.personLastName ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Ej: Pérez"
                />
                {errors.personLastName && <p className="mt-1 text-sm text-red-600">{errors.personLastName}</p>}
              </div>
            </div>
          </div>

          {/* Datos del Destino */}
          <div>
            <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Datos del Destino</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-slate-700 mb-2">
                  Área *
                </label>
                <input
                  type="text"
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.area ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Ej: Producción, Mantenimiento"
                />
                {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
              </div>

              <div>
                <label htmlFor="ceco" className="block text-sm font-medium text-slate-700 mb-2">
                  CECO (Centro de Costos)
                </label>
                <input
                  type="text"
                  id="ceco"
                  value={formData.ceco}
                  onChange={(e) => handleInputChange('ceco', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Ej: CC001"
                />
              </div>

              <div>
                <label htmlFor="sapCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Código SAP
                </label>
                <input
                  type="text"
                  id="sapCode"
                  value={formData.sapCode}
                  onChange={(e) => handleInputChange('sapCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Ej: SAP123456"
                />
              </div>

              {material.tipo === 'ERSA' && (
                <div>
                  <label htmlFor="workOrder" className="block text-sm font-medium text-slate-700 mb-2">
                    OT (Orden de Trabajo) *
                  </label>
                  <input
                    type="text"
                    id="workOrder"
                    value={formData.workOrder}
                    onChange={(e) => handleInputChange('workOrder', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.workOrder ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Ej: OT202401001"
                  />
                  {errors.workOrder && <p className="mt-1 text-sm text-red-600">{errors.workOrder}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <h3 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
              <Hash className="h-5 w-5" />
              <span>Cantidad a Retirar</span>
            </h3>
            <div className="max-w-xs">
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                min="1"
                max={material.stock}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                  errors.quantity ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              <p className="mt-1 text-xs text-slate-500">
                Stock disponible: {material.stock} {material.unidad}
              </p>
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Registrar Salida</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}