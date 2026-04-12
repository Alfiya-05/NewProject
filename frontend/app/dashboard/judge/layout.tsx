'use client';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['judge']}>
      <PageWrapper>{children}</PageWrapper>
    </AuthGuard>
  );
}
