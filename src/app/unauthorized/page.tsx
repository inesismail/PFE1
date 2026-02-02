'use client';

import { ArrowLeft, LogOut, ShieldX } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      
      <div className="relative z-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-8">
          You don&apos;t have permission to access this page.
          {user && (
            <span className="block mt-2 text-sm">
              Your current role is: <span className="text-amber-400 font-medium">{user.role}</span>
            </span>
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-slate-500 text-sm">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
