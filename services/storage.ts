import { Transaction, Customer, TelegramSettings, CompanyProfile } from '../types';

/**
 * This is a mock API service that uses localStorage to persist data.
 * It's designed to simulate calls to a backend and can be easily replaced
 * with actual HTTP requests (e.g., using fetch) to a real server.
 * This makes the application "backend-ready" for cloud data synchronization.
 */

interface AppData {
  transactions: Transaction[];
  customers: Customer[];
  telegramSettings: TelegramSettings;
  companyProfile: CompanyProfile;
}

const STORAGE_KEY = 'damar_global_network_data';

/**
 * Simulates fetching all application data from a server.
 * @returns A promise that resolves with the application data.
 */
export const getAppData = async (): Promise<AppData> => {
  // Simulate network delay for a more realistic feel
  await new Promise(resolve => setTimeout(resolve, 500)); 
  
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error("Failed to parse data from localStorage", error);
    // If parsing fails, we'll fall back to the default state.
  }
  
  // Return default initial state if no data is found in storage.
  return {
    transactions: [],
    customers: [],
    telegramSettings: {
      enabled: false,
      botToken: '',
      chatId: '',
    },
    companyProfile: {
      name: 'Damar Global Network',
      address: 'Jl. Kemajuan No. 123, Jakarta Pusat, Indonesia',
      contactPerson: 'Mardi Jayadi',
      email: 'kontak@damarglobal.net',
      logo: '',
    },
  };
};

/**
 * Simulates saving all application data to a server.
 * @param data The complete application data object to save.
 * @returns A promise that resolves when the data has been saved.
 */
export const saveAppData = async (data: AppData): Promise<void> => {
  // We don't simulate a delay here to make the UI feel responsive.
  // In a real app, you might show a "saving..." indicator.
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage", error);
  }
};
