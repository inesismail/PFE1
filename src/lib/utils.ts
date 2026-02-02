import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return formatDate(date);
}

export function getSignalStatusColor(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'gray';
  return value === 1 ? 'green' : 'red';
}

export function getSignalStatusText(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'Inconnu';
  return value === 1 ? 'Favorable' : 'Défavorable';
}

export function getConnectionStatusColor(isConnected: boolean): string {
  return isConnected ? 'green' : 'red';
}

export function getConnectionStatusText(isConnected: boolean): string {
  return isConnected ? 'Connecté' : 'Déconnecté';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
