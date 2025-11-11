'use client';

import { useState, useEffect } from 'react';
import { applicationsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import type { Application } from '@/types';

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationsApi.getAll(filter || undefined);
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
      alert('Erro ao carregar aplicações');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Deseja aprovar esta aplicação?')) return;

    try {
      setActionLoading(true);
      const response = await applicationsApi.approve(id);
      alert(`Aplicação aprovada!\n\nLink de convite: ${response.inviteLink}`);
      await loadApplications();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao aprovar aplicação');
    } finally {
      setActionLoading(false);
    }
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
      setSelectedApp(null);
      await loadApplications();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao rejeitar aplicação');
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
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Área Administrativa
          </h1>
          <p className="text-gray-600">
            Gerencie aplicações de candidatos ao grupo
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filter === '' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('PENDING')}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'APPROVED' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('APPROVED')}
          >
            Aprovadas
          </Button>
          <Button
            variant={filter === 'REJECTED' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('REJECTED')}
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
                        onClick={() => handleApprove(app.id)}
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rejeitar Aplicação
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Candidato: <strong>{selectedApp?.fullName}</strong>
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
    </div>
  );
}

