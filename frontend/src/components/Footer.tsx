'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { Heart, MapPin, Phone, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-zinc-900 text-zinc-300 pt-16 pb-8 border-t border-gold-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-zinc-800">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-radha-500 to-gold-500 flex items-center justify-center text-xl shadow-divine">
                🌸
              </div>
              <span className="font-extrabold text-lg text-white font-devanagari">
                {language === 'hi' ? 'श्री राधा रानी श्रृंगार' : 'Shri Radha Rani Shringar'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.footerAbout}
            </p>
            <div className="pt-2 text-xs text-gold-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500 shrink-0" />
              <span>{language === 'hi' ? 'जय जय श्री राधे! जय श्री कृष्णा!' : 'Jai Jai Shri Radhe! Radhe Shyam!'}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gold-400 font-devanagari">
              {t.quickLinks}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-radha-400 transition-colors">
                  {t.shop}
                </Link>
              </li>
              <li>
                <Link href="/products?category=radha-rani-poshak" className="hover:text-radha-400 transition-colors">
                  {language === 'hi' ? 'श्री राधा रानी पोशाक' : 'Radha Rani Poshak'}
                </Link>
              </li>
              <li>
                <Link href="/products?category=laddu-gopal-dresses" className="hover:text-radha-400 transition-colors">
                  {language === 'hi' ? 'लड्डू गोपाल जी की पोशाक' : 'Laddu Gopal Dress Sets'}
                </Link>
              </li>
              <li>
                <Link href="/products?category=shringar-jewellery" className="hover:text-radha-400 transition-colors">
                  {language === 'hi' ? 'श्रृंगार एवं आभूषण (मुकुट, बांसुरी)' : 'Jewellery & Flutes'}
                </Link>
              </li>
              <li>
                <Link href="/products?category=pooja-mandir-decoration" className="hover:text-radha-400 transition-colors">
                  {language === 'hi' ? 'मंदिर सज्जा, झूला एवं आरती थाली' : 'Pooja & Mandir Decoration'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Devotee Policies */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gold-400 font-devanagari">
              {t.policies}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shipping-policy" className="hover:text-radha-400 transition-colors">
                  {t.shippingPolicy}
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-radha-400 transition-colors">
                  {t.refundPolicy}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-radha-400 transition-colors">
                  {t.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-radha-400 transition-colors">
                  {t.termsOfService}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-radha-400 transition-colors">
                  {t.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Sacred Contact & Location */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gold-400 font-devanagari">
              {t.contact}
            </h3>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-radha-500 shrink-0 mt-0.5" />
                <span>
                  {language === 'hi'
                    ? 'रमण रेती मार्ग, प्रेम मंदिर के समीप, श्री वृन्दावन धाम, मथुरा, उ.प्र. - 281121'
                    : 'Raman Reti Marg, Near Prem Mandir, Holy Vrindavan Dham, Mathura, UP - 281121'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <span>+91 98765 43210 (WhatsApp Seva)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@shriradharanishringar.com</span>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>100% Secure Razorpay & COD Payments</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 text-center">
          <p>© {new Date().getFullYear()} {t.siteName}. {t.allRightsReserved}</p>
          <div className="flex items-center gap-1 text-radha-400">
            <span>Made with devotion</span>
            <Heart className="w-3.5 h-3.5 fill-current text-radha-500 inline" />
            <span>for Kishori Ji</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
