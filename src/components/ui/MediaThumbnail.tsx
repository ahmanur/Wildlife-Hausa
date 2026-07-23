'use client';

import React from 'react';
import Image from 'next/image';
import { Film } from 'lucide-react';
import { isDirectVideoUrl } from '@/lib/utils/videoThumbnail';

interface MediaThumbnailProps {
  image?: string;
  videoUrl?: string;
  alt: string;
  className?: string;
  fill?: boolean;
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  const watchBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (watchBeMatch) return watchBeMatch[1];
  const watchUrlMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchUrlMatch) return watchUrlMatch[1];
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

function getVimeoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : null;
}

export function MediaThumbnail({ image, videoUrl, alt, className = 'w-full h-full object-cover', fill = false }: MediaThumbnailProps) {
  // 1. If explicit thumbnail image URL exists
  if (image && image.trim() !== '') {
    if (fill) {
      return <Image src={image} alt={alt} fill className={className} />;
    }
    return <img src={image} alt={alt} className={className} />;
  }

  // 2. YouTube Thumbnail
  const ytId = getYouTubeId(videoUrl);
  if (ytId) {
    const ytThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    if (fill) {
      return <Image src={ytThumb} alt={alt} fill className={className} />;
    }
    return <img src={ytThumb} alt={alt} className={className} />;
  }

  // 3. Vimeo Thumbnail
  const vimeoId = getVimeoId(videoUrl);
  if (vimeoId) {
    const vimeoThumb = `https://vumbnail.com/${vimeoId}.jpg`;
    if (fill) {
      return <Image src={vimeoThumb} alt={alt} fill className={className} />;
    }
    return <img src={vimeoThumb} alt={alt} className={className} />;
  }

  // 4. Direct Video File (Firebase Storage, .mp4, etc.) -> Use video poster frame at #t=0.5
  if (videoUrl && isDirectVideoUrl(videoUrl)) {
    return (
      <video
        src={`${videoUrl}#t=0.5`}
        preload="metadata"
        muted
        playsInline
        className={className}
      />
    );
  }

  // 5. Fallback Placeholder Icon
  return (
    <div className="w-full h-full bg-wild-forest/30 flex items-center justify-center text-wild-sand/50">
      <Film size={24} />
    </div>
  );
}
