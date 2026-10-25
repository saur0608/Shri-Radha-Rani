'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Loader2,
  Lock,
  Sparkles,
  MapPin,
  Phone,
  User as UserIcon,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    email: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'COD' as 'COD' | 'RAZORPAY',
    customerNotes: '',
    couponCode: '',
  });

  const [quote, setQuote] = useState<any>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill user data if logged in
  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a: any) => a.isDefault) || user.addresses?.[0];
      setFormData((prev) => ({
        ...prev,
        recipientName: defaultAddr?.recipientName || user.name || '',
        phone: defaultAddr?.phone || user.phone || '',
        email: user.email || '',
        street: defaultAddr?.street || '',
        landmark: defaultAddr?.landmark || '',
        city: defaultAddr?.city || '',
        state: defaultAddr?.state || '',
        pincode: defaultAddr?.pincode || '',
      }));
    }
  }, [user]);

  // Recalculate quote strictly from database prices on load
  useEffect(() => {
    async function loadQuote() {
      if (items.length === 0) return;
      try {
        setIsQuoting(true);
        const res = await api.getQuote({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
          couponCode: formData.couponCode || undefined,
        });
        if (res.success && res.data) {
          setQuote(res.data);
        }
      } catch (e: any) {
        console.warn('Quote error:', e);
      } finally {
        setIsQuoting(false);
      }
    }
    loadQuote();
  }, [items, formData.couponCode]);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError(language === 'hi' ? 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setError(language === 'hi' ? 'कृपया 6 अंकों का मान्य पिन कोड दर्ज करें।' : 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customerName: formData.recipientName,
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email.trim() || undefined,
        shippingAddress: {
          recipientName: formData.recipientName,
          phone: formData.phone.trim(),
          street: formData.street,
          landmark: formData.landmark || undefined,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode.trim(),
        },
        paymentMethod: formData.paymentMethod,
        couponCode: formData.couponCode || undefined,
        customerNotes: formData.customerNotes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      // 1. Create order on backend (stock is deducted in atomic transaction)
      const res = await api.createOrder(orderPayload);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to create order');
      }

      const createdOrder = res.data;

      // 2. Handle Payment
      if (formData.paymentMethod === 'COD') {
        await clearCart();
        router.push(`/order-confirmed?orderNumber=${createdOrder.orderNumber}`);
      } else {
        // Razorpay Online Payment Flow
        try {
          const razorpayRes = await api.createRazorpayOrder(createdOrder.id);
          const rzpData = razorpayRes.data;

          const options = {
            key: rzpData.keyId,
            amount: rzpData.amountInPaise,
            currency: rzpData.currency,
            name: 'Shri Radha Rani Shringar',
            description: `Order ${createdOrder.orderNumber}`,
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80',
            order_id: rzpData.razorpayOrderId,
            handler: async function (response: any) {
              // Verify signature on backend
              try {
                await api.verifyRazorpayPayment({
                  orderId: createdOrder.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                await clearCart();
                router.push(`/order-confirmed?orderNumber=${createdOrder.orderNumber}`);
              } catch (verifyErr: any) {
                alert('Payment verification issue. Our temple team is reviewing: ' + verifyErr.message);
                router.push(`/order-confirmed?orderNumber=${createdOrder.orderNumber}`);
              }
            },
            prefill: {
              name: formData.recipientName,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: '#e11d59', // Vrindavan Holy Pink
            },
          };

          if (window.Razorpay) {
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
          } else {
            // Fallback for environment testing
            await clearCart();
            router.push(`/order-confirmed?orderNumber=${createdOrder.orderNumber}`);
          }
        } catch (paymentErr: any) {
          setError('Payment initialization error: ' + (paymentErr.message || 'Please choose Cash on Delivery.'));
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold font-devanagari">{t.cartEmpty}</h2>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-2.5 rounded-full bg-radha-600 text-white font-bold text-xs"
        >
          {t.startShopping}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-devanagari">
          {t.checkoutTitle}
        </h1>
        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>256-bit SSL Secure Checkout</span>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Devotee Contact Information */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white font-devanagari flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-radha-600" />
              <span>{t.contactInfo}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  name="recipientName"
                  required
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Gopal Das / Radha Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-radha-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.mobileNumber} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-radha-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.emailAddress}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="devotee@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-radha-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white font-devanagari flex items-center gap-2">
              <MapPin className="w-4 h-4 text-radha-600" />
              <span>{t.deliveryAddress}</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.streetAddress} *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="House 108, Raman Reti, Near ISKCON"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-radha-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t.landmark}
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Near Prem Mandir"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t.city} *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mathura / Vrindavan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t.pincode} *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="281121"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.state} *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Uttar Pradesh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.orderNotes}
                </label>
                <textarea
                  name="customerNotes"
                  rows={2}
                  value={formData.customerNotes}
                  onChange={handleChange}
                  placeholder="e.g. Please wrap with extra care, offering for Janmashtami seva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white font-devanagari flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-radha-600" />
              <span>{t.paymentMethod}</span>
            </h2>

            <div className="space-y-3">
              {/* Cash On Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.paymentMethod === 'COD'
                    ? 'border-radha-600 bg-radha-50/50 dark:bg-radha-950/30'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="mt-1 text-radha-600 focus:ring-radha-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {t.payCod}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {language === 'hi'
                      ? 'सामान घर पर प्राप्त होने पर नकद अथवा यूपीआई से भुगतान करें।'
                      : 'Pay securely at your doorstep via Cash, UPI, or Card.'}
                  </p>
                </div>
              </label>

              {/* Razorpay Online */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.paymentMethod === 'RAZORPAY'
                    ? 'border-radha-600 bg-radha-50/50 dark:bg-radha-950/30'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={formData.paymentMethod === 'RAZORPAY'}
                  onChange={handleChange}
                  className="mt-1 text-radha-600 focus:ring-radha-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-radha-600" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {t.payOnline}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {language === 'hi'
                      ? 'तुरंत भुगतान करें: Google Pay, PhonePe, Paytm, क्रेडिट/डेबिट कार्ड, नेट बैंकिंग।'
                      : 'Instant checkout via UPI, Google Pay, PhonePe, Cards, Net Banking.'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-gold-200 dark:border-zinc-800 shadow-sm space-y-4 sticky top-28">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white font-devanagari">
              {language === 'hi' ? 'ऑर्डर में सम्मिलित वस्त्र व श्रृंगार' : 'Your Sacred Items'} ({items.length})
            </h2>

            {/* Item Thumbnails Preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80'}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gold-200 dark:border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate font-devanagari">
                      {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatINR(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Live Pricing Breakdown */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatINR(quote?.subtotal ?? subtotal)}
                </span>
              </div>
              {quote?.discount > 0 && (
                <div className="flex justify-between text-teal-600 font-semibold">
                  <span>{t.discount}</span>
                  <span>-{formatINR(quote.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>{t.shipping}</span>
                <span className="font-semibold text-teal-600">
                  {quote?.shippingFee === 0 ? t.freeShipping : formatINR(quote?.shippingFee ?? 70)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>{t.total}</span>
                <span className="text-xl font-black text-radha-700 dark:text-radha-400">
                  {formatINR(quote?.totalAmount ?? subtotal)}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting || isQuoting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-radha-600 to-radha-700 hover:from-radha-700 hover:to-radha-800 text-white font-bold text-sm shadow-xl shadow-radha-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{t.placeOrder}</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Full Return/Exchange Assistance Available</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
