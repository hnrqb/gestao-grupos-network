'use client';

import { useState, useEffect, useCallback } from 'react';
import { applicationsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import type { Application } from '@/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const { logout } = useAdminAuth();

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await applicationsApi.getAll(filter || undefined);
      setApplications(data);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        logout();
      } else {
        setToastMessage('Não foi possível carregar as aplicações.');
        setToastType('error');
        setShowToast(true);
      }
    } finally {
      setLoading(false);
    }
  }, [filter, logout]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleFilterClick = (value: string) => {
    if (value === filter) {
      loadApplications();
    } else {
      setFilter(value);
    }
  };

  const handleApproveClick = (app: Application) => {
    setSelectedApp(app);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedApp) return;

    try {
      setActionLoading(true);
      setShowApproveModal(false);
      const response = await applicationsApi.approve(selectedApp.id);
      setInviteLink(response.inviteLink);
      setShowSuccessModal(true);
      await loadApplications();
    } catch (error: any) {
      setToastMessage(error.response?.data?.message || 'Erro ao aprovar aplicação');
      setToastType('error');
      setShowToast(true);
    } finally {
      setActionLoading(false);
      setSelectedApp(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('Link copiado para área de transferência!');
    setToastType('success');
    setShowToast(true);
  };

  const handleRejectClick = (app: Application) => {
    setSelectedApp(app);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!selectedApp) return;

    try {
      setActionLoading(true);
      await applicationsApi.reject(selectedApp.id, rejectionReason);
      setShowRejectModal(false);
      setToastMessage('Aplicação rejeitada com sucesso!');
      setToastType('success');
      setShowToast(true);
      setSelectedApp(null);
      await loadApplications();
    } catch (error: any) {
      setToastMessage(error.response?.data?.message || 'Erro ao rejeitar aplicação');
      setToastType('error');
      setShowToast(true);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels = {
      PENDING: 'Pendente',
      APPROVED: 'Aprovada',
      REJECTED: 'Rejeitada',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]
          }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Área Administrativa
            </h1>
            <p className="text-gray-600">
              Gerencie aplicações de candidatos ao grupo
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.assign('/admin/dashboard')}
            >
              Dashboard de performance
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.assign('/admin/members')}
            >
              Ver membros cadastrados
            </Button>
            <Button variant="danger" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <Button
            variant={filter === '' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleFilterClick('')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleFilterClick('PENDING')}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'APPROVED' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleFilterClick('APPROVED')}
          >
            Aprovadas
          </Button>
          <Button
            variant={filter === 'REJECTED' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleFilterClick('REJECTED')}
          >
            Rejeitadas
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando aplicações...</p>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhuma aplicação encontrada</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">{app.email}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Empresa:
                      </p>
                      <p className="text-sm text-gray-600">{app.company}</p>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Por que quer participar:
                      </p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {app.whyParticipate}
                      </p>
                    </div>

                    {app.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded">
                        <p className="text-sm font-medium text-red-900 mb-1">
                          Motivo da rejeição:
                        </p>
                        <p className="text-sm text-red-700">
                          {app.rejectionReason}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-3">
                      Enviado em:{' '}
                      {new Date(app.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  {app.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 md:min-w-[140px]">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApproveClick(app)}
                        disabled={actionLoading}
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectClick(app)}
                        disabled={actionLoading}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Voltar para home
          </a>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Aprovar Aplicação"
        showCancel={true}
        confirmText="Aprovar"
        confirmVariant="success"
        onConfirm={handleApproveConfirm}
      >
        <p className="text-gray-700">
          Deseja aprovar a aplicação de{' '}
          <strong className="text-gray-900">{selectedApp?.fullName}</strong>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Um link de convite será gerado e exibido após a aprovação.
        </p>
      </Modal>

      {/* Success Modal with Invite Link */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setInviteLink('');
        }}
        title="Aplicação Aprovada!"
        confirmText="Fechar"
        confirmVariant="success"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-semibold">Candidato aprovado com sucesso!</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Link de Convite:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm text-gray-900 font-mono"
              />
              <Button
                size="sm"
                onClick={() => copyToClipboard(inviteLink)}
              >
                Copiar
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-3"
              onClick={() => window.open(inviteLink, '_blank')}
            >
              Abrir Link
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            💡 Envie este link para o candidato completar o cadastro
          </p>
        </div>
      </Modal>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff' }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Rejeitar Aplicação
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Candidato: <strong className="text-gray-900">{selectedApp?.fullName}</strong>
            </p>
            <Textarea
              label="Motivo da rejeição (opcional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explique o motivo da rejeição..."
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectConfirm}
                isLoading={actionLoading}
                className="flex-1"
              >
                Confirmar Rejeição
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

