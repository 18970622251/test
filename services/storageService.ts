import { Category, Exhibit, INITIAL_CATEGORIES, INITIAL_EXHIBITS } from '../types';

const CATEGORY_KEY = 'history_app_categories';
const EXHIBIT_KEY = 'history_app_exhibits';

// Helpers to simulate backend delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const StorageService = {
  // --- Category Operations ---
  getCategories: async (): Promise<Category[]> => {
    await delay(300); // Simulate network
    const data = localStorage.getItem(CATEGORY_KEY);
    if (!data) {
      localStorage.setItem(CATEGORY_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(data);
  },

  saveCategories: async (categories: Category[]): Promise<void> => {
    await delay(300);
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
  },

  // --- Exhibit Operations ---
  getExhibits: async (): Promise<Exhibit[]> => {
    await delay(300);
    const data = localStorage.getItem(EXHIBIT_KEY);
    if (!data) {
      localStorage.setItem(EXHIBIT_KEY, JSON.stringify(INITIAL_EXHIBITS));
      return INITIAL_EXHIBITS;
    }
    return JSON.parse(data);
  },

  getExhibitsByCategory: async (categoryId: string): Promise<Exhibit[]> => {
    const all = await StorageService.getExhibits();
    return all.filter(e => e.categoryId === categoryId);
  },

  saveExhibits: async (exhibits: Exhibit[]): Promise<void> => {
    await delay(300);
    localStorage.setItem(EXHIBIT_KEY, JSON.stringify(exhibits));
  },

  // --- Utility ---
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
};
