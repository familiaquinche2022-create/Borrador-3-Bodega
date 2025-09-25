import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { NewInventoryItem } from '../types/inventory';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: NewInventoryItem[]) => void;
  isImporting: boolean;
}

interface ImportResult {
  success: NewInventoryItem[];
  errors: { row: number; error: string; data: any }[];
}

export function ImportExcelModal({ isOpen, onClose, onImport, isImporting }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = () => {
    const templateData = [
      {
        'Tp.M': 'UNBW',
        'Texto breve mat.(idioma tr.)': 'Tornillo M8',
        'Material': '101290797',
        'Ubic.': 'AT1-A01-01',
        'Ctd.stock': 100,
        'UMB': 'UNI',
        'Punto pedi': 10,
        'Máx.nivel': 50,
        'Foto (URL opcional)': 'https://ejemplo.com/imagen.jpg'
      },
      {
        'Tp.M': 'ERSA',
        'Texto breve mat.(idioma tr.)': 'Correa Industrial',
        'Material': '101290797',
        'Ubic.': 'Estante B2',
        'Ctd.stock': 25,
        'UMB': 'M',
        'Punto pedi': 5,
        'Máx.nivel': 20,
        'Foto (URL opcional)': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Inventario');
    XLSX.writeFile(wb, 'plantilla_inventario.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setImportResult(null);
      processExcelFile(uploadedFile);
    }
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setPreviewData(jsonData.slice(0, 7)); // Show first 5 rows for preview
      validateAndProcessData(jsonData);
    } catch (error) {
      console.error('Error processing Excel file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateAndProcessData = (data: any[]) => {
    const result: ImportResult = {
      success: [],
      errors: []
    };

    data.forEach((row, index) => {
      try {
        // Map different possible column names
        const tipo = row['Tp.M'] || row['Tipo'] || row['Tipo de Material'] || row['tipo'] || '';
        const nombre = row['Texto breve mat.(idioma tr.)'] || row['Texto breve material (idioma trabajo)'] || row['Texto breve material'] || row['Nombre'] || row['nombre'] || '';
        const codigo = row['Material'] || row['Codigo'] || row['Cod_Material'] || row['codigo'] || '';
        const ubicacion = row['Ubic.'] || row['Ubicación'] || row['Ubicacion'] || row['Location'] || row['ubicacion'] || '';
        const stock = parseInt(String(row['Ctd.stock'] || row['Stock'] || row['Cantidad'] || row['stock'] || '0'));
        const unidad = String(row['UMB'] || row['Unidad'] || row['Unidad de Medida'] || row['Unit'] || row['unidad'] || row['UM'] || row['U.M.'] || 'UNI').trim();
        const puntoPedido = parseInt(String(row['Punto pedi'] || row['Punto de Pedido'] || row['Punto Pedido'] || row['Min Stock'] || row['Minimo'] || row['puntoPedido'] || '5'));
        const puntoMaximo = parseInt(String(row['Máx.nivel'] || row['Punto Maximo'] || row['Max Stock'] || row['Maximo'] || row['puntoMaximo'] || '0'));
        const foto = row['Foto (URL opcional)'] || row['Foto'] || row['URL'] || row['foto'] || '';

        // Validation
        if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
          result.errors.push({
            row: index + 2,
            error: 'Tipo de material es requerido',
            data: row
          });
          return;
        }

        if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
          result.errors.push({
            row: index + 2, // +2 because Excel rows start at 1 and we have headers
            error: 'Texto breve material es requerido',
            data: row
          });
          return;
        }

        if (!codigo || String(codigo).trim() === '') {
          result.errors.push({
            row: index + 2,
            error: 'Código del material es requerido',
            data: row
          });
          return;
        }

        if (isNaN(stock) || stock < 0) {
          result.errors.push({
            row: index + 2,
            error: 'Stock debe ser un número mayor o igual a 0',
            data: row
          });
          return;
        }

        if (!ubicacion || typeof ubicacion !== 'string' || ubicacion.trim() === '') {
          result.errors.push({
            row: index + 2,
            error: 'Ubicación es requerida',
            data: row
          });
          return;
        }

        // Valid item
        result.success.push({
          tipo: tipo.trim(),
          nombre: nombre.trim(),
          codigo: String(codigo).trim(),
          ubicacion: ubicacion.trim(),
          stock,
          unidad: unidad,
          puntoPedido: isNaN(puntoPedido) ? 5 : puntoPedido,
          puntoMaximo: isNaN(puntoMaximo) ? 0 : puntoMaximo,
          foto: foto ? foto.trim() : ''
        });

      } catch (error) {
        result.errors.push({
          row: index + 2,
          error: 'Error procesando fila: ' + (error as Error).message,
          data: row
        });
      }
    });

    setImportResult(result);
  };

  const handleImport = () => {
    if (importResult && importResult.success.length > 0) {
      onImport(importResult.success);
    }
  };

  const resetModal = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Importar desde Excel</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!file ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <Upload className="h-12 w-12 text-slate-400" />
                    <div>
                      <p className="text-lg font-medium text-slate-900">
                        Selecciona un archivo Excel
                      </p>
                      <p className="text-sm text-slate-600">
                        Formatos soportados: .xlsx, .xls
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Formato requerido:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Tp.M:</strong> Tipo de material - ERSA o UNBW (requerido)</p>
                  <p>• <strong>Texto breve mat.(idioma tr.):</strong> Texto (requerido)</p>
                  <p>• <strong>Material:</strong> Código del material (requerido)</p>
                  <p>• <strong>Ubic.:</strong> Ubicación (requerido)</p>
                  <p>• <strong>Ctd.stock:</strong> Cantidad en stock (requerido)</p>
                  <p>• <strong>UMB:</strong> UNI, M, KG, G, GAL, L, CM, M2, ROL (opcional, por defecto UNI)</p>
                  <p>• <strong>Punto pedi:</strong> Cantidad mínima para reabastecimiento (opcional, por defecto 5)</p>
                  <p>• <strong>Máx.nivel:</strong> Cantidad máxima (opcional, por defecto 0)</p>
                  <p>• <strong>Foto (URL opcional):</strong> URL de imagen (opcional)</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar Plantilla</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-slate-900">{file.name}</span>
                </div>
                <button
                  onClick={resetModal}
                  className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cambiar archivo
                </button>
              </div>

              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600">Procesando archivo...</span>
                </div>
              ) : importResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          {importResult.success.length} materiales válidos
                        </span>
                      </div>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-900">
                            {importResult.errors.length} errores encontrados
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {previewData.length > 0 && (
                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">Vista previa (primeras 5 filas):</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-slate-200 rounded-lg">
                          <thead className="bg-slate-50">
                            <tr>
                              {Object.keys(previewData[0]).map((key) => (
                                <th key={key} className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.map((row, index) => (
                              <tr key={index} className="border-b border-slate-100">
                                {Object.values(row).map((value: any, cellIndex) => (
                                  <td key={cellIndex} className="px-4 py-2 text-sm text-slate-600">
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {importResult.errors.length > 0 && (
                    <div>
                      <h3 className="font-medium text-red-900 mb-3">Errores encontrados:</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-800 mb-2">
                            <strong>Fila {error.row}:</strong> {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          {importResult && importResult.success.length > 0 && (
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Importar {importResult.success.length} materiales</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}