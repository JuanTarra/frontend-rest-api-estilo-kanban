import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
export const isMockMode = baseURL?.trim().toLowerCase() === 'mock';

if (!baseURL?.trim()) {
  throw new Error('Falta configurar VITE_API_URL en el entorno del frontend.');
}

export const apiClient = axios.create(
  isMockMode ? {} : { baseURL: baseURL.trim() }
);
