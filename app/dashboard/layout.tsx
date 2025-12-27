import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
