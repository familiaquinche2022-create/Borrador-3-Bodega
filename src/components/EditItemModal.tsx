import React, { useState } from 'react';
import { X, Save, Package, Upload, Image } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  item: InventoryItem;
  isSaving: boolean;
}

export function EditItemModal({ isOpen, onClose, onSave, item, isSaving }: EditItemModalProps) {
  const [formData, setFormData] = useState<InventoryItem>(item);
  const [errors, setErrors] = useState<Partial<InventoryItem>>({});
  const [previewImage, setPreviewImage] = useState<string>(item.foto || '');
  const [isUploading, setIsUploading] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<InventoryItem> = {};
    
    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo es requerido';
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El texto breve es requerido';
    }
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }
    
    if (formData.stock < 0) {
      newErrors.stock = 'El stock debe ser mayor o igual a 0';
    }
    
    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        handleInputChange('foto', result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage('');
    handleInputChange('foto', '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Editar Material</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Material *
            </label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.tipo ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="">Seleccionar tipo</option>
              <option value="ERSA">ERSA</option>
              <option value="UNBW">UNBW</option>
            </select>
            {errors.tipo && <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>}
          </div>

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-2">
              Texto breve material *
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.nombre ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Ej: Perno Inox M8x67x1.25"
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-slate-700 mb-2">
              Código del Material *
            </label>
            <input
              type="text"
              id="codigo"
              value={formData.codigo}
              onChange={(e) => handleInputChange('codigo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.codigo ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Ej: 101291876"
            />
            {errors.codigo && <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>}
          </div>
          
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-2">
              Cantidad en Stock *
            </label>
            <input
              type="number"
              id="stock"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.stock ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Ej: 6"
            />
            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
          </div>

          <div>
            <label htmlFor="puntoPedido" className="block text-sm font-medium text-slate-700 mb-2">
              Punto de Pedido (Stock Mínimo) *
            </label>
            <input
              type="number"
              id="puntoPedido"
              value={formData.puntoPedido || 5}
              onChange={(e) => handleInputChange('puntoPedido', parseInt(e.target.value) || 5)}
              min="1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.puntoPedido ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Ej: 10"
            />
            <p className="mt-1 text-xs text-slate-500">Cantidad mínima antes de reabastecer</p>
            {errors.puntoPedido && <p className="mt-1 text-sm text-red-600">{errors.puntoPedido}</p>}
          </div>

          <div>
            <label htmlFor="puntoMaximo" className="block text-sm font-medium text-slate-700 mb-2">
              Punto Máximo (Stock Máximo)
            </label>
            <input
              type="number"
              id="puntoMaximo"
              value={formData.puntoMaximo || 0}
              onChange={(e) => handleInputChange('puntoMaximo', parseInt(e.target.value) || 0)}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.puntoMaximo ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Ej: 50"
            />
            <p className="mt-1 text-xs text-slate-500">Cantidad máxima recomendada (opcional)</p>
            {errors.puntoMaximo && <p className="mt-1 text-sm text-red-600">{errors.puntoMaximo}</p>}
          </div>

          <div>
            <label htmlFor="ubicacion" className="block text-sm font-medium text-slate-700 mb-2">
              Ubicación *
            </label>
            <input
              type="text"
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => handleInputChange('ubicacion', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.ubicacion ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Ej: AT1-A01-01"
            />
            {errors.ubicacion && <p className="mt-1 text-sm text-red-600">{errors.ubicacion}</p>}
          </div>

          <div>
            <label htmlFor="unidad" className="block text-sm font-medium text-slate-700 mb-2">
              Unidad de Medida *
            </label>
            <select
              id="unidad"
              value={formData.unidad}
              onChange={(e) => handleInputChange('unidad', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.unidad ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="UNI">Unidades (UNI)</option>
              <option value="M">Metros (M)</option>
              <option value="KG">Kilogramos (KG)</option>
              <option value="G">Gramos (G)</option>
              <option value="GAL">Galones (GAL)</option>
              <option value="L">Litros (L)</option>
              <option value="CM">Centímetros (CM)</option>
              <option value="M2">Metros Cuadrados (M2)</option>
              <option value="ROL">Rollos (ROL)</option>
            </select>
            {errors.unidad && <p className="mt-1 text-sm text-red-600">{errors.unidad}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Foto del Material (Opcional)
            </label>
            
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Vista previa"
                  className="w-full h-32 object-cover rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="photo-upload-edit"
                />
                <label
                  htmlFor="photo-upload-edit"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <Upload className="h-8 w-8 text-slate-400" />
                  )}
                  <span className="text-sm text-slate-600">
                    {isUploading ? 'Cargando...' : 'Haz clic para subir una foto'}
                  </span>
                  <span className="text-xs text-slate-500">PNG, JPG hasta 10MB</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}