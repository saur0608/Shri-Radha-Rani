'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { OtpInput } from '../../../components/OtpInput';
import { api } from '../../../lib/api';
import { Sparkles, Loader2, Lock, Phone, User, Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, setSession } = useAuth();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  // OTP Login state
  const [otpTarget, setOtpTarget] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Signup Multi-step Verification state
  // 'form' -> 'verify_phone' -> 'verify_email' -> 'completed'
  const [signupStep, setSignupStep] = useState<'form' | 'verify_phone' | 'verify_email'>('form');
  const [phoneToken, setPhoneToken] = useState<string>('');
  const [emailToken, setEmailToken] = useState<string>('');

  // Forgot Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotTarget, setForgotTarget] = useState('');
  const [forgotStep, setForgotStep] = useState<'input' | 'verify' | 'new_password'>('input');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- PASSWORD LOGIN SUBMIT ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.phone.trim() || !formData.password.trim()) {
      setError(isHi ? 'कृपया मोबाइल नंबर एवं पासवर्ड दर्ज करें।' : 'Please enter mobile number and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.phone.trim(), formData.password);
      router.push('/account');
    } catch (err: any) {
      setError(err.message || (isHi ? 'लॉगिन विफल रहा।' : 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  // --- OTP LOGIN: SEND CODE ---
  const handleStartOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const target = otpTarget.trim();
    if (!target) {
      setError(isHi ? 'कृपया 10 अंकों का मोबाइल नंबर अथवा ईमेल दर्ज करें।' : 'Please enter mobile number or email.');
      return;
    }

    const isEmail = target.includes('@');
    if (!isEmail && !/^[6-9]\d{9}$/.test(target)) {
      setError(isHi ? 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsOtpSent(true);
  };

  // --- SIGNUP: STEP 1 SUBMIT ---
  const handleStartSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError(isHi ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.');
      return;
    }
    const cleanedPhone = formData.phone.trim().replace(/^(\+91|0)/, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setError(isHi ? 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError(isHi ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError(isHi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    // Step 1: Verify phone number first
    setSignupStep('verify_phone');
  };

  // --- SIGNUP: WHEN PHONE VERIFIED ---
  const handlePhoneVerified = (token: string) => {
    setPhoneToken(token);
    // Transition to Step 2: Verify email
    setSignupStep('verify_email');
  };

  // --- SIGNUP: WHEN EMAIL VERIFIED ---
  const handleEmailVerified = async (token: string) => {
    setEmailToken(token);
    setIsLoading(true);
    setError('');

    try {
      await register({
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/^(\+91|0)/, ''),
        email: formData.email.trim(),
        password: formData.password,
        phoneVerificationToken: phoneToken,
        emailVerificationToken: token,
      });
      router.push('/account');
    } catch (err: any) {
      setError(err.message || (isHi ? 'पंजीकरण में त्रुटि हुई।' : 'Registration failed. Please try again.'));
      setSignupStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  // --- FORGOT PASSWORD SUBMIT NEW PASSWORD ---
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(isHi ? 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(isHi ? 'दोनों पासवर्ड मेल नहीं खा रहे हैं।' : 'Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await api.resetPassword({
        target: forgotTarget.trim(),
        resetToken,
        newPassword,
      });

      setSuccessMsg(isHi ? 'पासवर्ड सफलतापूर्वक बदल दिया गया है! कृपया नए पासवर्ड से लॉगिन करें।' : 'Password reset successfully! Please login with your new password.');
      setIsForgotPassword(false);
      setForgotStep('input');
      setLoginMethod('password');
      setFormData((prev) => ({ ...prev, phone: forgotTarget, password: '' }));
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-amber-200 dark:border-stone-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 via-amber-500 to-rose-600 text-white flex items-center justify-center mx-auto text-2xl shadow-lg ring-4 ring-rose-50 dark:ring-stone-800">
            🌸
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-serif">
            {isForgotPassword
              ? isHi
                ? 'पासवर्ड रीसेट करें'
                : 'Reset Password'
              : mode === 'login'
              ? isHi
                ? 'भक्त लॉगिन'
                : 'Devotee Login'
              : isHi
              ? 'नया भक्त पंजीकरण'
              : 'Devotee Registration'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {isHi
              ? 'श्री राधा रानी श्रृंगार सेवा परिवार में आपका स्वागत है'
              : 'Welcome to Shri Radha Rani Shringar Devotional Family'}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <span>🌸</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORGOT PASSWORD FLOW */}
        {/* ========================================================================= */}
        {isForgotPassword ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setForgotStep('input');
                setError('');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-rose-600 transition-colors font-medium mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isHi ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}</span>
            </button>

            {forgotStep === 'input' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotTarget.trim()) {
                    setError(isHi ? 'कृपया मोबाइल या ईमेल दर्ज करें।' : 'Please enter mobile or email.');
                    return;
                  }
                  setError('');
                  setForgotStep('verify');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {isHi ? 'पंजीकृत मोबाइल नंबर या ईमेल' : 'Registered Mobile Number or Email'} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={forgotTarget}
                      onChange={(e) => setForgotTarget(e.target.value)}
                      placeholder="9876543210 or devotee@gmail.com"
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isHi ? 'ओटीपी सत्यापन कोड प्राप्त करें' : 'Send Verification OTP'}</span>
                </button>
              </form>
            )}

            {forgotStep === 'verify' && (
              <OtpInput
                target={forgotTarget.trim()}
                purpose="reset"
                title={isHi ? 'पासवर्ड रीसेट कोड' : 'Reset Verification Code'}
                subtitle={isHi ? 'पासवर्ड रीसेट हेतु 6 अंकों का ओटीपी दर्ज करें' : 'Enter 6-digit code to reset password'}
                onVerified={(token) => {
                  setResetToken(token);
                  setForgotStep('new_password');
                }}
                onEditTarget={() => setForgotStep('input')}
              />
            )}

            {forgotStep === 'new_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {isHi ? 'नया पासवर्ड' : 'New Password (min 6 chars)'} *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {isHi ? 'नए पासवर्ड की पुनः पुष्टि करें' : 'Confirm New Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isHi ? 'पासवर्ड अपडेट करें' : 'Update Password'}</span>}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* MAIN TABS: LOGIN / REGISTER */
          /* ========================================================================= */
          <div className="space-y-5">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setIsOtpSent(false);
                }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-stone-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {isHi ? 'लॉग इन (Login)' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSignupStep('form');
                }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-stone-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {isHi ? 'नया पंजीकरण (Signup)' : 'Register'}
              </button>
            </div>

            {/* -------------------- LOGIN TAB -------------------- */}
            {mode === 'login' && (
              <div className="space-y-4">
                {/* Method selector: OTP vs Password */}
                <div className="flex items-center justify-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-stone-500">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp');
                      setError('');
                      setIsOtpSent(false);
                    }}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      loginMethod === 'otp'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800'
                        : 'hover:text-stone-800'
                    }`}
                  >
                    ⚡ {isHi ? 'मोबाइल OTP द्वारा लॉगिन (त्वरित)' : 'Mobile / Email OTP (Quick)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('password');
                      setError('');
                    }}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      loginMethod === 'password'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800'
                        : 'hover:text-stone-800'
                    }`}
                  >
                    🔑 {isHi ? 'पासवर्ड द्वारा' : 'With Password'}
                  </button>
                </div>

                {/* Sub-view: OTP Login */}
                {loginMethod === 'otp' && (
                  <div>
                    {!isOtpSent ? (
                      <form onSubmit={handleStartOtpLogin} className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                            {isHi ? '10 अंकों का मोबाइल नंबर अथवा ईमेल' : 'Mobile Number or Email'} *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                            <input
                              type="text"
                              required
                              value={otpTarget}
                              onChange={(e) => setOtpTarget(e.target.value)}
                              placeholder="9876543210 or bhakt@gmail.com"
                              className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                        >
                          <span>{isHi ? '6-अंकीय ओटीपी प्राप्त करें' : 'Send 6-Digit OTP'}</span>
                        </button>
                      </form>
                    ) : (
                      <OtpInput
                        target={otpTarget.trim()}
                        purpose="login"
                        title={isHi ? 'लॉगिन सत्यापन' : 'Login Verification'}
                        subtitle={isHi ? 'सुरक्षित लॉगिन हेतु प्राप्त 6-अंकीय कोड दर्ज करें' : 'Enter 6-digit code for instant login'}
                        onVerified={(_token, sessionData) => {
                          if (sessionData?.user && sessionData?.token) {
                            setSession(sessionData.user, sessionData.token);
                          }
                          router.push('/account');
                        }}
                        onEditTarget={() => setIsOtpSent(false)}
                      />
                    )}
                  </div>
                )}

                {/* Sub-view: Password Login */}
                {loginMethod === 'password' && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {isHi ? 'मोबाइल नंबर अथवा ईमेल' : 'Mobile Number or Email'} *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                        <input
                          type="text"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-stone-700 dark:text-stone-300">
                          {isHi ? 'पासवर्ड' : 'Password'} *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotTarget(formData.phone);
                            setError('');
                          }}
                          className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-medium"
                        >
                          {isHi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isHi ? 'लॉग इन करें' : 'Login to Sacred Account'}</span>}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* -------------------- SIGNUP TAB (DUAL VERIFICATION) -------------------- */}
            {mode === 'register' && (
              <div className="space-y-4">
                {/* Step indicators */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className={`flex items-center gap-1.5 ${signupStep === 'form' ? 'text-rose-600 font-bold' : ''}`}>
                    <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[10px]">1</span>
                    <span>{isHi ? 'विवरण' : 'Details'}</span>
                  </div>
                  <span>→</span>
                  <div className={`flex items-center gap-1.5 ${signupStep === 'verify_phone' ? 'text-rose-600 font-bold' : phoneToken ? 'text-emerald-600' : ''}`}>
                    <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center text-[10px]">2</span>
                    <span>{isHi ? 'मोबाइल OTP' : 'Phone OTP'}</span>
                  </div>
                  <span>→</span>
                  <div className={`flex items-center gap-1.5 ${signupStep === 'verify_email' ? 'text-rose-600 font-bold' : ''}`}>
                    <span className="w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px]">3</span>
                    <span>{isHi ? 'ईमेल OTP' : 'Email OTP'}</span>
                  </div>
                </div>

                {signupStep === 'form' && (
                  <form onSubmit={handleStartSignup} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {isHi ? 'पूरा नाम' : 'Full Name'} *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Radha Devotee"
                          className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {isHi ? '10 अंकों का भारतीय मोबाइल नंबर' : '10-Digit Indian Mobile Number'} *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {isHi ? 'ईमेल पता (सत्यापन आवश्यक)' : 'Email Address (Verification required)'} *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="devotee@gmail.com"
                          className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {isHi ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6 chars)'} *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{isHi ? 'ओटीपी सत्यापन हेतु आगे बढ़ें' : 'Continue with OTP Verification'}</span>
                    </button>
                  </form>
                )}

                {signupStep === 'verify_phone' && (
                  <div>
                    <OtpInput
                      target={formData.phone.trim().replace(/^(\+91|0)/, '')}
                      channel="SMS"
                      purpose="signup"
                      title={isHi ? 'चरण 1: मोबाइल नंबर सत्यापन' : 'Step 1: Mobile Verification'}
                      subtitle={isHi ? 'आपके 10-अंकीय मोबाइल नंबर पर भेजा गया कोड' : 'Enter 6-digit code sent to your mobile'}
                      onVerified={handlePhoneVerified}
                      onEditTarget={() => setSignupStep('form')}
                    />
                  </div>
                )}

                {signupStep === 'verify_email' && (
                  <div>
                    <OtpInput
                      target={formData.email.trim()}
                      channel="EMAIL"
                      purpose="signup"
                      title={isHi ? 'चरण 2: ईमेल पता सत्यापन' : 'Step 2: Email Verification'}
                      subtitle={isHi ? 'आपके ईमेल पर भेजा गया कोड' : 'Enter 6-digit code sent to your email'}
                      onVerified={handleEmailVerified}
                      onEditTarget={() => setSignupStep('form')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Demo Credentials Footer */}
        <div className="pt-3 text-center text-[11px] text-stone-400 border-t border-stone-100 dark:border-stone-800 flex flex-col items-center gap-1">
          <span className="font-semibold text-stone-500">🌸 Demo Devotee Account:</span>
          <span className="font-mono text-stone-600 dark:text-stone-300 font-bold">
            9812345678 / RadheShyam@108
          </span>
        </div>
      </div>
    </div>
  );
}
