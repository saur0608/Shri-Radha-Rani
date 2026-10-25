'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import SearchModal from './SearchModal';
import CartDrawer from './CartDrawer';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Heart,
} from 'lucide-react';

export default function Navbar() {
  const { language, t } = useLanguage();
  const { totalItems, openCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Blessing Announcement Bar */}
      <div className="bg-gradient-to-r from-radha-700 via-gold-600 to-radha-800 text-white text-[11px] md:text-xs py-1.5 px-4 text-center font-medium shadow-inner tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-200 animate-pulse hidden sm:inline" />
          <span>{t.topBanner}</span>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gold-200/60 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-gold-50 dark:hover:bg-zinc-800 focus:outline-none"
                aria-label="Open mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-radha-500 to-gold-500 flex items-center justify-center shadow-divine group-hover:scale-105 transition-transform shrink-0">
                <span className="text-white text-xl md:text-2xl font-serif">🌸</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg md:text-xl text-zinc-900 dark:text-white tracking-tight font-devanagari">
                  {language === 'hi' ? 'श्री राधा रानी श्रृंगार' : 'Shri Radha Rani Shringar'}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-gold-700 dark:text-gold-400 -mt-0.5 tracking-wider uppercase">
                  {language === 'hi' ? 'श्री वृन्दावन धाम' : 'Holy Vrindavan Dham'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-medium text-sm text-zinc-700 dark:text-zinc-200">
              <Link href="/" className="hover:text-radha-600 dark:hover:text-radha-400 transition-colors">
                {t.home}
              </Link>
              <Link href="/products" className="hover:text-radha-600 dark:hover:text-radha-400 transition-colors">
                {t.shop}
              </Link>
              <Link href="/products?sort=bestseller" className="hover:text-radha-600 dark:hover:text-radha-400 transition-colors">
                {t.bestsellers}
              </Link>
              <Link href="/products?sort=newest" className="hover:text-radha-600 dark:hover:text-radha-400 transition-colors">
                {t.newArrivals}
              </Link>
              <Link href="/about" className="hover:text-radha-600 dark:hover:text-radha-400 transition-colors">
                {t.about}
              </Link>
            </nav>

            {/* Action Buttons (Search, Lang, Theme, Account, Cart) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-radha-600 dark:hover:text-radha-400 hover:bg-gold-50 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title={t.searchPlaceholder}
                aria-label="Search items"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Language Switcher */}
              <div className="hidden sm:block">
                <LanguageToggle />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Account Link */}
              <Link
                href={isAuthenticated ? '/account' : '/account/login'}
                className="hidden sm:flex items-center gap-1.5 p-2 text-zinc-700 dark:text-zinc-300 hover:text-radha-600 dark:hover:text-radha-400 hover:bg-gold-50 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title={isAuthenticated ? user?.name : t.login}
              >
                <User className="w-5 h-5" />
                {isAuthenticated && (
                  <span className="text-xs font-semibold max-w-[80px] truncate hidden md:inline">
                    {user?.name.split(' ')[0]}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative flex items-center justify-center p-2.5 rounded-full bg-gradient-to-r from-radha-600 to-radha-700 text-white shadow-md shadow-radha-600/30 hover:shadow-lg hover:from-radha-700 hover:to-radha-800 transition-all transform active:scale-95"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 text-zinc-950 text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-zinc-900 animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gold-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
            <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <LanguageToggle />
              <Link
                href={isAuthenticated ? '/account' : '/account/login'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-semibold text-radha-600 flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span>{isAuthenticated ? user?.name : t.login}</span>
              </Link>
            </div>
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800"
              >
                {t.home}
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800"
              >
                {t.shop}
              </Link>
              <Link
                href="/products?category=radha-rani-poshak"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800 pl-4 text-xs text-radha-600"
              >
                🌸 {language === 'hi' ? 'श्री राधा रानी पोशाक' : 'Radha Rani Poshak'}
              </Link>
              <Link
                href="/products?category=laddu-gopal-dresses"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800 pl-4 text-xs text-gold-600"
              >
                ✨ {language === 'hi' ? 'लड्डू गोपाल जी की पोशाक' : 'Laddu Gopal Dresses'}
              </Link>
              <Link
                href="/products?category=shringar-jewellery"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800 pl-4 text-xs text-teal-600"
              >
                🦚 {language === 'hi' ? 'मुकुट, बांसुरी एवं आभूषण' : 'Mukut, Flutes & Jewellery'}
              </Link>
              <Link
                href="/products?sort=bestseller"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800"
              >
                {t.bestsellers}
              </Link>
              <Link
                href="/products?sort=newest"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800"
              >
                {t.newArrivals}
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800"
              >
                {t.about}
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gold-50 dark:hover:bg-zinc-800"
              >
                {t.contact}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Global Interactive Overlays */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
