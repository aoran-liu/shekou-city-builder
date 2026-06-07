import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';

const STAT_LABELS = {
  economy: { name: '经济', color: '#27ae60' },
  politics: { name: '政治', color: '#2980b9' },
  support: { name: '民心', color: '#d4a020' },
  innovation: { name: '创新', color: '#8e44ad' },
};

export default function ConsequenceOverlay({ choice, onComplete }) {
  const rootRef = useRef(null);
  const textRef = useRef(null);
  const statsRef = useRef(null);
  const btnRef = useRef(null);
  const imgRef = useRef(null);
  const [displayText, setDisplayText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (!choice?.consequence) {
      onComplete?.();
      return;
    }

    gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });

    if (imgRef.current) {
      gsap.fromTo(imgRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: 'power2.out' }
      );
    }

    const full = choice.consequence;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(iv);
        setTyping(false);
        setShowStats(true);
        setTimeout(() => setShowBtn(true), 800);
      }
    }, 35);

    return () => clearInterval(iv);
  }, [choice, onComplete]);

  useEffect(() => {
    if (showStats && statsRef.current) {
      const items = statsRef.current.children;
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.12, ease: 'power2.out' }
      );
    }
  }, [showStats]);

  useEffect(() => {
    if (showBtn && btnRef.current) {
      gsap.fromTo(btnRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [showBtn]);

  const handleSkip = useCallback(() => {
    if (typing) {
      setDisplayText(choice.consequence);
      setTyping(false);
      setShowStats(true);
      setTimeout(() => setShowBtn(true), 300);
    }
  }, [typing, choice]);

  const handleContinue = useCallback(() => {
    gsap.to(rootRef.current, {
      opacity: 0, duration: 0.5,
      onComplete: () => onComplete?.(),
    });
  }, [onComplete]);

  if (!choice?.consequence) return null;

  const effects = choice.effects || {};
  const hasImage = !!choice.historyImage;

  return (
    <div ref={rootRef} style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(10,8,6,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingTop: '15vh',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        display: 'flex', gap: 36, alignItems: 'flex-start',
        maxWidth: hasImage ? '95vw' : '90vw',
        height: hasImage ? '60vh' : 'auto',
        padding: '24px',
      }}>
        {/* Historical photo */}
        {hasImage && (
          <div ref={imgRef} style={{
            flexShrink: 0, width: 560,
            opacity: 0,
          }}>
            <div style={{
              position: 'relative',
              borderRadius: 8, overflow: 'hidden',
              border: '2px solid rgba(212,168,85,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <img
                src={choice.historyImage}
                alt={choice.historyCaption || ''}
                style={{
                  width: '100%', display: 'block',
                  maxHeight: 640, objectFit: 'cover',
                  filter: 'sepia(20%) contrast(1.1)',
                }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(10,8,6,0.9))',
                padding: '24px 14px 10px',
              }}>
                <p style={{
                  fontSize: 12, color: 'rgba(212,168,85,0.8)',
                  lineHeight: 1.5, margin: 0,
                  fontFamily: "'Noto Serif SC', serif",
                }}>{choice.historyCaption}</p>
              </div>
            </div>
            <div style={{
              marginTop: 8, textAlign: 'center',
              fontSize: 11, color: 'rgba(212,168,85,0.4)',
              letterSpacing: 2,
            }}>历史照片</div>
          </div>
        )}

        {/* Text content */}
        <div style={{
          width: hasImage ? 480 : 620,
          maxWidth: '100%',
          padding: hasImage ? '12px 0' : '36px 40px',
          overflowY: 'auto', maxHeight: '85vh',
        }}>
          <div style={{
            fontSize: 13, color: 'var(--gold)', letterSpacing: 3,
            marginBottom: 8, fontFamily: "'Noto Serif SC', serif",
          }}>—— 你的决定 ——</div>

          <h3 className="serif" style={{
            fontSize: 20, color: 'var(--gold-light)', fontWeight: 700,
            marginBottom: 20, paddingBottom: 14,
            borderBottom: '1px solid rgba(212,168,85,0.25)',
          }}>{choice.label}</h3>

          <div
            ref={textRef}
            onClick={handleSkip}
            style={{
              fontSize: 17, lineHeight: 2, color: 'var(--text-primary)',
              fontFamily: "'Noto Serif SC', serif",
              cursor: typing ? 'pointer' : 'default',
              minHeight: 100,
            }}
          >
            {displayText}
            {typing && (
              <span style={{ color: 'var(--gold)', animation: 'pulse-glow 1s infinite' }}>▌</span>
            )}
          </div>

          {showStats && (
            <div ref={statsRef} style={{
              marginTop: 24, paddingTop: 16,
              borderTop: '1px solid rgba(212,168,85,0.2)',
              display: 'flex', flexWrap: 'wrap', gap: 12,
            }}>
              {Object.entries(effects).map(([key, delta]) => {
                if (delta === 0) return null;
                const info = STAT_LABELS[key];
                if (!info) return null;
                const positive = delta > 0;
                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 6,
                    background: positive ? 'rgba(39,174,96,0.12)' : 'rgba(192,57,43,0.12)',
                    border: `1px solid ${positive ? 'rgba(39,174,96,0.3)' : 'rgba(192,57,43,0.3)'}`,
                  }}>
                    <span style={{ fontSize: 13, color: info.color, fontWeight: 600 }}>
                      {info.name}
                    </span>
                    <span style={{
                      fontSize: 15, fontWeight: 700,
                      color: positive ? '#27ae60' : '#c0392b',
                    }}>
                      {positive ? '+' : ''}{delta}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {showBtn && (
            <button
              ref={btnRef}
              onClick={handleContinue}
              style={{
                display: 'block', margin: '28px auto 0',
                padding: '12px 40px', fontSize: 16, fontWeight: 600,
                color: 'var(--bg-dark)', letterSpacing: 3,
                background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: "'Noto Serif SC', serif",
                boxShadow: '0 4px 16px rgba(212,168,85,0.4)',
                opacity: 0,
              }}
              onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
              onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
            >继 续</button>
          )}
        </div>
      </div>
    </div>
  );
}
