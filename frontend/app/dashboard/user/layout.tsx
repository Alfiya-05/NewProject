'use client';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['citizen']}>
      <PageWrapper>{children}</PageWrapper>
    </AuthGuard>
  );
}
