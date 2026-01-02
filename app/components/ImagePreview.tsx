'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
  imageUrl: string;
  fileName: string;
  fileSize: number;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export default function ImagePreview({
  imageUrl,
  fileName,
  fileSize,
  onRemove,
  onClick,
  className = '',
}: ImagePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <motion.div
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Main Image Card */}
        <div className="relative bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-[#a60054]/50">
          {/* Image Container */}
          <div
            className="relative w-full aspect-square cursor-pointer"
            onClick={() => {
              if (onClick) onClick();
              else setShowFullImage(true);
            }}
          >
            <Image
              src={imageUrl}
              alt={fileName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Gradient Overlay on Hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Hover Actions */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center gap-3"
                >
                  {/* View Full Image Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullImage(true);
                    }}
                    className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </motion.button>

                  {/* Remove Button */}
                  {onRemove && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                      }}
                      className="w-12 h-12 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Corner Badge */}
            <motion.div
              className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-[#a60054] to-[#211f60] rounded-lg text-white text-xs font-semibold shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              Image
            </motion.div>
          </div>

          {/* File Info */}
          <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate" title={fileName}>
                  {fileName}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {formatFileSize(fileSize)}
                </p>
              </div>
              
              {/* Success Icon */}
              <motion.div
                className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(166, 0, 84, 0.3) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: isHovered ? ['0% 0%', '100% 100%'] : '0% 0%',
            }}
            transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
          />
        </div>
      </motion.div>

      {/* Full Image Modal */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setShowFullImage(false)}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white transition-all z-10"
              onClick={() => setShowFullImage(false)}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Image Info Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 z-10"
            >
              <p className="text-white font-medium text-sm">{fileName}</p>
              <p className="text-white/60 text-xs mt-1">{formatFileSize(fileSize)}</p>
            </motion.div>

            {/* Full Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-5xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={imageUrl}
                  alt={fileName}
                  width={1200}
                  height={1200}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Download Button */}
            <motion.a
              href={imageUrl}
              download={fileName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-6 right-6 px-6 py-3 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}