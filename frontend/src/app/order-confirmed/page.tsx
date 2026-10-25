'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { CheckCircle2, Package, Truck, ArrowRight, Sparkles, MapPin, Phone } from 'lucide-react';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const orderNumber = searchParams.get('orderNumber') || '';

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getOrder(orderNumber);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (e) {
        console.warn('Error loading order', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Success Card */}
      <div className="text-center space-y-4 p-8 sm:p-12 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-gold-300 dark:border-zinc-800 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
          🌸 {language === 'hi' ? 'श्री राधा कृपा' : 'Divine Blessings'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-devanagari">
          {t.orderConfirmed}
        </h1>

        <div className="inline-block px-4 py-2 rounded-xl bg-gold-50 dark:bg-zinc-800 border border-gold-200 dark:border-zinc-700 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {t.orderNumber}: <span className="text-radha-600">{orderNumber || 'RR-CONFIRMED'}</span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
          {t.confirmationSent}
        </p>

        <div className="p-4 rounded-2xl bg-radha-50/60 dark:bg-zinc-800/60 border border-radha-100 dark:border-zinc-700/60 flex items-center justify-center gap-2 text-xs font-semibold text-radha-800 dark:text-radha-300">
          <Truck className="w-4 h-4 text-radha-600 shrink-0" />
          <span>{t.estimatedDelivery}</span>
        </div>
      </div>

      {/* Order Details Breakdown if loaded */}
      {order && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <h2 className="font-bold text-lg text-zinc-900 dark:text-white font-devanagari">
            {language === 'hi' ? 'ऑर्डर सारांश एवं डिलीवरी विवरण' : 'Order Details & Delivery Summary'}
          </h2>

          {/* Delivery Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 space-y-1">
              <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block">
                {t.deliveryAddress}
              </span>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{order.customerName}</p>
              <p className="text-zinc-600 dark:text-zinc-400">{order.shippingAddress?.street}</p>
              <p className="text-zinc-600 dark:text-zinc-400">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">Phone: {order.customerPhone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 space-y-1">
              <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block">
                {t.paymentMethod}
              </span>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Razorpay Online Payment'}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                Status: <span className="font-semibold text-teal-600">{order.paymentStatus}</span>
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                Order Status: <span className="font-semibold text-radha-600">{order.status}</span>
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80'}
                  alt={item.productName}
                  className="w-12 h-12 rounded-xl object-cover border border-gold-200 dark:border-zinc-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate font-devanagari">
                    {language === 'hi' && item.productNameHi ? item.productNameHi : item.productName}
                  </p>
                  {item.variantInfo && <p className="text-[11px] text-zinc-400">{item.variantInfo}</p>}
                  <p className="text-[11px] text-zinc-500">Qty: {item.quantity} × {formatINR(item.unitPrice)}</p>
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Total Breakdown */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm font-bold">
            <span>{t.total}</span>
            <span className="text-radha-700 dark:text-radha-400 text-base">{formatINR(order.totalAmount)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-radha-600 text-white font-bold text-xs shadow-lg hover:bg-radha-700 transition-all"
        >
          <span>{t.continueShopping}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/account"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 font-bold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          <Package className="w-4 h-4" />
          <span>{t.trackOrder}</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <OrderConfirmedContent />
    </Suspense>
  );
}
