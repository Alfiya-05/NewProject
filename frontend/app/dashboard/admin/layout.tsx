'use client';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <PageWrapper>{children}</PageWrapper>
    </AuthGuard>
  );
}
