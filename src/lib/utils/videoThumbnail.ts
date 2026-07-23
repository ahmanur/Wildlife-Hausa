/**
 * Helper utility to extract a frame from a video file or video URL using HTML5 Canvas.
 */

export function isDirectVideoUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('.mp4') ||
    lower.includes('.webm') ||
    lower.includes('.mov') ||
    lower.includes('.ogg') ||
    lower.includes('firebasestorage.googleapis.com') ||
    lower.includes('blob:')
  );
}

export function extractVideoFrameBlob(source: File | string, seekTime: number = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    let objectUrlToClean: string | null = null;
    if (typeof source === 'string') {
      video.src = source;
    } else {
      objectUrlToClean = URL.createObjectURL(source);
      video.src = objectUrlToClean;
    }

    const cleanup = () => {
      if (objectUrlToClean) {
        URL.revokeObjectURL(objectUrlToClean);
      }
      video.remove();
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Thumbnail generation timed out'));
    }, 15000);

    video.onloadedmetadata = () => {
      const targetTime = Math.min(seekTime, video.duration / 2 || 0.5);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              cleanup();
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create canvas blob'));
              }
            },
            'image/jpeg',
            0.85
          );
        } else {
          cleanup();
          reject(new Error('Failed to get 2d context'));
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = (err) => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error('Failed to load video for frame extraction'));
    };
  });
}
