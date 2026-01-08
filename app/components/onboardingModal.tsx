import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const [animationStep, setAnimationStep] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

        // Cycle through animation steps
        const interval = setInterval(() => {
            setAnimationStep((prev) => (prev + 1) % 3);
        }, 2000);

        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                        onClick={(e) => e.target === e.currentTarget && onClose()}
                    >
                        <div className="bg-gradient-to-br from-[#211f60] to-[#0a0015] border-2 border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full relative overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Decorative gradient orb */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#a60054] rounded-full blur-3xl opacity-30" />

                            {/* Content */}
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#a60054] to-[#211f60] rounded-xl sm:rounded-2xl flex items-center justify-center"
                                >
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </motion.div>

                                <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2 sm:mb-3">
                                    How It Works
                                </h2>
                                <p className="text-sm sm:text-base text-white/70 text-center mb-6 sm:mb-8 px-2">
                                    Upload your designs one at a time to build your custom print order
                                </p>

                                {/* Animation Demo Area */}
                                <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-5 sm:mb-6 relative h-36 sm:h-40 flex items-center justify-center">
                                    {/* Upload Box Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Animated Hand and File */}
                                    <motion.div
                                        key={animationStep}
                                        initial={{ y: -50, x: 0, opacity: 0 }}
                                        animate={{ 
                                            y: 0, 
                                            x: 0, 
                                            opacity: 1,
                                            transition: { duration: 1, ease: "easeOut" }
                                        }}
                                        className="absolute"
                                    >
                                        {/* File Icon */}
                                        <div className="relative">
                                            <div className="w-10 h-12 sm:w-12 sm:h-16 bg-gradient-to-br from-[#a60054] to-[#211f60] rounded-md sm:rounded-lg shadow-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            {/* Hand emoji below file */}
                                            <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 text-xl sm:text-2xl">
                                                👆
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Instructions */}
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div className="flex items-start gap-2.5 sm:gap-3">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#a60054] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-[10px] sm:text-xs font-bold">1</span>
                                        </div>
                                        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                                            <strong className="text-white">Drop one image at a time</strong> into the upload area
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2.5 sm:gap-3">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#a60054] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-[10px] sm:text-xs font-bold">2</span>
                                        </div>
                                        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                                            Select your <strong className="text-white">print size and quantity</strong>
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2.5 sm:gap-3">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#a60054] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-[10px] sm:text-xs font-bold">3</span>
                                        </div>
                                        <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                                            Click <strong className="text-white">"Add to Order"</strong> and repeat for more designs
                                        </p>
                                    </div>
                                </div>

                                {/* Got It Button */}
                                <motion.button
                                    onClick={onClose}
                                    className="w-full mt-6 sm:mt-8 py-3 sm:py-4 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Got It!
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}