export interface MaterialExit {
  id: number;
  materialId: number;
  materialName: string;
  materialCode: string;
  materialLocation: string;
  materialType: 'ERSA' | 'UNBW';
  quantity: number;
  remainingStock: number;
  
  // Datos de la persona
  personName: string;
  personLastName: string;
  
  // Datos del destino
  area: string;
  ceco?: string; // Centro de costos (opcional)
  sapCode?: string; // Código SAP (opcional)
  
  // Para materiales ERSA
  workOrder?: string; // OT - Orden de trabajo (obligatorio para ERSA)
  
  // Metadatos
  exitDate: string;
  exitTime: string;
  createdAt: string;
}

export interface NewMaterialExit {
  materialId: number;
  quantity: number;
  personName: string;
  personLastName: string;
  area: string;
  ceco?: string;
  sapCode?: string;
  workOrder?: string; // Obligatorio para ERSA
}