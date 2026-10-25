'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-devanagari">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          {language === 'hi' ? 'नियम एवं सेवा शर्तें (Terms of Service)' : 'Terms of Service'}
        </h1>
        <p className="text-zinc-500 mt-1">Last updated: October 2025</p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600">
          1. General Terms
        </h2>
        <p>
          By accessing and placing an order with Shri Radha Rani Shringar, you agree to these devotional terms of service. All prices are listed in Indian Rupees (INR) and are inclusive of relevant taxes.
        </p>

        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600 pt-2">
          2. Handcrafted Variations
        </h2>
        <p>
          Since our poshaks, mukut, and brass offerings are handcrafted by traditional artisans, minor variations in border motifs or stone placements may naturally occur, adding to their unique charm and spiritual beauty.
        </p>

        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600 pt-2">
          3. Jurisdiction
        </h2>
        <p>
          Any disputes arising from purchases are subject to the exclusive jurisdiction of the competent courts in Mathura, Uttar Pradesh.
        </p>
      </div>
    </div>
  );
}
