/**
 * Utilitários para manipular o estado de autenticação administrativa
 * armazenado no navegador.
 */

export const ADMIN_AUTH_STORAGE_KEY = 'adminAuth';
export const ADMIN_AUTH_LOGOUT_EVENT = 'admin-auth-logout';

export interface AdminAuthStoredData {
  token: string;
  expiresAt: number;
}

export const loadAdminAuth = (): AdminAuthStoredData | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as AdminAuthStoredData;
    if (!parsed?.token || !parsed?.expiresAt) {
      window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    return null;
  }
};

export const saveAdminAuth = (data: AdminAuthStoredData) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(data));
};

export const clearAdminAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
};

export const notifyAdminAuthLogout = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new Event(ADMIN_AUTH_LOGOUT_EVENT));
};


