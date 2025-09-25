import { InventoryItem, NewInventoryItem } from '../types/inventory';

// Local Storage key for persistence
const STORAGE_KEY = 'inventario_industrial_data';

// Load data from localStorage
const loadFromStorage = (): InventoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

// Save data to localStorage
const saveToStorage = (data: InventoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

let currentInventory = loadFromStorage();

export const inventoryApi = {
  async getAll(): Promise<InventoryItem[]> {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Always load fresh data from storage
    currentInventory = loadFromStorage();
    return currentInventory;
  },

  async getById(id: number): Promise<InventoryItem | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return currentInventory.find(item => item.id === id) || null;
  },

  async create(item: NewInventoryItem): Promise<InventoryItem> {
    await new Promise(resolve => setTimeout(resolve, 400));
    currentInventory = loadFromStorage();
    const maxId = currentInventory.length > 0 ? Math.max(...currentInventory.map(i => i.id)) : 0;
    const newItem: InventoryItem = {
      id: maxId + 1,
      ...item,
    };
    currentInventory.push(newItem);
    saveToStorage(currentInventory);
    return newItem;
  },

  async createBulk(items: NewInventoryItem[]): Promise<InventoryItem[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    currentInventory = loadFromStorage();
    const maxId = currentInventory.length > 0 ? Math.max(...currentInventory.map(i => i.id)) : 0;
    const newItems: InventoryItem[] = items.map((item, index) => ({
      id: maxId + index + 1,
      ...item,
    }));
    currentInventory.push(...newItems);
    saveToStorage(currentInventory);
    return newItems;
  },

  async updateStock(id: number, stock: number): Promise<InventoryItem | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentInventory = loadFromStorage();
    const item = currentInventory.find(item => item.id === id);
    if (item) {
      item.stock = stock;
      saveToStorage(currentInventory);
      return item;
    }
    return null;
  },

  async update(id: number, updatedItem: Partial<InventoryItem>): Promise<InventoryItem | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    currentInventory = loadFromStorage();
    const itemIndex = currentInventory.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      currentInventory[itemIndex] = { ...currentInventory[itemIndex], ...updatedItem };
      saveToStorage(currentInventory);
      return currentInventory[itemIndex];
    }
    return null;
  },

  async delete(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentInventory = loadFromStorage();
    const initialLength = currentInventory.length;
    currentInventory = currentInventory.filter(item => item.id !== id);
    if (currentInventory.length < initialLength) {
      saveToStorage(currentInventory);
      return true;
    }
    return false;
  },

  async clearAll(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    currentInventory = [];
    saveToStorage(currentInventory);
    return true;
  },

  // Real API calls (uncomment when backend is running)
  /*
  async getAll(): Promise<InventoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/inventario`);
    return response.json();
  },

  async getById(id: number): Promise<InventoryItem | null> {
    const response = await fetch(`${API_BASE_URL}/inventario/${id}`);
    if (response.status === 404) return null;
    return response.json();
  },

  async create(item: NewInventoryItem): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/inventario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return response.json();
  },

  async updateStock(id: number, stock: number): Promise<InventoryItem | null> {
    const response = await fetch(`${API_BASE_URL}/inventario/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    });
    if (response.status === 404) return null;
    return response.json();
  },
  */
};