'use client';

import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, Lock, Zap } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Link from 'next/link';
import { authApi } from '@/lib/auth/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Token invalide ou expiré');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-red-500/15 rounded-full flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">Lien invalide</h1>
            <p className="text-slate-400 text-sm">
              Ce lien de réinitialisation est invalide ou incomplet.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Zap className="w-7 h-7 text-slate-900" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">
            Flex<span className="text-amber-400">ee</span>
          </span>
        </div>
        <p className="text-slate-400 text-sm">Energy Flexibility Platform</p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-green-500/15 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Mot de passe réinitialisé</h1>
              <p className="text-slate-400 text-sm">
                Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full mt-4 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-semibold rounded-lg shadow-lg shadow-amber-500/30 transition-all"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Nouveau mot de passe</h1>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>

              {error && (
                <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      placeholder="Minimum 8 caractères"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all pr-12"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    placeholder="Répétez le mot de passe"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-semibold rounded-lg shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="relative z-10 mt-8 text-slate-600 text-xs">
        Flexee v1.0.0 © 2024
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
