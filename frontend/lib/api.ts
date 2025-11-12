import axios from 'axios';
import type {
  MemberAuthData,
  MemberRegistrationResponse,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding admin key when needed
api.interceptors.request.use((config) => {
  // Add admin key from env or localStorage if needed
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
  if (adminKey && config.headers) {
    config.headers['x-admin-key'] = adminKey;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || 'Erro ao processar requisição';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Applications API
export const applicationsApi = {
  create: async (data: {
    fullName: string;
    email: string;
    company: string;
    whyParticipate: string;
  }) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  getAll: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get('/applications', { params });
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.post(`/applications/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason?: string) => {
    const response = await api.post(`/applications/${id}/reject`, { reason });
    return response.data;
  },
};

// Invitations API
export const invitationsApi = {
  validate: async (token: string) => {
    const response = await api.get(`/invitations/${token}`);
    return response.data;
  },
};

// Members API
export const membersApi = {
  create: async (data: {
    token: string;
    phone?: string;
    position?: string;
    companyDescription?: string;
    linkedinUrl?: string;
  }) => {
    const response = await api.post('/members', data);
    return response.data as MemberRegistrationResponse;
  },

  getAll: async () => {
    const response = await api.get('/members');
    return response.data;
  },

  getDirectory: async () => {
    const response = await api.get('/members/directory');
    return response.data;
  },

  login: async (data: { email: string; secret: string }) => {
    const response = await api.post('/members/auth/login', data);
    return response.data as MemberAuthData;
  },
};

// Indications API
export const indicationsApi = {
  create: async (
    token: string,
    data: { targetMemberId: string; contactInfo: string; description: string },
  ) => {
    const response = await api.post('/indications', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAll: async (token: string) => {
    const response = await api.get('/indications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateStatus: async (
    token: string,
    indicationId: string,
    status: string,
  ) => {
    const response = await api.patch(
      `/indications/${indicationId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};

export default api;

