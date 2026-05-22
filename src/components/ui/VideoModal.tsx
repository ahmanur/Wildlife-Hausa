"use client";

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  videoUrl: string | null;
  onClose: () => void;
}

export function VideoModal({ videoUrl, onClose }: VideoModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!videoUrl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Lock scroll on background
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [videoUrl, onClose]);

  if (!videoUrl) return null;

  // Helper to parse YouTube and Vimeo URLs
  const getEmbedInfo = (url: string) => {
    let embedUrl = '';
    let isEmbed = false;

    // YouTube
    const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const ytMatch = url.match(ytReg);
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
      isEmbed = true;
      return { isEmbed, embedUrl };
    }

    // Vimeo
    const vimeoReg = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i;
    const vimeoMatch = url.match(vimeoReg);
    if (vimeoMatch && vimeoMatch[3]) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1&dnt=1`;
      isEmbed = true;
      return { isEmbed, embedUrl };
    }

    // Embed links that are already direct embeds
    if (url.includes('/embed/') || url.includes('player.vimeo.com/video/')) {
      embedUrl = url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
      isEmbed = true;
      return { isEmbed, embedUrl };
    }

    return { isEmbed: false, embedUrl: url };
  };

  const { isEmbed, embedUrl } = getEmbedInfo(videoUrl);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-10 transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-video flex items-center justify-center"
      >
        {/* Close Button with premium micro-animations */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 bg-black/40 hover:bg-wild-sunset text-white hover:text-white rounded-full backdrop-blur-md border border-white/10 hover:border-transparent transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 group"
          aria-label="Close video player"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Video Display Layer */}
        <div className="w-full h-full">
          {isEmbed ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              title="Wildlife Hausa Film Player"
            />
          ) : (
            <video
              src={embedUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
