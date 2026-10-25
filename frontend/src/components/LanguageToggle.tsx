'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-gold-300 dark:border-gold-700 bg-gold-50/80 dark:bg-zinc-800 text-gold-800 dark:text-gold-300 hover:bg-gold-100 dark:hover:bg-zinc-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-radha-500"
      title="Switch Language / भाषा बदलें"
      aria-label="Toggle language"
    >
      <Languages className="w-3.5 h-3.5" />
      <span>{language === 'hi' ? 'EN (English)' : 'हिन्दी (Hindi)'}</span>
    </button>
  );
}
