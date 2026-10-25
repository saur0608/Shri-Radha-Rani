'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR } from '../lib/utils';
import { api } from '../lib/api';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, Tag, CheckCircle2 } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartDrawer() {
  const { items, totalItems, subtotal, isCartOpen, closeCart, updateQuantity, removeItem } = useCart();
  const { language, t } = useLanguage();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
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
      setCouponLoading(false);
    }
  };

  const finalTotal = appliedCoupon ? Math.max(0, subtotal - appliedCoupon.discountAmount) : subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-gold-200 dark:border-zinc-800">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gold-50/50 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-radha-600 dark:text-radha-400" />
              <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                {t.shoppingCart} ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Milestone Meter */}
          <div className="p-4 bg-radha-50/60 dark:bg-zinc-800/60 border-b border-radha-100 dark:border-zinc-700/60">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                {language === 'hi'
                  ? `पूरे भारत में निःशुल्क शिपिंग हेतु ${formatINR(remainingForFreeShipping)} का सामान और जोड़ें!`
                  : `Add ${formatINR(remainingForFreeShipping)} more to qualify for FREE Shipping across India!`}
              </p>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-bold">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>{t.freeShippingQualified}</span>
              </div>
            )}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-radha-600 transition-all duration-300 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-gold-50 dark:bg-zinc-800 text-gold-600 dark:text-gold-400 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  {t.cartEmpty}
                </p>
                <button
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-radha-600 text-white font-medium text-xs hover:bg-radha-700 transition-all shadow-md shadow-radha-600/20"
                >
                  <span>{t.startShopping}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gold-200 dark:border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                    </h4>
                    {(item.variantSize || item.variantColor) && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {[item.variantSize, item.variantColor].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-radha-700 dark:text-radha-400">
                        {formatINR(item.unitPrice)}
                      </span>
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          title="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-zinc-400 hover:text-red-500 p-1 self-start"
                    title={t.remove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon (VRINDAVAN10)"
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gold-600 text-white hover:bg-gold-700 transition-colors disabled:opacity-50"
                >
                  {couponLoading ? '...' : t.applyCoupon}
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Coupon {appliedCoupon.code} applied: -{formatINR(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}

              {/* Subtotal, Discount & Total */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatINR(subtotal)}</span>
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
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? t.freeShipping : '₹70'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-1">
                  <span>{t.total}</span>
                  <span className="text-radha-700 dark:text-radha-400 font-extrabold text-base">
                    {formatINR(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-radha-600 to-radha-700 hover:from-radha-700 hover:to-radha-800 text-white font-bold text-sm shadow-lg shadow-radha-600/30 transition-all transform active:scale-95"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
