'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface FilePreviewProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: 'image' | 'pdf';
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export default function FilePreview({
  fileUrl,
  fileName,
  fileSize,
  fileType,
  onRemove,
  onClick,
  className = '',
}: FilePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullView, setShowFullView] = useState(false);

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
        {/* Main File Card */}
        <div className="relative bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-[#a60054]/50">
          {/* File Container */}
          <div
            className="relative w-full aspect-square cursor-pointer"
            onClick={() => {
              if (onClick) onClick();
              else setShowFullView(true);
            }}
          >
            {fileType === 'image' ? (
              <Image
                src={fileUrl}
                alt={fileName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/10">
                <div className="text-center p-2 sm:p-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto text-red-400 mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white font-semibold text-xs sm:text-sm">PDF Document</p>
                  <p className="text-white/60 text-xs mt-1 hidden sm:block">Click to view</p>
                </div>
              </div>
            )}

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
                  className="absolute inset-0 flex items-center justify-center gap-2 sm:gap-3"
                >
                  {/* View Full Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullView(true);
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg sm:rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-lg sm:rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Corner Badge */}
            <motion.div
              className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-white text-xs font-semibold shadow-lg ${
                fileType === 'pdf' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-[#a60054] to-[#211f60]'
              }`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {fileType === 'pdf' ? 'PDF' : 'Image'}
            </motion.div>
          </div>

          {/* File Info */}
          <div className="p-3 sm:p-4 bg-gradient-to-b from-transparent to-black/20">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-xs sm:text-sm truncate" title={fileName}>
                  {fileName}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {formatFileSize(fileSize)}
                </p>
              </div>
              
              {/* Success Icon */}
              <motion.div
                className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
            style={{
              background: fileType === 'pdf' 
                ? 'linear-gradient(45deg, transparent 30%, rgba(239, 68, 68, 0.3) 50%, transparent 70%)'
                : 'linear-gradient(45deg, transparent 30%, rgba(166, 0, 84, 0.3) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: isHovered ? ['0% 0%', '100% 100%'] : '0% 0%',
            }}
            transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
          />
        </div>
      </motion.div>

      {/* Full View Modal */}
      <AnimatePresence>
        {showFullView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setShowFullView(false)}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl flex items-center justify-center text-white transition-all z-10"
              onClick={() => setShowFullView(false)}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* File Info Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 z-10 max-w-[calc(100%-6rem)] sm:max-w-none"
            >
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-semibold ${
                  fileType === 'pdf' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {fileType.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-white font-medium text-xs sm:text-sm truncate">{fileName}</p>
                  <p className="text-white/60 text-xs hidden sm:block">{formatFileSize(fileSize)}</p>
                </div>
              </div>
            </motion.div>

            {/* Full Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-6xl w-full h-[70vh] sm:h-[85vh] mt-16 sm:mt-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                {fileType === 'image' ? (
                  <Image
                    src={fileUrl}
                    alt={fileName}
                    fill
                    className="object-contain p-2 sm:p-4"
                    priority
                  />
                ) : (
                  <iframe
                    src={fileUrl}
                    className="w-full h-full rounded-xl sm:rounded-2xl"
                    title={fileName}
                  />
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3 z-10"
            >
              {/* Download Button */}
              <motion.a
                href={fileUrl}
                download={fileName}
                className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </motion.a>

              {/* Open in New Tab (for PDFs) */}
              {fileType === 'pdf' && (
                <motion.a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="hidden sm:inline">Open in New Tab</span>
                  <span className="sm:hidden">Open</span>
                </motion.a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}