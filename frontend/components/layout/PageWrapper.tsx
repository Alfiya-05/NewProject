import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-mesh bg-fixed flex flex-col selection:bg-saffron/30 selection:text-navy">
      <Topbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto relative z-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
