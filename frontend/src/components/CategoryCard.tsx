'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    nameHi: string;
    slug: string;
    description?: string;
    descriptionHi?: string;
    imageUrl?: string;
    productCount?: number;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { language } = useLanguage();

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-goldglow transition-all duration-500 border border-gold-200/80 dark:border-zinc-800 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] bg-zinc-900"
    >
      {/* Background Image */}
      <img
        src={category.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-90"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

      {/* Content */}
      <div className="relative p-5 space-y-1 z-10">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/90 text-zinc-950 uppercase tracking-wider mb-1">
          {category.productCount ? `${category.productCount} ${language === 'hi' ? 'सामग्रियां' : 'items'}` : 'Vrindavan Seva'}
        </span>
        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-gold-300 transition-colors font-devanagari">
          {language === 'hi' && category.nameHi ? category.nameHi : category.name}
        </h3>
        <p className="text-xs text-zinc-300 line-clamp-1 font-light opacity-90">
          {language === 'hi' && category.descriptionHi ? category.descriptionHi : category.description}
        </p>
        <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-radha-300 group-hover:text-radha-200 group-hover:translate-x-1 transition-all">
          <span>{language === 'hi' ? 'दर्शन करें' : 'Explore Category'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
