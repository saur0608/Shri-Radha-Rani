'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function RefundPolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-devanagari">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          {language === 'hi' ? 'वापसी एवं धनवापसी नीति (Return & Refund Policy)' : 'Return & Refund Policy'}
        </h1>
        <p className="text-zinc-500 mt-1">Last updated: October 2025</p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600">
          1. 7-Day Devotee Satisfaction Guarantee
        </h2>
        <p>
          We want your seva to be full of joy. If the size of the poshak or jewellery does not fit your Thakurji or Kishori Ji vigraha, or if the product arrives damaged, you may request an exchange or return within <strong>7 days</strong> of delivery.
        </p>

        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600 pt-2">
          2. Return Guidelines
        </h2>
        <p>
          Items must be unsoiled, with original devotional packaging. To initiate an exchange or return, please send a message to our WhatsApp devotee desk (+91 98765 43210) with your order number.
        </p>

        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600 pt-2">
          3. Refunds Processing
        </h2>
        <p>
          Once received and inspected, refunds for online payments are credited back to the original source within 3-5 working days. For COD orders, refund is transferred to your UPI ID or bank account.
        </p>
      </div>
    </div>
  );
}
