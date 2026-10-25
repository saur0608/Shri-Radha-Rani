'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function ShippingPolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-devanagari">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          {language === 'hi' ? 'शिपिंग एवं डिलीवरी नीति (Shipping Policy)' : 'Shipping & Delivery Policy'}
        </h1>
        <p className="text-zinc-500 mt-1">Last updated: October 2025</p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600">
          1. Free Delivery Policy
        </h2>
        <p>
          We offer <strong>Free Express Delivery across India</strong> on all orders of ₹999 or above. For devotional orders below ₹999, a nominal standard shipping fee of ₹70 is applied to cover safe protective packaging.
        </p>

        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600 pt-2">
          2. Delivery Timelines
        </h2>
        <p>
          All sacred items are dispatched directly from our holy Vrindavan Dham workshop within 24-48 business hours. Deliveries typically reach metros and major Indian cities within <strong>3 to 5 business days</strong> via trusted express courier partners (Delhivery, BlueDart, DTDC).
        </p>

        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-radha-600 pt-2">
          3. Sacred Protective Packaging
        </h2>
        <p>
          Every poshak and brass item is thoroughly inspected and packed with multi-layered protective cushioning and sacred Tulsi leaves to preserve its purity and avoid damage in transit.
        </p>
      </div>
    </div>
  );
}
