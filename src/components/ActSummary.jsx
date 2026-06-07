import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGame } from '../store/gameStore';
import GaugeBar from './GaugeBar';

export default function ActSummary({ actNumber = 1, summaryData, onNextAct, onRestart }) {
  const containerRef = useRef(null);
  const { stats, history } = useGame();

  const title = summaryData?.title || `第${actNumber}幕总结`;
  const text = summaryData?.text || '';

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    );

    const items = containerRef.current.querySelectorAll('.summary-item');
    gsap.fromTo(items,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 70,
        background: 'rgba(26,21,16,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
      }}
    >
      <div style={{
        width: 500,
        background: 'var(--bg-panel)',
        borderRadius: 16,
        border: '2px solid var(--border-gold)',
        padding: '32px 36px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        margin: '20px 0',
      }}>
        <h2
          className="serif summary-item"
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: 'var(--gold-light)',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {title}
        </h2>

        <p className="summary-item" style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 1.8,
        }}>
          {text}
        </p>

        <div className="summary-item" style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, color: 'var(--gold)', marginBottom: 12, fontWeight: 700 }}>
            当前指标
          </h4>
          {['economy', 'politics', 'support', 'innovation'].map(key => (
            <GaugeBar key={key} statKey={key} value={stats[key]} />
          ))}
        </div>

        <div className="summary-item" style={{ textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center' }}>
          {onNextAct && (
            <button
              onClick={onNextAct}
              style={{
                padding: '12px 36px',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--bg-dark)',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                borderRadius: 8,
                letterSpacing: 2,
                boxShadow: '0 4px 20px rgba(212,168,85,0.4)',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => gsap.to(e.target, { scale: 1.05, duration: 0.2 })}
              onMouseLeave={e => gsap.to(e.target, { scale: 1, duration: 0.2 })}
            >
              进入下一幕 →
            </button>
          )}
          <button
            onClick={onRestart}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'rgba(212,168,85,0.1)',
              borderRadius: 8,
              letterSpacing: 1,
              border: '1px solid var(--border-gold)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => gsap.to(e.target, { scale: 1.05, duration: 0.2 })}
            onMouseLeave={e => gsap.to(e.target, { scale: 1, duration: 0.2 })}
          >
            {onNextAct ? '重新开始' : '第一幕完 · 敬请期待'}
          </button>
        </div>
      </div>
    </div>
  );
}
