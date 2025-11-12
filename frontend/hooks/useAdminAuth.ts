'use client';

import { createContext, useContext } from 'react';

export interface AdminAuthContextValue {
  token: string;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(
  null,
);

export const useAdminAuth = (): AdminAuthContextValue => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      'useAdminAuth deve ser utilizado dentro de um AdminAuthGate',
    );
  }

  return context;
};


