'use client';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['lawyer']}>
      <PageWrapper>{children}</PageWrapper>
    </AuthGuard>
  );
}
