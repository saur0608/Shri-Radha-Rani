'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Heart, ShieldCheck, MapPin } from 'lucide-react';

export default function AboutPage() {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-radha-600">
          🌸 {language === 'hi' ? 'श्री वृन्दावन सेवा संकल्प' : 'Our Sacred Vrindavan Mission'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-devanagari">
          {language === 'hi' ? 'हमारे बारे में: श्री राधा रानी श्रृंगार' : 'About Shri Radha Rani Shringar'}
        </h1>
        <p className="text-sm text-zinc-500 max-w-2xl mx-auto">
          {t.tagline}
        </p>
      </div>

      {/* Story Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-gold-200 dark:border-zinc-800 shadow-sm space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-devanagari">
        <div className="flex items-center gap-2 text-gold-600 font-bold">
          <Sparkles className="w-5 h-5" />
          <span>{language === 'hi' ? 'पवित्रता, भक्ति एवं परंपरा' : 'Sanctity, Devotion & Tradition'}</span>
        </div>

        <p>
          {language === 'hi'
            ? 'श्री राधा रानी श्रृंगार की स्थापना ब्रज भूमि वृन्दावन में ठाकुर जी एवं श्री जी के चरणों में समर्पित भाव से की गई है। हमारा ध्येय देश-विदेश के प्रत्येक कृष्ण-भक्त के घर, देवालय एवं मंदिर तक वृन्दावन के पवित्र वस्त्र एवं दिव्य श्रृंगार सामग्री पहुंचाना है।'
            : 'Shri Radha Rani Shringar was founded in the holy soil of Vrindavan Dham with complete surrender to the lotus feet of Kishori Ji and Thakurji. Our goal is to connect devotees across India directly with the divine aesthetics of Vrindavan.'}
        </p>

        <p>
          {language === 'hi'
            ? 'हमारी प्रत्येक पोशाक वृन्दावन के परंपरागत वैष्णव कारीगरों द्वारा पूर्ण शुचिता एवं गंगाजल के छिड़काव के उपरांत शुद्ध रेशम, मखमल और सुनहरी जरदोजी तारों से सिली जाती है। वस्त्रों में इस्तेमाल किए जाने वाले कुंदन, मोरपंख और मोती विग्रह के दिव्य स्वरूप की शोभा बढ़ाते हैं।'
            : 'Every dress is handcrafted with strict ritual sanctity by hereditary artisans of Vrindavan. We use pure chanderi silk, velvet, copper zardozi wire, and natural sanctified peacock feathers.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-radha-600" />
              <span>{language === 'hi' ? 'वृन्दावन धाम' : 'Rooted in Vrindavan'}</span>
            </h4>
            <p className="text-zinc-500">Prem Mandir & Raman Reti Marg, Mathura</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-radha-600" />
              <span>{language === 'hi' ? '100% सेवा भाव' : '100% Devotional Seva'}</span>
            </h4>
            <p className="text-zinc-500">Every package packed with love and tulsi leaves</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>{language === 'hi' ? 'सटीक नाप व परामर्श' : 'Precise Sizing Advice'}</span>
            </h4>
            <p className="text-zinc-500">Personal guidance for vigraha sizes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
