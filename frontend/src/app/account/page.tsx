'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import {
  User,
  Package,
  MapPin,
  LogOut,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { language, t } = useLanguage();

  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      try {
        setLoadingOrders(true);
        const res = await api.getUserOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (e) {
        console.warn('Failed to load user orders', e);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-4 border-radha-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Profile Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-radha-700 via-radha-800 to-gold-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border-2 border-gold-300">
            🌸
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-200">
              {language === 'hi' ? 'भक्त खाता' : 'Devotee Account'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-devanagari">{user.name}</h1>
            <p className="text-xs text-zinc-200">{user.phone} {user.email ? `• ${user.email}` : ''}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logout}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 text-sm font-bold font-devanagari">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'border-radha-600 text-radha-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{language === 'hi' ? 'मेरे ऑर्डर (Order History)' : 'My Orders'} ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'addresses'
              ? 'border-radha-600 text-radha-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{language === 'hi' ? 'सहेजे गए पते (Addresses)' : 'Saved Addresses'}</span>
        </button>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <Package className="w-12 h-12 text-zinc-300 mx-auto" />
              <p className="text-sm text-zinc-500">
                {language === 'hi' ? 'अभी तक कोई ऑर्डर नहीं दिया गया है।' : 'No orders placed yet.'}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-radha-600 text-white font-bold text-xs shadow-md"
              >
                <span>{t.startShopping}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-radha-600">{ord.orderNumber}</span>
                    <p className="text-[11px] text-zinc-400">
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        ord.status === 'DELIVERED'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="font-black text-sm text-zinc-900 dark:text-white">
                      {formatINR(ord.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {ord.items?.map((it: any) => (
                    <div key={it.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={it.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80'}
                        alt={it.productName}
                        className="w-10 h-10 rounded-xl object-cover border border-gold-200 dark:border-zinc-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate font-devanagari">
                          {language === 'hi' && it.productNameHi ? it.productNameHi : it.productName}
                        </p>
                        <p className="text-[11px] text-zinc-400">Qty: {it.quantity}</p>
                      </div>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatINR(it.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking info if dispatched */}
                {ord.trackingNumber && (
                  <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-teal-600" />
                      <span>{ord.courierName || 'Express Courier'}: <strong className="font-mono">{ord.trackingNumber}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr: any) => (
              <div
                key={addr.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">{addr.recipientName}</span>
                  {addr.isDefault && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-900">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">{addr.street}</p>
                {addr.landmark && <p className="text-zinc-500">Landmark: {addr.landmark}</p>}
                <p className="text-zinc-600 dark:text-zinc-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-zinc-600 dark:text-zinc-400">Phone: {addr.phone}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-400">No saved addresses yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
