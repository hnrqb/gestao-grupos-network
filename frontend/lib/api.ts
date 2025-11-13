import axios from 'axios';
import type {
  MemberAuthData,
  MemberRegistrationResponse,
  PerformanceDashboard,
} from '@/types';
import {
  clearAdminAuth,
  loadAdminAuth,
  notifyAdminAuthLogout,
} from './admin-auth';

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.headers) {
    const alreadyAuthorized =
      config.headers.Authorization || config.headers.authorization;

    if (!alreadyAuthorized) {
      const adminAuth = loadAdminAuth();
      if (adminAuth?.token) {
        config.headers.Authorization = `Bearer ${adminAuth.token}`;
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const adminAuth = loadAdminAuth();
      if (adminAuth) {
        clearAdminAuth();
        notifyAdminAuthLogout();
      }
    }

    (error as Record<string, unknown>).friendlyMessage =
      error.response?.data?.message || 'Erro ao processar requisição';
    return Promise.reject(error);
  },
);

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

export const invitationsApi = {
  validate: async (token: string) => {
    const response = await api.get(`/invitations/${token}`);
    return response.data;
  },
};

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

export const dashboardApi = {
  getPerformance: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data as PerformanceDashboard;
  },
};

export const adminAuthApi = {
  login: async (data: { key: string }) => {
    const response = await api.post('/admin/auth/login', data);
    return response.data as { token: string; expiresIn: number };
  },
};

export default api;

