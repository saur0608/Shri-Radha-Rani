'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

interface OtpInputProps {
  target: string;
  channel?: 'SMS' | 'EMAIL';
  purpose: 'signup' | 'login' | 'checkout' | 'reset' | 'profile';
  title?: string;
  subtitle?: string;
  onVerified: (verificationToken: string, sessionData?: any) => void;
  onEditTarget?: () => void;
  autoSendOnMount?: boolean;
}

export function OtpInput({
  target,
  channel: initialChannel,
  purpose,
  title,
  subtitle,
  onVerified,
  onEditTarget,
  autoSendOnMount = true,
}: OtpInputProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const channel = initialChannel || (target.includes('@') ? 'EMAIL' : 'SMS');

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send OTP on mount if requested
  useEffect(() => {
    if (autoSendOnMount) {
      sendOtpCode();
    }
  }, [target, purpose]);

  // Countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first input box on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const sendOtpCode = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSending(true);
    try {
      const res = await api.sendOtp({
        target,
        channel,
        purpose,
      });
      setCooldown(res.data?.cooldownSeconds || 30);
      setSuccessMsg(
        isHi
          ? `सत्यापन कोड ${channel === 'SMS' ? 'मोबाइल' : 'ईमेल'} पर भेज दिया गया है।`
          : `Verification code sent via ${channel === 'SMS' ? 'SMS' : 'Email'}.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || (isHi ? 'ओटीपी भेजने में त्रुटि हुई।' : 'Failed to send verification code.'));
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric digits
    const cleaned = val.replace(/\D/g, '');
    setErrorMsg('');

    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // Single digit input
    const char = cleaned.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    // Auto-advance to next box
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    } else {
      // If all 6 digits are filled, automatically submit
      const fullOtp = next.join('');
      if (fullOtp.length === 6) {
        verifyCode(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
      } else {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      next[i] = pastedData[i];
    }
    setDigits(next);

    if (pastedData.length === 6) {
      inputsRef.current[5]?.focus();
      verifyCode(pastedData);
    } else {
      const targetIndex = Math.min(5, pastedData.length);
      inputsRef.current[targetIndex]?.focus();
    }
  };

  const verifyCode = async (otpToVerify?: string) => {
    const code = otpToVerify || digits.join('');
    if (code.length !== 6) {
      setErrorMsg(isHi ? 'कृपया 6 अंकों का सही कोड दर्ज करें।' : 'Please enter all 6 digits.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await api.verifyOtp({
        target,
        otp: code,
        purpose,
      });

      if (res.success && res.data) {
        setSuccessMsg(isHi ? 'सत्यापन सफल रहा! Radhe Radhe!' : 'Verification successful!');
        onVerified(res.data.verificationToken, res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isHi ? 'अमान्य अथवा समाप्त कोड।' : 'Invalid or expired code.'));
      // Clear inputs for re-try
      setDigits(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-6 shadow-md transition-all">
      {/* Title & Target */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3 text-xl shadow-inner">
          {channel === 'SMS' ? '📱' : '✉️'}
        </div>
        <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
          {title || (isHi ? 'ओटीपी सत्यापन' : 'Enter Verification Code')}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          {subtitle ||
            (isHi
              ? `${channel === 'SMS' ? 'मोबाइल' : 'ईमेल'} पर भेजा गया 6-अंकीय कोड दर्ज करें`
              : `Enter the 6-digit code sent to`)}
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-full text-xs font-semibold text-stone-800 dark:text-stone-200">
          <span>{target}</span>
          {onEditTarget && (
            <button
              type="button"
              onClick={onEditTarget}
              className="text-rose-600 dark:text-rose-400 hover:underline font-medium ml-1"
            >
              {isHi ? 'बदलें' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      {/* 6-box input container */}
      <div className="flex justify-center items-center gap-2 sm:gap-3 mb-6">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            aria-label={isHi ? `अंक ${idx + 1}` : `Digit ${idx + 1}`}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            disabled={isLoading || isSending}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
              errorMsg
                ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20 text-red-600'
                : digit
                ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 text-stone-900 dark:text-stone-100'
                : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
            }`}
          />
        ))}
      </div>

      {/* Error or Success Notice */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-300 text-xs text-center flex items-center justify-center gap-1.5">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && !errorMsg && (
        <div className="mb-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
          <span>🌸</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verify Button */}
      <button
        type="button"
        onClick={() => verifyCode()}
        disabled={isLoading || digits.join('').length !== 6}
        className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{isHi ? 'सत्यापन हो रहा है...' : 'Verifying Code...'}</span>
          </>
        ) : (
          <span>{isHi ? 'सत्यापित करें' : 'Verify & Proceed'}</span>
        )}
      </button>

      {/* Resend OTP Section with Cooldown Timer */}
      <div className="mt-5 text-center text-xs text-stone-600 dark:text-stone-400 flex flex-col items-center justify-center gap-1">
        {cooldown > 0 ? (
          <span className="text-stone-500 dark:text-stone-400">
            {isHi ? `कोड पुनः भेजें: ${cooldown} सेकंड` : `Resend OTP in ${cooldown}s`}
          </span>
        ) : (
          <button
            type="button"
            onClick={sendOtpCode}
            disabled={isSending || isLoading}
            className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <span>{isSending ? (isHi ? 'भेजा जा रहा है...' : 'Sending...') : (isHi ? 'पुनः कोड भेजें' : 'Resend Code Now')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
