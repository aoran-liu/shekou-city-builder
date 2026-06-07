import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGameDispatch } from '../store/gameStore';

export default function CoverScreen() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const btnRef = useRef(null);
  const dispatch = useGameDispatch();

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2 })
      .fromTo(titleRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )
      .fromTo(btnRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.1'
      );
  }, []);

  const handleStart = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -60,
      duration: 0.8,
      ease: 'power3.in',
      onComplete: () => dispatch({ type: 'SET_PHASE', payload: 'event' }),
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
      }}
    >
      <img
        src="/images/cover.png"
        alt="cover"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.7,
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <h1
          ref={titleRef}
          className="serif"
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: 'var(--gold-light)',
            textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(212,168,85,0.3)',
            letterSpacing: 8,
            marginBottom: 12,
          }}
        >
          蛇口造城记
        </h1>

        <p
          ref={subtitleRef}
          style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            letterSpacing: 6,
            marginBottom: 48,
          }}
        >
          1979 · 中国 · 蛇口
        </p>

        <button
          ref={btnRef}
          onClick={handleStart}
          style={{
            padding: '14px 48px',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--bg-dark)',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            borderRadius: 8,
            letterSpacing: 4,
            boxShadow: '0 4px 20px rgba(212,168,85,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            gsap.to(e.target, { scale: 1.05, boxShadow: '0 6px 30px rgba(212,168,85,0.6)', duration: 0.2 });
          }}
          onMouseLeave={e => {
            gsap.to(e.target, { scale: 1, boxShadow: '0 4px 20px rgba(212,168,85,0.4)', duration: 0.2 });
          }}
        >
          开始建设
        </button>
      </div>
    </div>
  );
}
