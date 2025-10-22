import type { EditTurn } from '../types';

const HISTORY_KEY = 'imageEditorHistory_global';

export const getHistory = (): EditTurn[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (e) {
    console.error("Failed to get history from localStorage", e);
    return [];
  }
};

export const saveHistory = (history: EditTurn[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {    
    console.error("Failed to save history to localStorage", e);
  }
};

export const clearHistory = (): void => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
        console.error("Failed to clear history from localStorage", e);
    }
};
