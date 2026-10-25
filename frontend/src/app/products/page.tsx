'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import { SlidersHorizontal, X, ChevronDown, Loader2, Sparkles } from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const activeSize = searchParams.get('size') || '';
  const activePage = parseInt(searchParams.get('page') || '1', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (e) {
        console.warn('Error loading categories', e);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const res = await api.getProducts({
          category: activeCategory || undefined,
          search: activeSearch || undefined,
          sort: activeSort as any,
          size: activeSize || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          page: activePage,
          limit: 12,
        });

        if (res.success && res.data) {
          setProducts(res.data);
          setMeta(res.meta);
        }
      } catch (e) {
        console.warn('Error loading products', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [activeCategory, activeSearch, activeSort, activeSize, activePage, minPrice, maxPrice]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters = Boolean(
    activeCategory || activeSearch || activeSize || minPrice || maxPrice || activeSort !== 'newest'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gold-600 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पवित्र संग्रह' : 'Holy Catalog'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-devanagari mt-1">
            {activeSearch
              ? `${language === 'hi' ? 'खोज परिणाम:' : 'Search results for:'} "${activeSearch}"`
              : activeCategory
              ? categories.find((c) => c.slug === activeCategory)?.[language === 'hi' ? 'nameHi' : 'name'] || t.shop
              : t.shop}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {meta.total} {t.itemsCount}
          </p>
        </div>

        {/* Top Controls: Mobile Filter Button & Desktop Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-radha-600" />
            <span>{t.filters}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="appearance-none bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-radha-500 cursor-pointer shadow-sm"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="bestseller">{t.sortBestseller}</option>
              <option value="price_asc">{t.sortPriceLowHigh}</option>
              <option value="price_desc">{t.sortPriceHighLow}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => updateFilters('category', '')}
          className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
            !activeCategory
              ? 'bg-radha-600 text-white shadow-md shadow-radha-600/30'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {t.allCategories}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => updateFilters('category', c.slug)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all font-devanagari ${
              activeCategory === c.slug
                ? 'bg-radha-600 text-white shadow-md shadow-radha-600/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {language === 'hi' && c.nameHi ? c.nameHi : c.name}
          </button>
        ))}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-zinc-400 font-medium">{t.filters}:</span>
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-radha-50 dark:bg-zinc-800 text-radha-700 dark:text-radha-300 font-semibold border border-radha-200">
              {categories.find((c) => c.slug === activeCategory)?.[language === 'hi' ? 'nameHi' : 'name'] || activeCategory}
              <button onClick={() => updateFilters('category', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {activeSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-50 dark:bg-zinc-800 text-gold-700 dark:text-gold-300 font-semibold border border-gold-200">
              "{activeSearch}"
              <button onClick={() => updateFilters('search', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:underline font-semibold ml-2"
          >
            {t.clearAll}
          </button>
        </div>
      )}

      {/* Main Grid Area */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-radha-600 animate-spin" />
          <p className="text-xs text-zinc-500">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading sacred offerings...'}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gold-50 dark:bg-zinc-800 text-gold-600 flex items-center justify-center mx-auto text-2xl">
            🌸
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{t.noProductsFound}</h3>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2 rounded-full bg-radha-600 text-white text-xs font-bold hover:bg-radha-700 transition-all shadow-md"
          >
            {t.clearAll}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="pt-8 flex items-center justify-center gap-2">
          {[...Array(meta.totalPages)].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => updateFilters('page', String(pageNum))}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  activePage === pageNum
                    ? 'bg-radha-600 text-white shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
