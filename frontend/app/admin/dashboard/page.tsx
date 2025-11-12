'use client';

import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import type { PerformanceDashboard } from '@/types';

interface MetricDisplay {
  id: string;
  label: string;
  description: string;
  value: number;
  isMock: boolean;
}

export default function PerformanceDashboardPage() {
  const [metrics, setMetrics] = useState<PerformanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
    },
    [],
  );

  const loadMetrics = useCallback(
    async ({ showSuccess = false, isReload = false } = {}) => {
      try {
        if (isReload) {
          setReloading(true);
        } else {
          setLoading(true);
        }
        const data = await dashboardApi.getPerformance();
        setMetrics(data);
        if (showSuccess) {
          showToastMessage('Dashboard atualizado com sucesso!', 'success');
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard de performance:', error);
        showToastMessage('Não foi possível carregar os indicadores.', 'error');
      } finally {
        if (isReload) {
          setReloading(false);
        } else {
          setLoading(false);
        }
      }
    },
    [showToastMessage],
  );

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const handleReload = () => {
    loadMetrics({ showSuccess: true, isReload: true });
  };

  const metricCards: MetricDisplay[] = metrics
    ? [
        {
          id: 'activeMembers',
          label: 'Total de membros ativos',
          description: 'Contagem atual de membros cadastrados na plataforma.',
          value: metrics.activeMembers.value,
          isMock: metrics.activeMembers.isMock,
        },
        {
          id: 'indicationsThisMonth',
          label: 'Indicações no mês',
          description:
            'Quantidade de indicações criadas desde o primeiro dia do mês vigente.',
          value: metrics.indicationsThisMonth.value,
          isMock: metrics.indicationsThisMonth.isMock,
        },
        {
          id: 'thankYousThisMonth',
          label: '"Obrigados" no mês',
          description:
            'Número de reconhecimentos registrados no mês atual. O valor é mockado até que a funcionalidade seja implementada.',
          value: metrics.thankYousThisMonth.value,
          isMock: metrics.thankYousThisMonth.isMock,
        },
      ]
    : [];

  const lastUpdated =
    metrics?.generatedAt &&
    new Date(metrics.generatedAt).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard de Performance
            </h1>
            <p className="text-gray-600">
              Acompanhe os principais indicadores de desempenho dos membros.
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-2">
                Atualizado em {lastUpdated}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => window.location.assign('/admin')}>
              ← Voltar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReload}
              isLoading={reloading}
            >
              Recarregar indicadores
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <div className="text-center py-10 text-gray-600">
              Carregando indicadores de performance...
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricCards.map((metric) => (
              <Card key={metric.id}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {metric.label}
                    </h2>
                    {metric.isMock && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Dado mockado
                      </span>
                    )}
                  </div>
                  <p className="text-4xl font-bold text-blue-600">
                    {metric.value.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              </Card>
            ))}
          </div>
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


