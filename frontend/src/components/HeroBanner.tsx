'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Sparkles, Shield, Heart } from 'lucide-react';

export default function HeroBanner() {
  const { language, t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-radha-50/60 via-sandal-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border-b border-gold-200/50 dark:border-zinc-800">
      {/* Decorative Background Motifs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-radha-300/10 dark:bg-radha-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-400/15 dark:bg-gold-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 dark:bg-zinc-800 border border-gold-300 dark:border-gold-700/60 text-gold-900 dark:text-gold-300 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-4 h-4 text-gold-600 animate-spin" />
              <span>{language === 'hi' ? 'श्री वृन्दावन धाम निकुंज श्रृंगार' : 'Directly from Sacred Vrindavan Dham'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white leading-[1.15] font-devanagari tracking-tight">
              {t.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t.heroSubtitle}
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-radha-600 to-radha-700 hover:from-radha-700 hover:to-radha-800 text-white font-bold text-sm shadow-xl shadow-radha-600/30 hover:shadow-radha-600/40 transition-all transform active:scale-95"
              >
                <span>{t.shopNow}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#categories"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-gold-400 dark:border-gold-600/70 text-gold-800 dark:text-gold-300 font-bold text-sm hover:bg-gold-50 dark:hover:bg-zinc-800/80 transition-all"
              >
                <span>{t.viewCategories}</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-gold-200/70 dark:border-zinc-800 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="block text-lg font-black text-radha-700 dark:text-radha-400">100%</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {language === 'hi' ? 'शुद्ध वस्त्र व जरी' : 'Pure Silk & Zari'}
                </span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-lg font-black text-gold-600 dark:text-gold-400">10,000+</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {language === 'hi' ? 'आनंदित भक्त परिवार' : 'Devotees Blessed'}
                </span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-lg font-black text-teal-600 dark:text-teal-400">₹0</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {language === 'hi' ? '₹999 पर मुफ्त डिलीवरी' : 'Free Shipping > ₹999'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Golden Glow Border */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-radha-500 via-gold-500 to-teal-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border-2 border-gold-300 dark:border-zinc-700">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                  alt="Holy Radha Rani Poshak"
                  className="w-full h-80 sm:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
                />
                {/* Floating Divine Glass Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-gold-200 dark:border-zinc-700 shadow-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-devanagari">
                      {language === 'hi' ? 'शाही जरदोजी रेशम पोशाक' : 'Royal Zardozi Silk Poshak'}
                    </p>
                    <p className="text-[11px] text-gold-700 dark:text-gold-400 font-semibold">
                      {language === 'hi' ? 'राधाष्टमी एवं शरद पूर्णिमा विशेष' : 'Radhashtami Special Edition'}
                    </p>
                  </div>
                  <Link
                    href="/products/royal-vrindavan-zardozi-silk-radha-rani-poshak"
                    className="p-2 rounded-xl bg-radha-600 text-white hover:bg-radha-700 transition-colors shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
