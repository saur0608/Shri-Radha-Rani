'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR } from '../../lib/utils';
import { api } from '../../lib/api';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, CheckCircle2 } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartPage() {
  const { items, totalItems, subtotal, updateQuantity, removeItem } = useCart();
  const { language, t } = useLanguage();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 70;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setLoading(true);
      setCouponError('');
      const res = await api.validateCoupon(couponCode, subtotal);
      if (res.success && res.data) {
        setAppliedCoupon({
          code: res.data.code,
          discountAmount: res.data.discountAmount,
        });
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-gold-50 dark:bg-zinc-800 text-gold-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          🌸
        </div>
        <h1 className="text-2xl font-bold font-devanagari">{t.cartEmpty}</h1>
        <p className="text-xs text-zinc-500">
          {language === 'hi' ? 'अपनी पूजा व सेवा हेतु दिव्य विग्रह वस्त्र एवं श्रृंगार जोड़ें।' : 'Add sacred poshak and shringar for Thakurji seva.'}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-radha-600 text-white font-bold text-xs shadow-lg hover:bg-radha-700 transition-all"
        >
          <span>{t.startShopping}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-devanagari">
        {t.shoppingCart} ({totalItems})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert */}
          <div className="p-4 rounded-2xl bg-gold-50 dark:bg-zinc-800 border border-gold-200 dark:border-zinc-700 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-gold-900 dark:text-gold-300 font-semibold">
                {language === 'hi'
                  ? `पूरे भारत में निःशुल्क शिपिंग हेतु ${formatINR(remainingForFreeShipping)} का सामान और जोड़ें!`
                  : `Add ${formatINR(remainingForFreeShipping)} more to qualify for FREE shipping across India!`}
              </p>
            ) : (
              <p className="text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.freeShippingQualified}</span>
              </p>
            )}
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80'}
                alt={item.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-gold-200 dark:border-zinc-700 shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white font-devanagari">
                      {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-red-500 p-1"
                      title={t.remove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {(item.variantSize || item.variantColor) && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {[item.variantSize, item.variantColor].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-black text-radha-700 dark:text-radha-400">
                    {formatINR(item.unitPrice)}
                  </span>
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gold-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-zinc-900 dark:text-white font-devanagari">
              {language === 'hi' ? 'ऑर्डर सारांश' : 'Order Summary'}
            </h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="VRINDAVAN10"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gold-600 text-white hover:bg-gold-700 transition-colors"
              >
                {loading ? '...' : t.applyCoupon}
              </button>
            </form>

            {appliedCoupon && (
              <p className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Coupon {appliedCoupon.code} applied: -{formatINR(appliedCoupon.discountAmount)}</span>
              </p>
            )}
            {couponError && <p className="text-xs text-red-500">{couponError}</p>}

            <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatINR(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-teal-600 font-semibold">
                  <span>{t.discount}</span>
                  <span>-{formatINR(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>{t.shipping}</span>
                <span className="font-semibold text-teal-600">
                  {shippingFee === 0 ? t.freeShipping : '₹70'}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>{t.total}</span>
                <span className="text-xl font-black text-radha-700 dark:text-radha-400">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-radha-600 to-radha-700 hover:from-radha-700 hover:to-radha-800 text-white font-bold text-sm shadow-xl shadow-radha-600/30 transition-all active:scale-95"
            >
              <span>{t.proceedToCheckout}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
