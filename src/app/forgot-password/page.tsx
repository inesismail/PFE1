'use client';

import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail, Zap } from 'lucide-react';
import { useState } from 'react';

import Link from 'next/link';
import { authApi } from '@/lib/auth/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword(email);
      setSuccess(true);
      // DEV: show reset link if returned
      if (response.resetLink) {
        setResetLink(response.resetLink);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            /* Success state */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-green-500/15 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Lien envoyé</h1>
              <p className="text-slate-400 text-sm">
                Si un compte existe avec l&apos;email <strong className="text-slate-300">{email}</strong>, un lien de réinitialisation a été généré.
              </p>

              {/* DEV: Show reset link */}
              {resetLink && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-left">
                  <p className="text-amber-400 text-xs font-semibold mb-2 uppercase tracking-wider">Dev — Lien de reset :</p>
                  <Link
                    href={resetLink.replace(/^https?:\/\/[^/]+/, '')}
                    className="text-amber-300 text-sm break-all hover:underline"
                  >
                    {resetLink}
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Mot de passe oublié</h1>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </p>

              {error && (
                <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="vous@exemple.com"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                    autoFocus
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
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien'
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
