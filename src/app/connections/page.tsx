'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plug, Zap } from 'lucide-react';
import { Header } from '@/components/layout';

// Import the CPO and DSO page components
import CpoPageContent from './cpo-content';
import DsoPageContent from './dso-content';

export default function ConnectionsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'cpo' | 'dso'>('cpo');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'dso') setActiveTab('dso');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Connexions"
        description="Gérez vos connexions CPO et DSO depuis une seule interface"
      />

      <div className="p-6 space-y-6">
        {/* Tab Navigation - Same pattern as Actor popup */}
        <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('cpo')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'cpo'
                ? 'text-blue-600 dark:text-blue-400 border-b-blue-600 dark:border-b-blue-400'
                : 'text-gray-600 dark:text-gray-400 border-b-transparent hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Plug className="h-4 w-4" />
            CONNEXION CPO
          </button>
          <button
            onClick={() => setActiveTab('dso')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'dso'
                ? 'text-blue-600 dark:text-blue-400 border-b-blue-600 dark:border-b-blue-400'
                : 'text-gray-600 dark:text-gray-400 border-b-transparent hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Zap className="h-4 w-4" />
            CONNEXION DSO
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'cpo' && <CpoPageContent />}
          {activeTab === 'dso' && <DsoPageContent />}
        </div>
      </div>
    </div>
  );
}
