'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const footerLinks = {
        company: [
            { label: 'About Us', href: '/about' },
            { label: 'Services', href: '/#services' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Contact', href: '/#contact' },
        ],
        support: [
            { label: 'Help Center', href: '/help' },
            { label: 'FAQs', href: '/faq' },
            { label: 'Shipping Info', href: '/shipping' },
            { label: 'Returns', href: '/returns' },
        ],
        legal: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
            { label: 'Refund Policy', href: '/refund' },
        ],
    };

    const socialLinks = [
        {
            name: 'Facebook',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            href: '#',
        },
        {
            name: 'Instagram',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
            ),
            href: '#',
        },
        {
            name: 'Twitter',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
            ),
            href: '#',
        },
        {
            name: 'LinkedIn',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
            href: '#',
        },
    ];

    return (
        <footer className="relative z-10 bg-[#0a0015]/95 backdrop-blur-xl border-t border-white/10">
            {/* Animated gradient line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a60054] to-transparent"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 0%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 lg:gap-16 mb-12 sm:mb-16">
                    {/* Brand Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2"
                    >
                        <Link href="/">
                            <motion.div
                                className="flex items-center gap-3 mb-6 cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="relative w-12 h-12 bg-gradient-to-br from-[#a60054] to-[#211f60] rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                                    <span
                                        className="text-white font-bold text-2xl"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    >
                                        H
                                    </span>
                                </div>
                                <span
                                    className="text-2xl font-bold text-white"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Holixia
                                </span>
                            </motion.div>
                        </Link>

                        <p className="text-white/70 mb-6 max-w-md leading-relaxed text-sm sm:text-base">
                            Transform your creative designs into reality with our premium DTF printing
                            services. Quality, speed, and innovation in every print.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 bg-white/10 hover:bg-gradient-to-br hover:from-[#a60054] hover:to-[#211f60] rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Links Sections */}
                    {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-white font-semibold mb-5 capitalize text-base sm:text-lg">
                                {category}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link, linkIndex) => (
                                    <motion.li
                                        key={link.label}
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {link.href.startsWith('/#') ? (
                                            <button
                                                onClick={() =>
                                                    scrollToSection(link.href.replace('/#', ''))
                                                }
                                                className="text-white/70 hover:text-white transition-colors text-sm block"
                                            >
                                                {link.label}
                                            </button>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-white/70 hover:text-white transition-colors text-sm block"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="border-t border-white/10 pt-10 sm:pt-12 mb-10 sm:mb-12"
                >
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-white font-semibold mb-3 text-lg sm:text-xl">
                            Subscribe to Our Newsletter
                        </h3>
                        <p className="text-white/70 text-sm sm:text-base mb-6 sm:mb-8">
                            Get the latest updates on new features and special offers
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#a60054] focus:bg-white/15 transition-all text-sm sm:text-base"
                            />
                            <motion.button
                                className="px-8 py-3.5 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg relative overflow-hidden group whitespace-nowrap text-sm sm:text-base"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div className="absolute inset-0 bg-gradient-to-r from-[#211f60] to-[#a60054] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10">Subscribe</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm"
                >
                    <p className="text-white/60 text-center sm:text-left order-2 sm:order-1">
                        © {new Date().getFullYear()} Holixia. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6 sm:gap-8 order-1 sm:order-2">
                        <Link
                            href="/privacy"
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/cookies"
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            Cookies
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#a60054]/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#211f60]/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>
        </footer>
    );
}