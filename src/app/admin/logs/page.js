"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Terminal } from 'lucide-react';

export default function AdminLogsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">System Logs</h1>
              <p className="text-muted-foreground">
                Log aktivitas sistem (Admin Only)
              </p>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2 border border-border">
            <div className="flex items-start gap-4">
              <span className="text-muted-foreground whitespace-nowrap">2026-05-14 10:00:01</span>
              <span className="text-primary">[INFO]</span>
              <span>Admin {user?.email} accessed logs panel.</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-muted-foreground whitespace-nowrap">2026-05-14 09:45:22</span>
              <span className="text-primary">[INFO]</span>
              <span>Database backup completed successfully.</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-muted-foreground whitespace-nowrap">2026-05-14 08:30:15</span>
              <span className="text-yellow-500">[WARN]</span>
              <span>High CPU usage detected on web server. Auto-scaling triggered.</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-muted-foreground whitespace-nowrap">2026-05-14 07:12:05</span>
              <span className="text-primary">[INFO]</span>
              <span>New user registered: user@example.com</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
