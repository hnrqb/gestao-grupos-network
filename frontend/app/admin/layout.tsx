'use client';

import type { ReactNode } from 'react';
import { AdminAuthGate } from '@/components/admin/AdminAuthGate';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}


