import { MaterialExit, NewMaterialExit } from '../types/materialExit';
import { InventoryItem } from '../types/inventory';

// Local Storage key for material exits
const EXITS_STORAGE_KEY = 'material_exits_data';

// Load exits from localStorage
const loadExitsFromStorage = (): MaterialExit[] => {
  try {
    const stored = localStorage.getItem(EXITS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading exits from localStorage:', error);
    return [];
  }
};

// Save exits to localStorage
const saveExitsToStorage = (data: MaterialExit[]): void => {
  try {
    localStorage.setItem(EXITS_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving exits to localStorage:', error);
  }
};

let currentExits = loadExitsFromStorage();

export const materialExitApi = {
  async getAll(): Promise<MaterialExit[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    currentExits = loadExitsFromStorage();
    return currentExits;
  },

  async create(exitData: NewMaterialExit, material: InventoryItem): Promise<MaterialExit> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    currentExits = loadExitsFromStorage();
    const maxId = currentExits.length > 0 ? Math.max(...currentExits.map(e => e.id)) : 0;
    
    const now = new Date();
    const newExit: MaterialExit = {
      id: maxId + 1,
      materialId: exitData.materialId,
      materialName: material.nombre,
      materialCode: material.codigo,
      materialLocation: material.ubicacion,
      materialType: material.tipo as 'ERSA' | 'UNBW',
      quantity: exitData.quantity,
      remainingStock: material.stock - exitData.quantity,
      personName: exitData.personName,
      personLastName: exitData.personLastName,
      area: exitData.area,
      ceco: exitData.ceco,
      sapCode: exitData.sapCode,
      workOrder: exitData.workOrder,
      exitDate: now.toISOString().split('T')[0],
      exitTime: now.toTimeString().split(' ')[0],
      createdAt: now.toISOString(),
    };
    
    currentExits.push(newExit);
    saveExitsToStorage(currentExits);
    return newExit;
  },

  async getByMaterial(materialId: number): Promise<MaterialExit[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    currentExits = loadExitsFromStorage();
    return currentExits.filter(exit => exit.materialId === materialId);
  },

  async delete(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentExits = loadExitsFromStorage();
    const initialLength = currentExits.length;
    currentExits = currentExits.filter(exit => exit.id !== id);
    if (currentExits.length < initialLength) {
      saveExitsToStorage(currentExits);
      return true;
    }
    return false;
  }
};