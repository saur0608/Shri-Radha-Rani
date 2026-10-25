'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import { formatINR } from '../lib/utils';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await api.getSearchSuggestions(query);
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (e) {
        console.warn('Search error', e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gold-200 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center p-4 border-b border-zinc-100 dark:border-zinc-800">
          <Search className="w-5 h-5 text-radha-600 dark:text-radha-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-base md:text-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-zinc-400 animate-spin mr-2" />
          ) : query ? (
            <button type="button" onClick={() => setQuery('')} className="p-1 text-zinc-400 hover:text-zinc-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-zinc-500 hover:text-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
          >
            ESC
          </button>
        </form>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                {language === 'hi' ? 'सुझावित विग्रह वस्त्र एवं श्रृंगार' : 'Suggested Offerings'}
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-radha-50/60 dark:hover:bg-zinc-800/80 transition-colors group"
                >
                  <img
                    src={product.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80'}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gold-200 dark:border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-radha-600 transition-colors truncate">
                      {language === 'hi' && product.nameHi ? product.nameHi : product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-radha-700 dark:text-radha-400">
                        {formatINR(product.discountPrice ?? product.basePrice)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-zinc-400 line-through">
                          {formatINR(product.basePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-radha-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          ) : query && !isLoading ? (
            <div className="py-8 text-center text-zinc-500">
              <p>{t.noProductsFound}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                {language === 'hi' ? 'भक्तों की पसंदीदा खोज' : 'Popular Devotional Searches'}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { en: 'Radha Rani Poshak', hi: 'श्री राधा रानी पोशाक' },
                  { en: 'Laddu Gopal Dress', hi: 'लड्डू गोपाल वस्त्र' },
                  { en: 'Kundan Mukut', hi: 'कुंदन मुकुट' },
                  { en: 'Brass Bansuri', hi: 'पीतल की बांसुरी' },
                  { en: 'Brass Jhoola', hi: 'पीतल का झूला' },
                  { en: 'Aarti Thali', hi: 'आरती थाली सेट' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(item.en);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-gold-50 dark:bg-zinc-800 text-gold-900 dark:text-gold-300 rounded-full border border-gold-200 dark:border-zinc-700 hover:border-radha-400 transition-colors"
                  >
                    {language === 'hi' ? item.hi : item.en}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
