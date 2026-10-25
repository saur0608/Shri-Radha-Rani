'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../lib/api';
import { formatINR } from '../../../lib/utils';
import ProductGallery from '../../../components/ProductGallery';
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { addItem } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care'>('desc');

  const slug = params?.slug as string;

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const res = await api.getProduct(slug);
        if (res.success && res.data) {
          setProduct(res.data);
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariant(res.data.variants[0]);
          }
        }
      } catch (e) {
        console.warn('Error loading product detail:', e);
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-radha-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-xs text-zinc-500">Loading divine details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold">{t.noProductsFound}</h2>
        <Link href="/products" className="px-6 py-2.5 rounded-full bg-radha-600 text-white font-bold text-xs inline-block">
          {t.shop}
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product.discountPrice ?? product.basePrice);
  const originalPrice = Number(product.basePrice);
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addItem(product.id, selectedVariant?.id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await addItem(product.id, selectedVariant?.id, quantity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-radha-600">{t.home}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-radha-600">{t.shop}</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-radha-600 font-devanagari">
              {language === 'hi' && product.category.nameHi ? product.category.nameHi : product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-[150px] sm:max-w-xs">
          {language === 'hi' && product.nameHi ? product.nameHi : product.name}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery Column */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images || []} productName={product.name} />
        </div>

        {/* Product Details & Actions Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gold-100 text-gold-900 uppercase tracking-widest inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-600" />
                <span>{language === 'hi' ? 'सिद्ध वृन्दावन विग्रह वस्त्र' : 'Sanctified Vrindavan Seva'}</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight font-devanagari">
              {language === 'hi' && product.nameHi ? product.nameHi : product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-gold-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {product.rating?.average || '5.0'}
              </span>
              <span className="text-xs text-zinc-400">
                ({product.rating?.count || 1} {language === 'hi' ? 'भक्त समीक्षाएं' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-4 rounded-2xl bg-radha-50/50 dark:bg-zinc-800/60 border border-radha-100 dark:border-zinc-700 flex items-baseline gap-3">
            <span className="text-3xl font-black text-radha-700 dark:text-radha-400">
              {formatINR(currentPrice)}
            </span>
            {originalPrice > currentPrice && (
              <>
                <span className="text-base text-zinc-400 line-through">
                  {formatINR(originalPrice)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-radha-600 text-white">
                  {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
                </span>
              </>
            )}
            <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-auto">
              {language === 'hi' ? 'सभी कर सहित (Inclusive of GST)' : 'Taxes included'}
            </span>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {t.selectSize}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant: any) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-radha-600 bg-radha-50 dark:bg-radha-950/40 text-radha-700 dark:text-radha-300 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-gold-300'
                      }`}
                    >
                      <span>{[variant.size, variant.color].filter(Boolean).join(' • ')}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">({formatINR(variant.price)})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Alert */}
          <div>
            {currentStock > 5 ? (
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.inStock}</span>
              </p>
            ) : currentStock > 0 ? (
              <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{language === 'hi' ? `केवल ${currentStock} शेष हैं! जल्दी करें` : `Only ${currentStock} left in stock!` }</span>
              </p>
            ) : (
              <p className="text-xs font-bold text-zinc-400">{t.outOfStock}</p>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                {t.quantity}:
              </label>
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || currentStock <= 0}
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-radha-600 text-radha-700 dark:text-radha-300 font-bold text-sm hover:bg-radha-50 dark:hover:bg-zinc-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.addToCart}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-radha-600 to-radha-700 hover:from-radha-700 hover:to-radha-800 text-white font-bold text-sm shadow-xl shadow-radha-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current text-gold-300" />
                <span>{t.buyNow}</span>
              </button>
            </div>
          </div>

          {/* Micro Trust Checklist */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gold-600" />
              <span>{language === 'hi' ? '3-5 दिनों में सुरक्षित डिलीवरी' : '3-5 Days Safe Delivery'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>{language === 'hi' ? 'कैश ऑन डिलीवरी उपलब्ध' : 'Cash on Delivery Available'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Seva Details, Dimensions, Care Instructions */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 text-sm font-bold font-devanagari">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'desc'
                ? 'border-radha-600 text-radha-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {language === 'hi' ? 'विवरण एवं महिमा' : 'Description'}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-radha-600 text-radha-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t.material} & {t.dimensions}
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'care'
                ? 'border-radha-600 text-radha-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t.careInstructions}
          </button>
        </div>

        <div className="py-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-devanagari">
          {activeTab === 'desc' && (
            <div className="space-y-4 max-w-3xl">
              <p>{language === 'hi' && product.descriptionHi ? product.descriptionHi : product.description}</p>
              {language === 'hi' && (
                <p className="text-xs text-gold-700 dark:text-gold-400 italic">
                  * श्री जी के विग्रह हेतु यह पोशाक पूर्ण पवित्रता से गंगाजल छिड़क कर वैष्णव कारीगरों द्वारा तैयार की गई है।
                </p>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <span className="font-bold block text-zinc-900 dark:text-zinc-100">{t.material}:</span>
                <span className="text-zinc-600 dark:text-zinc-400">{product.material || 'Pure Silk, Zari & Velvet'}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <span className="font-bold block text-zinc-900 dark:text-zinc-100">{t.dimensions}:</span>
                <span className="text-zinc-600 dark:text-zinc-400">{product.dimensions || 'Available for multiple idol sizes'}</span>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3 max-w-2xl text-xs">
              <p>{language === 'hi' && product.careInstructionsHi ? product.careInstructionsHi : product.careInstructions || 'Dry clean only. Store wrapped in pure cotton cloth.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Devotee Reviews Section */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-devanagari mb-6">
          {t.customerReviews}
        </h3>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((rev: any) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{rev.user?.name || 'Devotee'}</span>
                  <div className="flex items-center text-gold-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                {rev.title && <h5 className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{rev.title}</h5>}
                <p className="text-xs text-zinc-600 dark:text-zinc-300 font-devanagari">{rev.comment}</p>
                {rev.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t.verifiedPurchase}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">No reviews yet. Be the first devotee to review!</p>
        )}
      </div>
    </div>
  );
}
