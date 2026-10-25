'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { OtpInput } from '../../components/OtpInput';
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
  ShieldCheck,
  AlertCircle,
  Edit2,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refreshProfile } = useAuth();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // OTP Verification modal state for profile changes
  const [otpVerificationState, setOtpVerificationState] = useState<{
    target: string;
    channel: 'SMS' | 'EMAIL';
    purpose: 'profile';
    type: 'phone' | 'email';
  } | null>(null);
  const [phoneToken, setPhoneToken] = useState<string | null>(null);
  const [emailToken, setEmailToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

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
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    const cleanedPhone = editPhone.trim().replace(/^(\+91|0)/, '');
    const phoneChanged = cleanedPhone !== user.phone;
    const emailChanged = editEmail.trim() !== (user.email || '');

    // If phone changed and not yet verified
    if (phoneChanged && !phoneToken) {
      if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
        setProfileMsg({
          type: 'error',
          text: isHi ? 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit Indian mobile number.',
        });
        return;
      }
      setOtpVerificationState({
        target: cleanedPhone,
        channel: 'SMS',
        purpose: 'profile',
        type: 'phone',
      });
      return;
    }

    // If email changed and not yet verified
    if (emailChanged && !emailToken) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
        setProfileMsg({
          type: 'error',
          text: isHi ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.',
        });
        return;
      }
      setOtpVerificationState({
        target: editEmail.trim(),
        channel: 'EMAIL',
        purpose: 'profile',
        type: 'email',
      });
      return;
    }

    // Call update profile
    try {
      setProfileSaving(true);
      await api.updateProfile({
        name: editName.trim(),
        phone: phoneChanged ? cleanedPhone : undefined,
        email: emailChanged ? editEmail.trim() : undefined,
        phoneVerificationToken: phoneToken || undefined,
        emailVerificationToken: emailToken || undefined,
      });

      await refreshProfile();
      setPhoneToken(null);
      setEmailToken(null);
      setIsEditingProfile(false);
      setProfileMsg({
        type: 'success',
        text: isHi ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई है।' : 'Profile updated successfully!',
      });
    } catch (err: any) {
      setProfileMsg({
        type: 'error',
        text: err.message || (isHi ? 'अपडेट करने में त्रुटि हुई।' : 'Failed to update profile.'),
      });
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Profile Summary Card with Verified Badges */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border-2 border-amber-300 shadow-inner shrink-0">
            🌸
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
              {isHi ? 'श्री राधा रानी भक्त खाता' : 'Devotee Account'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-serif">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-200 pt-1">
              {/* Phone Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/20">
                <Phone className="w-3 h-3 text-amber-300" />
                <span className="font-mono">{user.phone}</span>
                {user.phoneVerified ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/80 text-[10px] font-bold text-white">
                    <Check className="w-2.5 h-2.5" />
                    <span>{isHi ? 'सत्यापित' : 'Verified'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/80 text-[10px] font-bold text-white">
                    <span>{isHi ? 'असत्यापित' : 'Unverified'}</span>
                  </span>
                )}
              </div>

              {/* Email Badge */}
              {user.email && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/20">
                  <Mail className="w-3 h-3 text-amber-300" />
                  <span>{user.email}</span>
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/80 text-[10px] font-bold text-white">
                      <Check className="w-2.5 h-2.5" />
                      <span>{isHi ? 'सत्यापित' : 'Verified'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/80 text-[10px] font-bold text-white">
                      <span>{isHi ? 'असत्यापित' : 'Unverified'}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-sm transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logout}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{isHi ? 'मेरे ऑर्डर (Orders)' : 'My Orders'} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'profile'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isHi ? 'व्यक्तिगत विवरण (Profile)' : 'Profile Details'}</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'addresses'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{isHi ? 'सहेजे गए पते (Addresses)' : 'Saved Addresses'}</span>
        </button>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <Package className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {isHi ? 'अभी तक कोई ऑर्डर नहीं दिया गया है।' : 'No orders placed yet.'}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <span>{t.startShopping}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">{ord.orderNumber}</span>
                    <p className="text-[11px] text-stone-400">
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        ord.status === 'DELIVERED'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : ord.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="font-black text-sm text-stone-900 dark:text-white">
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
                        className="w-10 h-10 rounded-xl object-cover border border-amber-200 dark:border-stone-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                          {isHi && it.productNameHi ? it.productNameHi : it.productName}
                        </p>
                        <p className="text-[11px] text-stone-400">Qty: {it.quantity}</p>
                      </div>
                      <span className="font-bold text-stone-700 dark:text-stone-300">{formatINR(it.totalPrice)}</span>
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

      {/* Tab 2: Profile Details & Verification */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white font-serif">
                {isHi ? 'भक्त व्यक्तिगत विवरण' : 'Devotee Profile'}
              </h2>
              <p className="text-xs text-stone-500">
                {isHi ? 'मोबाइल अथवा ईमेल बदलने पर पुनः सत्यापन आवश्यक होगा' : 'Modifying phone or email requires one-time re-verification'}
              </p>
            </div>
            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isHi ? 'संशोधन करें' : 'Edit Profile'}</span>
              </button>
            )}
          </div>

          {profileMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300'
              }`}
            >
              <span>{profileMsg.type === 'success' ? '🌸' : '⚠️'}</span>
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                {isHi ? 'पूरा नाम' : 'Full Name'}
              </label>
              <input
                type="text"
                disabled={!isEditingProfile}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  {isHi ? 'मोबाइल नंबर' : 'Mobile Number'}
                </label>
                {user.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isHi ? 'सत्यापित' : 'Verified'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{isHi ? 'असत्यापित' : 'Unverified'}</span>
                  </span>
                )}
              </div>
              <input
                type="tel"
                disabled={!isEditingProfile}
                maxLength={10}
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  {isHi ? 'ईमेल पता' : 'Email Address'}
                </label>
                {user.email && (
                  user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isHi ? 'सत्यापित' : 'Verified'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{isHi ? 'असत्यापित' : 'Unverified'}</span>
                    </span>
                  )
                )}
              </div>
              <input
                type="email"
                disabled={!isEditingProfile}
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="devotee@gmail.com"
                className="w-full px-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            {isEditingProfile && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isHi ? 'सुरक्षित सहेजें' : 'Save Changes'}</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEditName(user.name || '');
                    setEditPhone(user.phone || '');
                    setEditEmail(user.email || '');
                    setPhoneToken(null);
                    setEmailToken(null);
                  }}
                  className="px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr: any) => (
              <div
                key={addr.id}
                className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 dark:text-white">{addr.recipientName}</span>
                  {addr.isDefault && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-stone-600 dark:text-stone-400">{addr.street}</p>
                {addr.landmark && <p className="text-stone-500">Landmark: {addr.landmark}</p>}
                <p className="text-stone-600 dark:text-stone-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-stone-600 dark:text-stone-400">Phone: {addr.phone}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-400">No saved addresses yet.</p>
          )}
        </div>
      )}

      {/* Profile Change OTP Re-verification Modal */}
      {otpVerificationState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setOtpVerificationState(null)}
              className="absolute -top-10 right-0 p-1 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <OtpInput
              target={otpVerificationState.target}
              channel={otpVerificationState.channel}
              purpose="profile"
              title={
                isHi
                  ? `नए ${otpVerificationState.type === 'phone' ? 'मोबाइल नंबर' : 'ईमेल'} का सत्यापन`
                  : `Verify New ${otpVerificationState.type === 'phone' ? 'Mobile' : 'Email'}`
              }
              subtitle={
                isHi
                  ? `परिवर्तन की पुष्टि हेतु इस ${otpVerificationState.type === 'phone' ? 'नंबर' : 'ईमेल'} पर भेजा गया 6-अंकीय कोड दर्ज करें`
                  : `Enter 6-digit code sent to verify this change`
              }
              onVerified={(token) => {
                if (otpVerificationState.type === 'phone') {
                  setPhoneToken(token);
                } else {
                  setEmailToken(token);
                }
                setOtpVerificationState(null);
                setProfileMsg({
                  type: 'success',
                  text: isHi
                    ? 'सत्यापन पूर्ण! अब सहेजने के लिए "Save Changes" पर क्लिक करें।'
                    : 'Verification complete! Click "Save Changes" to apply.',
                });
              }}
              onEditTarget={() => setOtpVerificationState(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
