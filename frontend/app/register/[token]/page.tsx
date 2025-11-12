'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSchema, type MemberFormData } from '@/lib/validations';
import { invitationsApi, membersApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import type {
  InvitationValidation,
  MemberRegistrationResponse,
} from '@/types';

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [validating, setValidating] = useState(true);
  const [invitation, setInvitation] = useState<InvitationValidation | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authData, setAuthData] = useState<MemberRegistrationResponse | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setValidating(true);
      const data = await invitationsApi.validate(token);
      setInvitation(data);
      setValue('token', token);
    } catch (error: any) {
      setValidationError(
        error.response?.data?.message ||
          'Token inválido ou expirado'
      );
    } finally {
      setValidating(false);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);

    try {
      // Remove empty optional fields
      const cleanData = {
        token: data.token,
        ...(data.phone && { phone: data.phone }),
        ...(data.position && { position: data.position }),
        ...(data.companyDescription && { companyDescription: data.companyDescription }),
        ...(data.linkedinUrl && { linkedinUrl: data.linkedinUrl }),
      };

      const response = await membersApi.create(cleanData);
      setAuthData(response);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'memberAuth',
          JSON.stringify({
            member: response.member,
            token: response.token,
          }),
        );
      }
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          'Erro ao completar cadastro. Tente novamente.'
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validando convite...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Link Inválido
              </h2>
              <p className="text-gray-600 mb-6">{validationError}</p>
              <Button onClick={() => router.push('/')}>
                Voltar para Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cadastro Concluído!
              </h2>
              <p className="text-gray-600 mb-6">
                Bem-vindo ao grupo! Seu cadastro foi realizado com sucesso.
                Em breve você receberá mais informações sobre as próximas etapas.
              </p>

              {authData && (
                <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Dados de acesso ao painel de membros
                  </h3>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Seu código secreto:</strong>
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <code className="flex-1 bg-white border border-blue-200 rounded px-3 py-2 text-blue-900 text-sm break-all">
                      {authData.authSecret}
                    </code>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(authData.authSecret)
                      }
                    >
                      Copiar código
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700">
                    Guarde este código em local seguro. Você vai precisar dele,
                    junto com seu e-mail, para acessar o sistema de indicações.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3">
                <Button onClick={() => router.push('/')}>
                  Ir para Home
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/members/indications')}
                >
                  Acessar sistema de indicações
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete seu Cadastro
          </h1>
          <p className="text-lg text-gray-600">
            Olá, <strong>{invitation?.application.fullName}</strong>!
            Precisamos de mais algumas informações.
          </p>
        </div>

        <Card>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {invitation?.application.email}
              <br />
              <strong>Empresa:</strong> {invitation?.application.company}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('token')} />

            <Input
              label="Telefone"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="(11) 98765-4321"
            />

            <Input
              label="Cargo/Posição"
              {...register('position')}
              error={errors.position?.message}
              placeholder="Diretor de Vendas"
            />

            <Textarea
              label="Descrição da Empresa"
              {...register('companyDescription')}
              error={errors.companyDescription?.message}
              placeholder="Conte-nos mais sobre sua empresa, produtos e serviços..."
              rows={4}
            />

            <Input
              label="LinkedIn URL"
              type="url"
              {...register('linkedinUrl')}
              error={errors.linkedinUrl?.message}
              placeholder="https://linkedin.com/in/seu-perfil"
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Completar Cadastro
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Erro ao Cadastrar"
        confirmText="OK"
        confirmVariant="danger"
      >
        <p className="text-gray-700">{errorMessage}</p>
      </Modal>
    </div>
  );
}

