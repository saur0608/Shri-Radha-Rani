'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Truck, Banknote, Sparkles } from 'lucide-react';

export default function DevotionalTrustBadge() {
  const { t } = useLanguage();

  const badges = [
    {
      icon: Sparkles,
      title: t.trustVrindavanTitle,
      desc: t.trustVrindavanDesc,
      color: 'text-radha-600 bg-radha-50 dark:bg-radha-950/40 border-radha-200 dark:border-radha-900',
    },
    {
      icon: Truck,
      title: t.trustShippingTitle,
      desc: t.trustShippingDesc,
      color: 'text-gold-600 bg-gold-50 dark:bg-gold-950/40 border-gold-200 dark:border-gold-900',
    },
    {
      icon: Banknote,
      title: t.trustCodTitle,
      desc: t.trustCodDesc,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900',
    },
    {
      icon: ShieldCheck,
      title: t.trustServiceTitle,
      desc: t.trustServiceDesc,
      color: 'text-radha-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    },
  ];

  return (
    <div className="py-10 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-gold-300 dark:hover:border-zinc-700 transition-all hover:shadow-sm"
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${badge.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-devanagari">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
