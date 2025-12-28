'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle successful login
                console.log('Login successful:', data);
                // Redirect or update auth state
            } else {
                // Handle error
                console.error('Login failed:', data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015] p-4 overflow-hidden relative">
            {/* Animated background elements */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-[#a60054] rounded-full blur-3xl opacity-20"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-96 h-96 bg-[#211f60] rounded-full blur-3xl opacity-20"
                animate={{
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Main container - 85% of screen */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-[85vw] h-[85vh] bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative z-10"
            >
                <div className="w-full h-full flex">
                    {/* Left side - Splash image */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#a60054] to-[#211f60] relative overflow-hidden"
                    >
                        {/* Geometric decorative elements */}
                        <div className="absolute inset-0 opacity-20">
                            <motion.div
                                className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute bottom-32 right-16 w-40 h-40 border-2 border-white"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>

                        {/* Content overlay */}
                        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="text-center"
                            >
                                <motion.h1
                                    className="text-6xl font-bold mb-6 tracking-tight"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Welcome Back
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.7 }}
                                    className="text-xl text-white/80 max-w-md leading-relaxed"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Enter your credentials to access your account and continue your journey
                                </motion.p>

                                {/* Animated dots */}
                                <div className="flex gap-3 justify-center mt-12">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-white rounded-full"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: i * 0.3,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>

                    {/* Right side - Form */}
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white/5 backdrop-blur-sm"
                    >
                        <div className="w-full max-w-md">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="mb-12"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Sign In
                                </h2>
                                <p className="text-white/60 text-lg">Access your account</p>
                            </motion.div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email input */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                >
                                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <motion.input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedInput('email')}
                                            onBlur={() => setFocusedInput(null)}
                                            required
                                            className="w-full px-4 py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                                            style={{
                                                borderColor: focusedInput === 'email' ? '#a60054' : 'rgba(255, 255, 255, 0.2)'
                                            }}
                                            placeholder="you@example.com"
                                            animate={{
                                                scale: focusedInput === 'email' ? 1.02 : 1,
                                            }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    </div>
                                </motion.div>

                                {/* Password input */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.7 }}
                                >
                                    <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <motion.input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedInput('password')}
                                            onBlur={() => setFocusedInput(null)}
                                            required
                                            className="w-full px-4 py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                                            style={{
                                                borderColor: focusedInput === 'password' ? '#a60054' : 'rgba(255, 255, 255, 0.2)'
                                            }}
                                            placeholder="••••••••"
                                            animate={{
                                                scale: focusedInput === 'password' ? 1.02 : 1,
                                            }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    </div>
                                </motion.div>

                                {/* Remember me & Forgot password */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className="flex items-center justify-between"
                                >
                                    <label className="flex items-center cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#a60054] focus:ring-[#a60054] focus:ring-offset-0 cursor-pointer" />
                                        <span className="ml-2 text-sm text-white/70 group-hover:text-white transition-colors">Remember me</span>
                                    </label>
                                    <a href="#" className="text-sm text-[#a60054] hover:text-[#c91069] transition-colors font-medium">
                                        Forgot password?
                                    </a>
                                </motion.div>

                                {/* Submit button */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.9 }}
                                >
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-[#211f60] to-[#a60054] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        />
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {isLoading ? (
                                                <>
                                                    <motion.div
                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    Signing in...
                                                </>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </span>
                                    </motion.button>
                                </motion.div>

                                {/* Sign up link */}
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 1 }}
                                    className="text-center text-white/60 text-sm"
                                >
                                    Don't have an account?{' '}
                                    <a href="#" className="text-[#a60054] hover:text-[#c91069] font-medium transition-colors">
                                        Sign up
                                    </a>
                                </motion.p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}