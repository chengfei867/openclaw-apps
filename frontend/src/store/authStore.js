import { create } from 'zustand';
import api from '../api/client.js';

const TOKEN_KEY = 'md-note-token';

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const getErrorMessage = (error) => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.response?.data?.errors?.length) {
    return error.response.data.errors[0].msg;
  }
  return 'Something went wrong. Please try again.';
};

export const useAuthStore = create((set) => ({
  token: getStoredToken(),
  user: null,
  isLoading: false,
  error: null,
  async login({ username, password }) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { username, password });
      setStoredToken(data.token);
      set({ token: data.token, user: data.user ?? null, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async register({ username, password }) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { username, password });
      setStoredToken(data.token);
      set({ token: data.token, user: data.user ?? null, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  logout() {
    setStoredToken(null);
    set({ token: null, user: null, error: null });
  },
}));
