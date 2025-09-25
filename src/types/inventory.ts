export interface InventoryItem {
  id: number;
  tipo: string;
  nombre: string;
  codigo: string;
  ubicacion: string;
  stock: number;
  unidad: string;
  puntoPedido?: number;
  puntoMaximo?: number;
  foto?: string;
  categoria?: string;
}

export interface NewInventoryItem {
  tipo: string;
  nombre: string;
  codigo: string;
  ubicacion: string;
  stock: number;
  unidad: string;
  puntoPedido?: number;
  puntoMaximo?: number;
  foto?: string;
  categoria?: string;
}