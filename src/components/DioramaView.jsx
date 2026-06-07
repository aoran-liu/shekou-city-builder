import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function DioramaView({ src = '/images/diorama-1979.png', videoSrc }) {
  const mediaRef = useRef(null);
  const prevSrc = useRef(src);
  const prevVideo = useRef(videoSrc);

  useEffect(() => {
    const changed = prevSrc.current !== src || prevVideo.current !== videoSrc;
    if (changed) {
      gsap.fromTo(mediaRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
      prevSrc.current = src;
      prevVideo.current = videoSrc;
    } else {
      gsap.fromTo(mediaRef.current,
        { opacity: 0, scale: 1.03 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }
      );
    }
  }, [src, videoSrc]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      overflow: 'hidden',
    }}>
      <div ref={mediaRef} style={{ width: '100%', height: '100%' }}>
        {videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
            }}
          />
        ) : (
          <img
            src={src}
            alt="场景背景"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
            }}
          />
        )}
      </div>
      {/* Top gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        background: 'linear-gradient(rgba(26,21,16,0.5), transparent)',
        pointerEvents: 'none',
      }} />
      {/* Bottom gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 140,
        background: 'linear-gradient(transparent, rgba(26,21,16,0.7))',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
