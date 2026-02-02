'use client';

import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Plus,
  UserPlus,
  X,
} from 'lucide-react';
import { Role, useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/users';

export default function NewUserPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>(Role.VIEWER);
  const [password, setPassword] = useState('');
  const [generatePassword, setGeneratePassword] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName || !lastName) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await usersApi.create({
        email,
        firstName,
        lastName,
        role,
        password: generatePassword ? undefined : password,
        isActive,
        isEmailVerified,
      });
      
      setCreatedUserId(response.user.id);
      if (response.temporaryPassword) {
        setTempPassword(response.temporaryPassword);
      } else {
        // If no temp password, redirect to user list
        router.push('/users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isAdmin) return null;

  // Show success screen with temporary password
  if (tempPassword && createdUserId) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Utilisateur créé</h2>
          <p className="text-muted-foreground mb-6">
            L&apos;utilisateur a été créé avec succès. Voici le mot de passe temporaire:
          </p>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm mb-4">
            <span className="flex-1 break-all">{tempPassword}</span>
            <button
              onClick={() => copyToClipboard(tempPassword)}
              className="p-2 hover:bg-accent rounded"
              title="Copier"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-amber-500 flex items-center justify-center gap-2 mb-6">
            <AlertCircle className="h-4 w-4" />
            Ce mot de passe ne sera plus affiché
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/users')}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent"
            >
              Retour à la liste
            </button>
            <button
              onClick={() => router.push(`/users/${createdUserId}`)}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Voir l&apos;utilisateur
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/users')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-7 w-7" />
            Nouvel Utilisateur
          </h1>
          <p className="text-muted-foreground">Créer un nouveau compte utilisateur</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="utilisateur@exemple.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Prénom <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Jean"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Dupont"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={Role.VIEWER}>Viewer - Lecture seule</option>
              <option value={Role.OPERATOR}>Opérateur - Accès opérationnel</option>
              <option value={Role.ADMIN}>Admin - Accès complet</option>
            </select>
          </div>
          
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Compte actif</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmailVerified}
                onChange={(e) => setIsEmailVerified(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Email vérifié</span>
            </label>
          </div>
        </div>

        <div className="border-t my-6" />

        <div className="space-y-4">
          <h3 className="font-medium">Mot de passe</h3>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={generatePassword}
              onChange={() => setGeneratePassword(true)}
              className="w-4 h-4"
            />
            <span className="text-sm">Générer un mot de passe temporaire</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!generatePassword}
              onChange={() => setGeneratePassword(false)}
              className="w-4 h-4"
            />
            <span className="text-sm">Définir un mot de passe</span>
          </label>
          
          {!generatePassword && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Mot de passe <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!generatePassword}
                minLength={8}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Minimum 8 caractères"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.push('/users')}
            className="px-4 py-2 border rounded-lg hover:bg-accent"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Créer l&apos;utilisateur
          </button>
        </div>
      </form>
    </div>
  );
}
