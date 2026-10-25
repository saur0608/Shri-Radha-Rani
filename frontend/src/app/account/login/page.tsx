'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Sparkles, Loader2, Lock, Phone, User, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { language, t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phone.trim() || !formData.password.trim()) {
      setError(language === 'hi' ? 'कृपया मोबाइल नंबर एवं पासवर्ड दर्ज करें।' : 'Please enter mobile number and password.');
      return;
    }

    try {
      setIsLoading(true);
      if (mode === 'login') {
        await login(formData.phone.trim(), formData.password);
      } else {
        if (!formData.name.trim()) {
          setError(language === 'hi' ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.');
          return;
        }
        await register({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          password: formData.password,
        });
      }
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-gold-200 dark:border-zinc-800 shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-radha-500 to-gold-500 text-white flex items-center justify-center mx-auto text-xl shadow-md">
            🌸
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-devanagari">
            {mode === 'login'
              ? language === 'hi'
                ? 'भक्त लॉगिन'
                : 'Devotee Login'
              : language === 'hi'
              ? 'नया भक्त पंजीकरण'
              : 'Devotee Registration'}
          </h1>
          <p className="text-xs text-zinc-500">
            {language === 'hi' ? 'श्री राधा रानी श्रृंगार सेवा परिवार में आपका स्वागत है' : 'Welcome to Shri Radha Rani Shringar family'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-zinc-900 text-radha-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {language === 'hi' ? 'लॉग इन' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-zinc-900 text-radha-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {language === 'hi' ? 'नया पंजीकरण' : 'Register'}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {t.fullName} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Gopal Das"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              {language === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-Digit Mobile Number'} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {t.emailAddress} (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="bhakt@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              {language === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6 chars)'} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-radha-600 to-radha-700 hover:from-radha-700 hover:to-radha-800 text-white font-bold text-sm shadow-md shadow-radha-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <span>{language === 'hi' ? 'लॉग इन करें' : 'Login to Account'}</span>
            ) : (
              <span>{language === 'hi' ? 'पंजीकरण पूर्ण करें' : 'Create Sacred Account'}</span>
            )}
          </button>
        </form>

        {/* Demo Hint */}
        <div className="pt-2 text-center text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
          <span>Demo Devotee: </span>
          <span className="font-mono text-zinc-600 dark:text-zinc-300 font-bold">9812345678 / RadheShyam@108</span>
        </div>
      </div>
    </div>
  );
}
