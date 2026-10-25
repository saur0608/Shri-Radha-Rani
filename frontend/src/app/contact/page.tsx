'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { language, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-radha-600">
          🌸 {language === 'hi' ? 'सम्पर्क एवं भक्त सहायता' : 'Devotee Seva Support'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-devanagari">
          {t.contact}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
          {language === 'hi'
            ? 'विग्रह के नाप, पोशाक के चयन अथवा ऑर्डर संबंधी किसी भी सहायता हेतु हमसे सम्पर्क करें।'
            : 'Get in touch for custom vigraha sizing, festival poshak orders, or delivery support.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-5 p-8 rounded-3xl bg-gradient-to-br from-radha-800 to-gold-800 text-white space-y-6 shadow-xl">
          <h3 className="font-bold text-lg font-devanagari">
            {language === 'hi' ? 'वृन्दावन धाम कार्यालय' : 'Vrindavan Dham Seva Kendra'}
          </h3>
          <div className="space-y-4 text-xs text-zinc-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold-300 shrink-0 mt-0.5" />
              <span>
                {language === 'hi'
                  ? 'रमण रेती मार्ग, प्रेम मंदिर गेट 2 के सामने, श्री वृन्दावन धाम, मथुरा, उत्तर प्रदेश - 281121'
                  : 'Raman Reti Marg, Opp Prem Mandir Gate 2, Holy Vrindavan Dham, Mathura, UP - 281121'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gold-300 shrink-0" />
              <span>+91 98765 43210 (WhatsApp Available)</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-teal-300 shrink-0" />
              <span>support@shriradharanishringar.com</span>
            </div>
          </div>
          <div className="pt-4 border-t border-white/20 text-xs text-gold-200">
            <span>⏰ Seva Hours: Mon - Sun: 8:00 AM - 9:00 PM (IST)</span>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white font-devanagari">
            {language === 'hi' ? 'हमें सन्देश भेजें' : 'Send us a Sacred Message'}
          </h3>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'राधे राधे! आपका सन्देश प्राप्त हुआ। हम शीघ्र ही सम्पर्क करेंगे।' : 'Message sent successfully. Radhe Radhe!'}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                  <input type="text" required placeholder="Gopal Das" className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone</label>
                  <input type="tel" required placeholder="9876543210" className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Message / Question</label>
                <textarea rows={4} required placeholder="Inquire about vigraha sizing, delivery timeline..." className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-radha-600 text-white font-bold text-xs hover:bg-radha-700 transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
