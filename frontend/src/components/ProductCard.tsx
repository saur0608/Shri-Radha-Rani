'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/utils';
import { ShoppingBag, Star, Sparkles, Check } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    nameHi?: string;
    slug: string;
    basePrice: number | string;
    discountPrice?: number | string | null;
    stock: number;
    isFeatured?: boolean;
    isBestseller?: boolean;
    isNewArrival?: boolean;
    images?: Array<{ url: string; altText?: string; isPrimary?: boolean }>;
    variants?: Array<{ id: string; size?: string; color?: string; price: number | string }>;
    _count?: { reviews: number };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const price = Number(product.discountPrice ?? product.basePrice);
  const originalPrice = Number(product.basePrice);
  const discountPercent =
    product.discountPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsAdding(true);
      const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0].id : null;
      await addItem(product.id, defaultVariant, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative rounded-3xl bg-white dark:bg-zinc-900 border border-gold-200/70 dark:border-zinc-800 hover:border-gold-400 dark:hover:border-zinc-700 shadow-sm hover:shadow-divine transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Area */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.isBestseller && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-gold-500 to-gold-600 text-zinc-950 shadow-sm uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{language === 'hi' ? 'बेस्टसेलर' : 'Bestseller'}</span>
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shadow-sm uppercase tracking-wider">
              {language === 'hi' ? 'नवीनतम' : 'New'}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-radha-600 text-white shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick Stock Indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-red-600/90 backdrop-blur-sm rounded-lg text-center text-[10px] font-bold text-white shadow">
            {language === 'hi' ? `केवल ${product.stock} शेष!` : `Only ${product.stock} left in stock!`}
          </div>
        )}
      </Link>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1 text-gold-500 mb-1.5 text-xs">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">
              ({product._count?.reviews ?? 1})
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-radha-600 transition-colors line-clamp-2 font-devanagari leading-snug">
              {language === 'hi' && product.nameHi ? product.nameHi : product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black text-radha-700 dark:text-radha-400">
              {formatINR(price)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-zinc-400 line-through -mt-0.5">
                {formatINR(originalPrice)}
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || product.stock <= 0}
            className={`p-2.5 rounded-full transition-all duration-200 shadow-sm flex items-center justify-center shrink-0 ${
              justAdded
                ? 'bg-teal-600 text-white'
                : 'bg-radha-50 dark:bg-zinc-800 text-radha-700 dark:text-radha-300 hover:bg-radha-600 hover:text-white dark:hover:bg-radha-600'
            }`}
            title={t.addToCart}
            aria-label="Add item to cart"
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
