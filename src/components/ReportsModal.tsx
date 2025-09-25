import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Download, Calendar, Package, User, Building } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MaterialExit } from '../types/materialExit';
import { materialExitApi } from '../services/materialExitApi';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportsModal({ isOpen, onClose }: ReportsModalProps) {
  const [exits, setExits] = useState<MaterialExit[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadExits();
      // Set default dates (last 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
      setDateTo(today.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const loadExits = async () => {
    try {
      setLoading(true);
      const data = await materialExitApi.getAll();
      setExits(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading exits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredExits = () => {
    return exits.filter(exit => {
      const exitDate = new Date(exit.exitDate);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && exitDate < fromDate) return false;
      if (toDate && exitDate > toDate) return false;
      
      return true;
    });
  };

  const downloadExcel = (type: 'all' | 'ERSA' | 'UNBW') => {
    const filteredExits = getFilteredExits();
    let dataToExport = filteredExits;

    if (type !== 'all') {
      dataToExport = filteredExits.filter(exit => exit.materialType === type);
    }

    if (dataToExport.length === 0) {
      alert('No hay datos para exportar con los filtros seleccionados');
      return;
    }

    // Preparar datos para Excel
    const excelData = dataToExport.map(exit => ({
      'Fecha': exit.exitDate,
      'Hora': exit.exitTime,
      'Tipo Material': exit.materialType,
      'Código Material': exit.materialCode,
      'Nombre Material': exit.materialName,
      'Ubicación': exit.materialLocation,
      'Cantidad': exit.quantity,
      'Stock Restante': exit.remainingStock,
      'Nombre Persona': exit.personName,
      'Apellido Persona': exit.personLastName,
      'Área Destino': exit.area,
      'CECO': exit.ceco || '',
      'Código SAP': exit.sapCode || '',
      'Orden de Trabajo': exit.workOrder || '',
    }));

    // Crear libro de Excel
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Configurar ancho de columnas
    const colWidths = [
      { wch: 12 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 12 }, // Tipo Material
      { wch: 15 }, // Código Material
      { wch: 30 }, // Nombre Material
      { wch: 15 }, // Ubicación
      { wch: 10 }, // Cantidad
      { wch: 12 }, // Stock Restante
      { wch: 15 }, // Nombre Persona
      { wch: 15 }, // Apellido Persona
      { wch: 20 }, // Área Destino
      { wch: 10 }, // CECO
      { wch: 15 }, // Código SAP
      { wch: 15 }, // Orden de Trabajo
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Salidas ${type === 'all' ? 'Todas' : type}`);
    
    const fileName = `salidas_materiales_${type === 'all' ? 'todas' : type.toLowerCase()}_${dateFrom}_${dateTo}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (!isOpen) return null;

  const filteredExits = getFilteredExits();
  const ersaExits = filteredExits.filter(exit => exit.materialType === 'ERSA');
  const unbwExits = filteredExits.filter(exit => exit.materialType === 'UNBW');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Reportes de Salidas</h2>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-slate-600">Cargando reportes...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filtros de fecha */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-4 flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Filtros de Fecha</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dateFrom" className="block text-sm font-medium text-slate-700 mb-2">
                      Desde
                    </label>
                    <input
                      type="date"
                      id="dateFrom"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateTo" className="block text-sm font-medium text-slate-700 mb-2">
                      Hasta
                    </label>
                    <input
                      type="date"
                      id="dateTo"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{filteredExits.length}</div>
                  <div className="text-blue-800 font-medium">Total Salidas</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">{ersaExits.length}</div>
                  <div className="text-red-800 font-medium">Salidas ERSA</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{unbwExits.length}</div>
                  <div className="text-green-800 font-medium">Salidas UNBW</div>
                </div>
              </div>

              {/* Botones de descarga */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="font-medium text-slate-900 mb-4 flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Descargar Reportes</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => downloadExcel('all')}
                    disabled={filteredExits.length === 0}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>Todas las Salidas</span>
                  </button>
                  <button
                    onClick={() => downloadExcel('ERSA')}
                    disabled={ersaExits.length === 0}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition-colors"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>Solo ERSA</span>
                  </button>
                  <button
                    onClick={() => downloadExcel('UNBW')}
                    disabled={unbwExits.length === 0}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>Solo UNBW</span>
                  </button>
                </div>
              </div>

              {/* Vista previa de datos */}
              {filteredExits.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="font-medium text-slate-900 mb-4">Vista Previa (últimas 10 salidas)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-slate-200 rounded-lg">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Fecha</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Tipo</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Material</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Cantidad</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Persona</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">Área</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExits.slice(0, 10).map((exit) => (
                          <tr key={exit.id} className="border-b border-slate-100">
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {exit.exitDate} {exit.exitTime}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                exit.materialType === 'ERSA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {exit.materialType}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {exit.materialName}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600 font-medium">
                              {exit.quantity}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {exit.personName} {exit.personLastName}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {exit.area}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredExits.length > 10 && (
                    <p className="text-sm text-slate-500 mt-2 text-center">
                      ...y {filteredExits.length - 10} salidas más
                    </p>
                  )}
                </div>
              )}

              {filteredExits.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                    <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Sin registros</h3>
                  <p className="text-slate-600">No hay salidas de materiales en el rango de fechas seleccionado.</p>
                </div>
              )}
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