import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGame } from '../store/gameStore';
import GaugeBar from './GaugeBar';

const TONE_STYLES = {
  triumph: { accent: '#d4a855', bg: 'linear-gradient(180deg, #2a2118 0%, #1a1510 60%, #0f0c08 100%)' },
  bittersweet: { accent: '#c0913a', bg: 'linear-gradient(180deg, #2a2018 0%, #1a1210 60%, #0f0a06 100%)' },
  reflective: { accent: '#8a9bae', bg: 'linear-gradient(180deg, #1a2028 0%, #101518 60%, #080a0f 100%)' },
  warm: { accent: '#d4a040', bg: 'linear-gradient(180deg, #28221a 0%, #1a1610 60%, #0f0c08 100%)' },
  tragic: { accent: '#8b4a4a', bg: 'linear-gradient(180deg, #201818 0%, #181010 60%, #0f0808 100%)' },
};

export default function EndingScreen({ ending, onRestart }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const { stats, flags } = useGame();
  const [displayText, setDisplayText] = useState('');
  const [showFull, setShowFull] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const style = TONE_STYLES[ending?.tone] || TONE_STYLES.triumph;

  useEffect(() => {
    if (!ending) return;

    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: 'power2.inOut' }
    );

    if (imgRef.current) {
      gsap.fromTo(imgRef.current,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 1.2, delay: 0.5, ease: 'power2.out' }
      );
    }

    const full = ending.text;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(iv);
        setShowFull(true);
        setTimeout(() => setShowStats(true), 800);
      }
    }, 40);

    return () => clearInterval(iv);
  }, [ending]);

  const handleSkip = () => {
    if (!showFull) {
      setDisplayText(ending.text);
      setShowFull(true);
      setTimeout(() => setShowStats(true), 300);
    }
  };

  if (!ending) return null;

  const boldCount = flags.filter(f => f === 'yuan_bold' || f === 'fought_for_reform' || f === 'defended_market_values' || f === 'erected_slogan').length;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: style.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
      }}
    >
      <div style={{
        display: 'flex',
        gap: 40,
        maxWidth: '90vw',
        padding: '24px',
        alignItems: 'flex-start',
      }}>
        {ending.historyImage && (
          <div ref={imgRef} style={{
            flexShrink: 0,
            width: 480,
            opacity: 0,
          }}>
            <div style={{
              borderRadius: 8,
              overflow: 'hidden',
              border: `2px solid ${style.accent}40`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.6)`,
            }}>
              <img
                src={ending.historyImage}
                alt=""
                style={{
                  width: '100%',
                  display: 'block',
                  maxHeight: 500,
                  objectFit: 'cover',
                }}
              />
              {ending.historyCaption && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(10,8,6,0.9)',
                  fontSize: 12,
                  color: `${style.accent}cc`,
                  lineHeight: 1.5,
                  fontFamily: "'Noto Serif SC', serif",
                }}>{ending.historyCaption}</div>
              )}
            </div>
          </div>
        )}

        <div style={{
          flex: 1,
          maxWidth: 560,
        }}>
          <div style={{
            fontSize: 13,
            color: style.accent,
            letterSpacing: 4,
            marginBottom: 8,
            fontFamily: "'Noto Serif SC', serif",
          }}>—— 结 局 ——</div>

          <h2 className="serif" style={{
            fontSize: 36,
            fontWeight: 900,
            color: style.accent,
            marginBottom: 4,
          }}>{ending.title}</h2>

          <div style={{
            fontSize: 16,
            color: `${style.accent}99`,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: `1px solid ${style.accent}30`,
            fontFamily: "'Noto Serif SC', serif",
          }}>{ending.subtitle}</div>

          <div
            onClick={handleSkip}
            style={{
              fontSize: 16,
              lineHeight: 2,
              color: 'var(--text-primary)',
              fontFamily: "'Noto Serif SC', serif",
              whiteSpace: 'pre-wrap',
              cursor: showFull ? 'default' : 'pointer',
              minHeight: 120,
            }}
          >
            {displayText}
            {!showFull && (
              <span style={{ color: style.accent, animation: 'pulse-glow 1s infinite' }}>▌</span>
            )}
          </div>

          {showStats && (
            <>
              <div style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: `1px solid ${style.accent}30`,
              }}>
                <h4 style={{
                  fontSize: 14,
                  color: style.accent,
                  marginBottom: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}>最终指标</h4>
                {['economy', 'politics', 'support', 'innovation'].map(key => (
                  <GaugeBar key={key} statKey={key} value={stats[key]} />
                ))}
              </div>

              <div style={{
                marginTop: 20,
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
              }}>
                <span style={{ color: style.accent, fontWeight: 600 }}>改革魄力：</span>
                {boldCount >= 4 ? '锐意进取——袁庚式的冒险家'
                  : boldCount >= 2 ? '积极稳健——改革中寻求平衡'
                    : '谨慎保守——安全第一'}
              </div>

              <div style={{
                marginTop: 28,
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
              }}>
                <button
                  onClick={onRestart}
                  style={{
                    padding: '14px 40px',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--bg-dark)',
                    background: `linear-gradient(135deg, ${style.accent}, ${style.accent}dd)`,
                    borderRadius: 8,
                    letterSpacing: 3,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Noto Serif SC', serif",
                    boxShadow: `0 4px 20px ${style.accent}50`,
                  }}
                  onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
                  onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
                >重新开始</button>
              </div>

              <div style={{
                marginTop: 24,
                textAlign: 'center',
                fontSize: 12,
                color: 'var(--text-secondary)',
                opacity: 0.6,
                lineHeight: 1.8,
              }}>
                蛇口造城记 · 基于蛇口改革开放真实历史<br />
                "时间就是金钱，效率就是生命" —— 袁庚，1981
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
