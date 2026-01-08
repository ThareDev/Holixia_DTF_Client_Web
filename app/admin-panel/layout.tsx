'use client';

import { ReactNode } from 'react';
import AdminSidebar from '@/app/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#a60054] rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#211f60] rounded-full blur-3xl opacity-20 animate-pulse" />
      
      <div className="relative z-10 flex h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}