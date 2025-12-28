'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import logo from '@/public/img/logo1.png'


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navbarOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const navbarBlur = useTransform(scrollY, [0, 100], [10, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    // Wait for menu to close before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 py-4 sm:py-6 transition-all duration-300"
        style={{
          backgroundColor: isScrolled
            ? 'rgba(10, 0, 21, 0.95)'
            : 'rgba(10, 0, 21, 0.8)',
          backdropFilter: `blur(${isScrolled ? '20px' : '10px'})`,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'py-1' : 'py-2'
          }`}
        >
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#a60054] to-[#211f60] rounded-full flex items-center justify-center overflow-hidden shadow-lg"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {/* If you have a logo image, use this: */}
                <Image
                  src={logo}
                  alt="Holixia Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />

                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#c91069] to-[#2d2a80] opacity-0"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>

              <span
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Holixia
              </span>
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            {[
              { label: 'Home', href: '/', section: null },
              { label: 'Services', href: '/#services', section: 'services' },
              { label: 'Contact', href: '/#contact', section: 'contact' },
            ].map((link, index) => (
              <motion.div key={link.label} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                {link.section ? (
                  <button
                    onClick={() => scrollToSection(link.section)}
                    className="relative px-4 lg:px-6 py-2.5 text-sm lg:text-base text-white/80 hover:text-white transition-colors font-medium group"
                  >
                    {link.label}
                    <motion.span
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#a60054] to-[#211f60] group-hover:w-full transition-all duration-300"
                    />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="relative px-4 lg:px-6 py-2.5 text-sm lg:text-base text-white/80 hover:text-white transition-colors font-medium group"
                  >
                    {link.label}
                    <motion.span
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#a60054] to-[#211f60] group-hover:w-full transition-all duration-300"
                    />
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Sign In Button */}
            <Link href="/login">
              <motion.button
                className="hidden sm:block px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base text-white/80 hover:text-white transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </Link>

            {/* Get Started Button */}
            <Link href="/register">
              <motion.button
                className="relative px-4 sm:px-6 py-2 sm:py-2.5 text-sm lg:text-base bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-lg shadow-lg overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#211f60] to-[#a60054] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10">Get Started</span>

                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.button>
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden w-10 h-10 flex items-center justify-center text-white"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </motion.div>
        </div>

        {/* Bottom border with gradient */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            opacity: isScrolled ? 1 : 0.5,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: '50%',
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden fixed top-[72px] left-0 right-0 z-40"
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: 'rgba(10, 0, 21, 0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {isMobileMenuOpen && (
          <div className="px-4 py-6 space-y-4">
            {[
              { label: 'Home', href: '/', section: null },
              { label: 'Services', href: '/#services', section: 'services' },
              { label: 'Contact', href: '/#contact', section: 'contact' },
            ].map((link) => (
              <div key={link.label}>
                {link.section ? (
                  <button
                    onClick={() => scrollToSection(link.section)}
                    className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="border-t border-white/10 pt-4 space-y-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="block w-full px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left">
                  Sign In
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="block w-full px-4 py-3 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-lg">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}