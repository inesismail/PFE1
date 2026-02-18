'use client';

import { Bell, Search } from 'lucide-react';

export interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
}

export function Header({ title, description, action, searchValue, onSearch, searchPlaceholder }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50 hidden lg:block">
      <div className="flex h-20 items-center justify-between px-8 gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Custom action */}
          {action && (
            <div className="flex items-center gap-3">
              {action}
            </div>
          )}

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder || 'Rechercher...'}
              value={searchValue ?? ''}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-64 pl-10 pr-4 py-2.5 text-sm bg-muted/50 border border-border rounded-lg hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-accent/10 transition-colors" title="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-gradient-to-br from-destructive to-red-600 rounded-full animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
