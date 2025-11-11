import { z } from 'zod';

// Application form validation
export const applicationSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  company: z
    .string()
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  whyParticipate: z
    .string()
    .min(50, 'Por favor, explique com mais detalhes (mínimo 50 caracteres)')
    .max(1000, 'Texto muito longo'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

// Member registration validation
export const memberSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  phone: z.string().optional().or(z.literal('')),
  position: z.string().optional().or(z.literal('')),
  companyDescription: z.string().max(500, 'Descrição muito longa').optional().or(z.literal('')),
  linkedinUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

export type MemberFormData = z.infer<typeof memberSchema>;

