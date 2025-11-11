'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, type ApplicationFormData } from '@/lib/validations';
import { applicationsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';

export default function ApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await applicationsApi.create(data);
      setSuccess(true);
      reset();
      
      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Erro ao enviar aplicação. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Aplicação Enviada com Sucesso!
              </h2>
              <p className="text-gray-600 mb-6">
                Recebemos sua aplicação e entraremos em contato em breve.
                Agradecemos seu interesse em participar do nosso grupo!
              </p>
              <Button onClick={() => setSuccess(false)}>
                Enviar Nova Aplicação
              </Button>
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
            Junte-se ao Nosso Grupo
          </h1>
          <p className="text-lg text-gray-600">
            Preencha o formulário abaixo para manifestar seu interesse em participar
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Nome Completo"
              {...register('fullName')}
              error={errors.fullName?.message}
              placeholder="João da Silva"
              required
            />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="joao@empresa.com"
              required
            />

            <Input
              label="Empresa"
              {...register('company')}
              error={errors.company?.message}
              placeholder="Minha Empresa Ltda"
              required
            />

            <Textarea
              label="Por que você quer participar?"
              {...register('whyParticipate')}
              error={errors.whyParticipate?.message}
              placeholder="Conte-nos sobre seu interesse em participar do grupo e como você pode contribuir... (mínimo 50 caracteres)"
              rows={6}
              required
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Enviar Aplicação
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Voltar para home
          </a>
        </div>
      </div>
    </div>
  );
}

