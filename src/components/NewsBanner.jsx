import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGame, useGameDispatch } from '../store/gameStore';

export default function NewsBanner() {
  const { showNews, currentNews, year } = useGame();
  const dispatch = useGameDispatch();
  const bannerRef = useRef(null);

  useEffect(() => {
    if (showNews && bannerRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(bannerRef.current,
        { x: 400, rotation: 5, opacity: 0, scale: 0.9 },
        { x: 0, rotation: -1, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }
      )
      .to(bannerRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(bannerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        delay: 2.5,
        onComplete: () => dispatch({ type: 'HIDE_NEWS' }),
      });
    }
  }, [showNews, currentNews, dispatch]);

  if (!showNews || !currentNews) return null;

  return (
    <div
      ref={bannerRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 80,
        width: 480,
        background: '#f5ead0',
        borderRadius: 4,
        padding: 0,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 3px #8b6914',
        overflow: 'hidden',
      }}
    >
      <div style={{
        background: '#c0392b',
        padding: '6px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 22,
          fontWeight: 900,
          color: '#f5ead0',
          letterSpacing: 4,
        }}>蛇口通讯</span>
        <span style={{
          fontSize: 12,
          color: '#f5ead0cc',
        }}>{year}年</span>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <p style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#1a1510',
          fontFamily: "'Noto Serif SC', serif",
          lineHeight: 1.6,
        }}>
          {currentNews}
        </p>
      </div>

      <div style={{
        borderTop: '1px solid #d4c4a0',
        padding: '4px 20px',
        textAlign: 'right',
      }}>
        <span style={{ fontSize: 10, color: '#8b8070' }}>蛇口工业区管理委员会主办</span>
      </div>
    </div>
  );
}
