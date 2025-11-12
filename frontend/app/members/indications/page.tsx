'use client';

import { useEffect, useMemo, useState } from 'react';
import { membersApi, indicationsApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import type {
  Indication,
  IndicationList,
  IndicationStatus,
  MemberAuthData,
  MemberSummary,
} from '@/types';

const STATUS_LABELS: Record<IndicationStatus, string> = {
  NEW: 'Nova',
  IN_CONTACT: 'Em Contato',
  CLOSED: 'Fechada',
  DECLINED: 'Recusada',
};

const STATUS_BADGES: Record<IndicationStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_CONTACT: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-green-100 text-green-800',
  DECLINED: 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS: Array<{ value: IndicationStatus; label: string }> = [
  { value: 'NEW', label: 'Nova' },
  { value: 'IN_CONTACT', label: 'Em Contato' },
  { value: 'CLOSED', label: 'Fechada' },
  { value: 'DECLINED', label: 'Recusada' },
];

const MEMBER_AUTH_STORAGE_KEY = 'memberAuth';

export default function MemberIndicationsPage() {
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [indications, setIndications] = useState<IndicationList | null>(null);
  const [auth, setAuth] = useState<MemberAuthData | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingIndications, setLoadingIndications] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [form, setForm] = useState({
    targetMemberId: '',
    contactInfo: '',
    description: '',
  });
  const [loginForm, setLoginForm] = useState({ email: '', secret: '' });
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(MEMBER_AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MemberAuthData;
        if (parsed?.member?.id && parsed?.token) {
          setAuth(parsed);
        }
      } catch {
        window.localStorage.removeItem(MEMBER_AUTH_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setIndications(null);
      return;
    }
    loadIndications(auth.token);
  }, [auth]);

  useEffect(() => {
    if (!auth) {
      setForm((prev) => ({ ...prev, targetMemberId: '' }));
      return;
    }
    const availableTargets = members.filter(
      (member) => member.id !== auth.member.id,
    );

    if (availableTargets.length === 0) {
      setForm((prev) => ({ ...prev, targetMemberId: '' }));
      return;
    }

    if (!availableTargets.some((member) => member.id === form.targetMemberId)) {
      setForm((prev) => ({
        ...prev,
        targetMemberId: availableTargets[0].id,
      }));
    }
  }, [members, auth]);

  const availableTargets = useMemo(() => {
    if (!auth) {
      return members;
    }
    return members.filter((member) => member.id !== auth.member.id);
  }, [auth, members]);

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleUnauthorized = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(MEMBER_AUTH_STORAGE_KEY);
    }
    setAuth(null);
    setIndications(null);
    triggerToast('Sessão expirada. Faça login novamente.', 'error');
  };

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const data = await membersApi.getDirectory();
      setMembers(data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      triggerToast('Não foi possível carregar o diretório de membros.', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadIndications = async (token: string) => {
    try {
      setLoadingIndications(true);
      const data: IndicationList = await indicationsApi.getAll(token);
      setIndications(data);
    } catch (error: any) {
      console.error('Erro ao carregar indicações:', error);
      if (error?.response?.status === 401) {
        handleUnauthorized();
      } else {
        triggerToast('Não foi possível carregar as suas indicações.', 'error');
      }
    } finally {
      setLoadingIndications(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const response: MemberAuthData = await membersApi.login({
        email: loginForm.email,
        secret: loginForm.secret,
      });
      setAuth(response);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          MEMBER_AUTH_STORAGE_KEY,
          JSON.stringify(response),
        );
      }
      triggerToast('Login realizado com sucesso!', 'success');
      setLoginForm({ email: '', secret: '' });
    } catch (error: any) {
      console.error('Erro no login de membro:', error);
      if (error?.response?.status === 401) {
        setLoginError('Credenciais inválidas. Verifique e tente novamente.');
      } else {
        setLoginError('Não foi possível realizar o login. Tente mais tarde.');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(MEMBER_AUTH_STORAGE_KEY);
    }
    setAuth(null);
    setIndications(null);
    triggerToast('Você saiu do sistema de indicações.', 'success');
  };

  const handleCreateIndication = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth) {
      triggerToast('Faça login para criar indicações.', 'error');
      return;
    }

    if (!form.targetMemberId) {
      triggerToast('Selecione o membro que receberá a indicação.', 'error');
      return;
    }

    try {
      setCreating(true);
      await indicationsApi.create(auth.token, {
        targetMemberId: form.targetMemberId,
        contactInfo: form.contactInfo,
        description: form.description,
      });
      triggerToast('Indicação criada com sucesso!', 'success');
      setForm((prev) => ({
        ...prev,
        contactInfo: '',
        description: '',
      }));
      await loadIndications(auth.token);
    } catch (error: any) {
      console.error('Erro ao criar indicação:', error);
      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const message =
        error?.response?.data?.message ||
        'Não foi possível criar a indicação. Tente novamente.';
      triggerToast(message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (
    indication: Indication,
    nextStatus: IndicationStatus,
  ) => {
    if (!auth) {
      triggerToast('Faça login para atualizar indicações.', 'error');
      return;
    }

    try {
      setUpdatingStatusId(indication.id);
      await indicationsApi.updateStatus(auth.token, indication.id, nextStatus);
      triggerToast('Status atualizado com sucesso!', 'success');
      await loadIndications(auth.token);
    } catch (error: any) {
      console.error('Erro ao atualizar status da indicação:', error);
      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const message =
        error?.response?.data?.message ||
        'Não foi possível atualizar o status desta indicação.';
      triggerToast(message, 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Indicações
          </h1>
          <p className="text-gray-600">
            Crie novas oportunidades de negócio para outros membros e acompanhe o andamento das suas indicações.
          </p>
        </div>

        <Card>
          {auth ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Conectado como</p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {auth.member.fullName}
                </h2>
                <p className="text-sm text-gray-600">{auth.member.email}</p>
                <p className="text-sm text-gray-600">{auth.member.company}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadMembers}
                  isLoading={loadingMembers}
                >
                  Atualizar membros
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => auth && loadIndications(auth.token)}
                  isLoading={loadingIndications}
                >
                  Atualizar indicações
                </Button>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleLogin}
              autoComplete="off"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Faça login para acessar suas indicações
                </h2>
                <p className="text-sm text-gray-600">
                  Utilize o e-mail cadastrado e o código secreto recebido após o cadastro.
                </p>
              </div>

              <Input
                label="E-mail"
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                required
              />

              <Input
                label="Código secreto"
                type="password"
                value={loginForm.secret}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    secret: event.target.value,
                  }))
                }
                required
              />

              {loginError && (
                <p className="text-sm text-red-600">{loginError}</p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button type="submit" isLoading={loggingIn}>
                  Entrar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadMembers}
                  isLoading={loadingMembers}
                >
                  Atualizar membros
                </Button>
              </div>
            </form>
          )}
        </Card>

        {auth ? (
          <>
            <form className="mt-8" onSubmit={handleCreateIndication}>
              <Card title="Nova Indicação">
                {availableTargets.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    Não há outros membros disponíveis para receber indicações no momento.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Membro Indicado
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.targetMemberId}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            targetMemberId: event.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">Selecione um membro</option>
                        {availableTargets.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.fullName} — {member.company}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Empresa ou contato indicado"
                      placeholder="Ex: Maria Silva - Empresa XYZ"
                      value={form.contactInfo}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          contactInfo: event.target.value,
                        }))
                      }
                      required
                    />

                    <Textarea
                      label="Descrição da oportunidade"
                      placeholder="Descreva a oportunidade, contexto e próximos passos esperados."
                      value={form.description}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      rows={4}
                      required
                    />

                    <div className="flex justify-end">
                      <Button type="submit" isLoading={creating}>
                        Registrar Indicação
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </form>

            <div className="mt-10 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Indicações que fiz
                </h2>
                {loadingIndications ? (
                  <Card>
                    <div className="text-center py-10 text-gray-600">
                      Carregando suas indicações...
                    </div>
                  </Card>
                ) : indications && indications.created.length > 0 ? (
                  <div className="space-y-4">
                    {indications.created.map((indication) => (
                      <IndicationCard
                        key={indication.id}
                        indication={indication}
                        isOwner
                        updating={updatingStatusId === indication.id}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <div className="text-center py-10 text-gray-600">
                      Você ainda não criou nenhuma indicação.
                    </div>
                  </Card>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Indicações que recebi
                </h2>
                {loadingIndications ? (
                  <Card>
                    <div className="text-center py-10 text-gray-600">
                      Carregando indicações recebidas...
                    </div>
                  </Card>
                ) : indications && indications.received.length > 0 ? (
                  <div className="space-y-4">
                    {indications.received.map((indication) => (
                      <IndicationCard
                        key={indication.id}
                        indication={indication}
                        isOwner={false}
                        updating={updatingStatusId === indication.id}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <div className="text-center py-10 text-gray-600">
                      Nenhum membro indicou uma oportunidade para você ainda.
                    </div>
                  </Card>
                )}
              </section>
            </div>
          </>
        ) : (
          <Card className="mt-8">
            <div className="text-center py-10 text-gray-600">
              Faça login para visualizar, criar e atualizar indicações.
            </div>
          </Card>
        )}
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

interface IndicationCardProps {
  indication: Indication;
  isOwner: boolean;
  updating: boolean;
  onStatusChange: (indication: Indication, status: IndicationStatus) => void;
}

function IndicationCard({
  indication,
  isOwner,
  updating,
  onStatusChange,
}: IndicationCardProps) {
  const counterpart = isOwner ? indication.toMember : indication.fromMember;

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">
              {isOwner ? 'Indicado para' : 'Indicado por'}
            </p>
            <h3 className="text-xl font-semibold text-gray-900">
              {counterpart.fullName}
            </h3>
            <p className="text-sm text-gray-600">{counterpart.company}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGES[indication.status]}`}
          >
            {STATUS_LABELS[indication.status]}
          </span>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700">Empresa/Contato</p>
          <p className="text-sm text-gray-600">{indication.contactInfo}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700">
            Descrição da oportunidade
          </p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {indication.description}
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs text-gray-500">
            Criada em{' '}
            {new Date(indication.createdAt).toLocaleString('pt-BR')}
          </p>
          {isOwner ? (
            <p className="text-xs text-gray-500">
              Apenas o membro indicado pode atualizar o status.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">
                Atualizar status:
              </label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={indication.status}
                onChange={(event) =>
                  onStatusChange(
                    indication,
                    event.target.value as IndicationStatus,
                  )
                }
                disabled={updating}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}


