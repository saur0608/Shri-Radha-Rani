'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-devanagari">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          {language === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
        </h1>
        <p className="text-zinc-500 mt-1">Last updated: October 2025</p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600">
          1. Respect for Devotee Privacy
        </h2>
        <p>
          At Shri Radha Rani Shringar, we value the trust of our devotees. We only collect essential information required to deliver your sacred items safely: your name, contact phone number, delivery address, and email.
        </p>

        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600 pt-2">
          2. Payment Security
        </h2>
        <p>
          We do not store your bank account, credit/debit card, or UPI credentials on our servers. All online transactions are encrypted and processed through RBI-authorized gateway Razorpay.
        </p>

        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600 pt-2">
          3. Data Usage
        </h2>
        <p>
          Your information is never sold or shared with any advertising third parties. It is strictly used for order fulfillment, shipment tracking, and customer service.
        </p>
      </div>
    </div>
  );
}
