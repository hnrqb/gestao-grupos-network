'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { adminAuthApi } from '@/lib/api';
import {
  ADMIN_AUTH_LOGOUT_EVENT,
  AdminAuthStoredData,
  clearAdminAuth,
  loadAdminAuth,
  notifyAdminAuthLogout,
  saveAdminAuth,
} from '@/lib/admin-auth';
import { AdminAuthContext } from '@/hooks/useAdminAuth';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [auth, setAuth] = useState<AdminAuthStoredData | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [keyInput, setKeyInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'info',
  );
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
    },
    [],
  );

  const hydrateAuthFromStorage = useCallback(() => {
    const stored = loadAdminAuth();
    setAuth(stored);
    setInitializing(false);
  }, []);

  useEffect(() => {
    hydrateAuthFromStorage();
  }, [hydrateAuthFromStorage]);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setAuth(null);
      setKeyInput('');
      showToastMessage('Sessão administrativa encerrada. Faça login novamente.', 'info');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(ADMIN_AUTH_LOGOUT_EVENT, handleLogoutEvent);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(ADMIN_AUTH_LOGOUT_EVENT, handleLogoutEvent);
      }
    };
  }, [showToastMessage]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!keyInput.trim()) {
      showToastMessage('Informe a chave administrativa.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await adminAuthApi.login({ key: keyInput.trim() });
      const expiresAt = Date.now() + response.expiresIn * 1000;
      const stored: AdminAuthStoredData = {
        token: response.token,
        expiresAt,
      };
      saveAdminAuth(stored);
      setAuth(stored);
      setKeyInput('');
      showToastMessage('Autenticação realizada com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao autenticar administrador:', error);
      showToastMessage(
        error?.response?.data?.message ||
          'Não foi possível autenticar. Verifique a chave informada.',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = useCallback(() => {
    clearAdminAuth();
    notifyAdminAuthLogout();
    setAuth(null);
    setKeyInput('');
  }, []);

  const contextValue = useMemo(() => {
    if (!auth) {
      return null;
    }

    return {
      token: auth.token,
      logout: handleLogout,
    };
  }, [auth, handleLogout]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <div className="w-full text-center text-gray-600">
            Verificando sessão administrativa...
          </div>
        </Card>
      </div>
    );
  }

  if (!auth || !contextValue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <Card>
            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <div className="mb-2 text-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Área Administrativa
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Informe a chave administrativa para acessar o painel.
                </p>
              </div>

              <Input
                label="Chave administrativa"
                type="password"
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
                placeholder="Insira a chave fornecida"
                required
              />

              <Button type="submit" isLoading={isSubmitting}>
                Entrar
              </Button>
            </form>
          </Card>
        </div>

        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </AdminAuthContext.Provider>
  );
}


