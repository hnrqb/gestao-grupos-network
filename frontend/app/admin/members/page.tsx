'use client';

import { useEffect, useMemo, useState } from 'react';
import { membersApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import type { Member } from '@/types';

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await membersApi.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      setToastMessage('Não foi possível carregar os membros cadastrados.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await membersApi.getAll();
      setMembers(data);
      setToastMessage('Lista de membros atualizada com sucesso.');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Erro ao atualizar lista de membros:', error);
      setToastMessage('Não foi possível atualizar a lista de membros.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) {
      return members;
    }

    const term = searchTerm.trim().toLowerCase();
    return members.filter((member) => {
      return (
        member.fullName.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.company.toLowerCase().includes(term) ||
        (member.position && member.position.toLowerCase().includes(term))
      );
    });
  }, [members, searchTerm]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setToastMessage('E-mail copiado para a área de transferência.');
    setToastType('success');
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Membros Cadastrados
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize as informações dos membros aprovados no grupo.
            </p>
            {!loading && (
              <p className="text-sm text-gray-500 mt-2">
                Total de membros: <span className="font-semibold text-gray-900">{members.length}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.assign('/admin')}
            >
              ← Voltar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              disabled={loading || isRefreshing}
            >
              Recarregar lista
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Filtrar por nome, e-mail, empresa ou cargo"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {loading ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando membros...</p>
            </div>
          </Card>
        ) : filteredMembers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600">
                Nenhum membro encontrado para o filtro aplicado.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {member.fullName}
                        </h2>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyEmail(member.email)}
                      >
                        Copiar e-mail
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Empresa
                        </p>
                        <p className="text-sm text-gray-600">{member.company}</p>
                      </div>
                      {member.position && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Cargo / Função
                          </p>
                          <p className="text-sm text-gray-600">{member.position}</p>
                        </div>
                      )}
                      {member.phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Telefone
                          </p>
                          <p className="text-sm text-gray-600">{member.phone}</p>
                        </div>
                      )}
                      {member.linkedinUrl && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            LinkedIn
                          </p>
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            {member.linkedinUrl}
                          </a>
                        </div>
                      )}
                    </div>

                    {member.companyDescription && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">
                          Sobre a empresa
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {member.companyDescription}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-4">
                      Membro desde:{' '}
                      {new Date(member.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Voltar para área administrativa
          </a>
        </div>
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


