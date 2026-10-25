'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import HeroBanner from '../components/HeroBanner';
import DevotionalTrustBadge from '../components/DevotionalTrustBadge';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

export default function HomePage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        const [catRes, colRes] = await Promise.all([
          api.getCategories(),
          api.getCollections(),
        ]);

        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (colRes.success && colRes.data) {
          setBestsellers(colRes.data.bestsellers || []);
          setNewArrivals(colRes.data.newArrivals || []);
        }
      } catch (err) {
        console.warn('Failed to load home data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 md:space-y-20 pb-16">
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Devotional Trust Badges */}
      <DevotionalTrustBadge />

      {/* 3. Sacred Categories Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-radha-600 dark:text-radha-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'श्री वृन्दावन निकुंज' : 'Vrindavan Sacred Collections'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1 font-devanagari">
              {t.featuredCategoriesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t.featuredCategoriesSubtitle}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-radha-600 hover:text-radha-700 transition-colors"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 4. Bestsellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-gold-100 text-gold-900 uppercase tracking-widest inline-block mb-2">
              ⭐ {language === 'hi' ? 'भक्तों की सर्वाधिक पसंद' : 'Devotees Most Loved'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-devanagari">
              {t.bestsellersTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t.bestsellersSubtitle}
            </p>
          </div>
          <Link
            href="/products?sort=bestseller"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-radha-600 hover:text-radha-700 transition-colors"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bestseller Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Divine Mid-Page Vrindavan Blessing Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-radha-800 via-radha-700 to-gold-700 text-white p-8 md:p-14 shadow-2xl border-2 border-gold-300">
          <div className="relative z-10 max-w-2xl space-y-4 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-200">
              🌸 {language === 'hi' ? 'राधे राधे महामंत्र' : 'Holy Vrindavan Blessing'}
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-snug font-devanagari">
              {language === 'hi'
                ? 'राधा साध्यं साधनं यस्य राधा, मन्त्रो राधा मन्त्रदात्री च राधा।'
                : 'Adorn Thakurji with Pure Love & Vrindavan Sanctity'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              {language === 'hi'
                ? 'हमारे सभी वस्त्र श्री वृन्दावन के कुशल वैष्णव कारीगरों द्वारा पूर्ण पवित्रता एवं भक्ति भाव से सिले जाते हैं।'
                : 'Every dress, mukut and flute is hand-inspected with pure devotion before reaching your home altar.'}
            </p>
            <div className="pt-2">
              <Link
                href="/products?category=radha-rani-poshak"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-radha-800 font-bold text-xs sm:text-sm hover:bg-gold-50 shadow-lg transition-all"
              >
                <span>{language === 'hi' ? 'श्री राधा रानी पोशाक देखें' : 'View Radha Rani Poshak'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 uppercase tracking-widest inline-block mb-2">
              ✨ {language === 'hi' ? 'नया संग्रह' : 'New Additions'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-devanagari">
              {t.newArrivalsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t.newArrivalsSubtitle}
            </p>
          </div>
          <Link
            href="/products?sort=newest"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-radha-600 hover:text-radha-700 transition-colors"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* New Arrivals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
