import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGameDispatch } from '../store/gameStore';

const CANDIDATES = [
  {
    id: 'reformer',
    name: '张国栋',
    title: '原工程科副科长',
    slogan: '改革到底，效率为先',
    policy: '继续深化计件工资改革，全面推行竞聘上岗',
    color: '#e74c3c',
    effects: { economy: 8, politics: -8, support: 5, innovation: 10 },
    setFlags: ['elected_reformer'],
  },
  {
    id: 'moderate',
    name: '陈慧芳',
    title: '工会副主席',
    slogan: '稳中求进，关心民生',
    policy: '平衡发展效率与工人福利，建设和谐社区',
    color: '#27ae60',
    effects: { economy: 3, politics: 5, support: 12, innovation: 3 },
    setFlags: ['elected_moderate'],
  },
  {
    id: 'conservative',
    name: '刘德明',
    title: '党委组织科科长',
    slogan: '坚持原则，规范管理',
    policy: '加强党的领导，确保改革不偏航',
    color: '#2980b9',
    effects: { economy: -3, politics: 12, support: 3, innovation: -3 },
    setFlags: ['elected_conservative'],
  },
];

export default function ElectionGame({ event, onComplete }) {
  const containerRef = useRef(null);
  const [phase, setPhase] = useState('voting');
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const dispatch = useGameDispatch();

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });

    const cards = containerRef.current.querySelectorAll('.candidate-card');
    gsap.fromTo(cards,
      { opacity: 0, y: 40, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, delay: 0.3, ease: 'back.out(1.5)' }
    );
  }, []);

  const handleVote = useCallback((candidate) => {
    if (phase !== 'voting') return;
    setSelected(candidate);
    setPhase('confirming');
  }, [phase]);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    setPhase('counting');

    setTimeout(() => {
      setShowResult(true);

      dispatch({ type: 'APPLY_DECISION', payload: { effects: selected.effects, label: `选举${selected.name}` } });
      if (selected.setFlags) {
        dispatch({ type: 'SET_FLAGS', payload: selected.setFlags });
      }

      if (event?.onComplete) {
        dispatch({ type: 'APPLY_DECISION', payload: { effects: event.onComplete.effects, label: '民主选举' } });
        if (event.onComplete.news) {
          dispatch({ type: 'SHOW_NEWS', payload: event.onComplete.news });
        }
      }

      try {
        const sfx = new Audio('/audio/sfx/stamp.mp3');
        sfx.volume = 0.5;
        sfx.play();
      } catch (_) {}

      setTimeout(() => {
        gsap.to(containerRef.current, {
          opacity: 0, duration: 0.8,
          onComplete: () => onComplete(event?.onComplete),
        });
      }, 3000);
    }, 2000);
  }, [selected, dispatch, event, onComplete]);

  const handleCancel = useCallback(() => {
    setSelected(null);
    setPhase('voting');
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0a0806',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={event?.background || '/images/bg-factory.png'}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.25,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,6,0.7)' }} />

      {/* Title */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center', marginBottom: 36,
      }}>
        <h2 className="serif" style={{
          fontSize: 28, color: 'var(--gold-light)',
          letterSpacing: 6, marginBottom: 8,
        }}>蛇口民主选举</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          {phase === 'voting' ? '选择你支持的候选人' :
           phase === 'confirming' ? '确认你的投票' :
           phase === 'counting' && !showResult ? '正在计票...' :
           '选举结果'}
        </p>
      </div>

      {/* Candidate cards */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', gap: 24, flexWrap: 'wrap',
        justifyContent: 'center', maxWidth: 900,
      }}>
        {CANDIDATES.map(c => {
          const isSelected = selected?.id === c.id;
          const dimmed = selected && !isSelected && phase !== 'voting';
          return (
            <div
              key={c.id}
              className="candidate-card"
              onClick={() => phase === 'voting' && handleVote(c)}
              style={{
                width: 240, padding: '24px 20px',
                background: isSelected
                  ? `linear-gradient(135deg, ${c.color}22, ${c.color}11)`
                  : 'rgba(26,21,16,0.9)',
                border: `2px solid ${isSelected ? c.color : 'rgba(107,85,48,0.4)'}`,
                borderRadius: 12,
                textAlign: 'center',
                cursor: phase === 'voting' ? 'pointer' : 'default',
                opacity: dimmed ? 0.4 : 1,
                transition: 'all 0.3s',
                boxShadow: isSelected ? `0 0 30px ${c.color}33` : 'none',
              }}
            >
              <div style={{
                width: 64, height: 64, margin: '0 auto 12px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${c.color}44, ${c.color}22)`,
                border: `2px solid ${c.color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: c.color,
              }}>
                {c.name[0]}
              </div>

              <h3 className="serif" style={{
                fontSize: 20, color: 'var(--gold-light)',
                marginBottom: 4,
              }}>{c.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {c.title}
              </p>
              <p className="serif" style={{
                fontSize: 15, color: c.color,
                marginBottom: 8, fontWeight: 600,
              }}>"{c.slogan}"</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {c.policy}
              </p>

              {isSelected && phase === 'confirming' && (
                <div style={{
                  marginTop: 12, padding: '6px 16px',
                  background: c.color, color: '#fff',
                  borderRadius: 20, fontSize: 13, fontWeight: 600,
                }}>✓ 已选择</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm / Cancel buttons */}
      {phase === 'confirming' && (
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', gap: 16, marginTop: 28,
        }}>
          <button
            onClick={handleConfirm}
            style={{
              padding: '12px 36px', fontSize: 16, fontWeight: 700,
              color: 'var(--bg-dark)',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              letterSpacing: 3,
            }}
          >确认投票</button>
          <button
            onClick={handleCancel}
            style={{
              padding: '12px 24px', fontSize: 14,
              color: 'var(--text-secondary)',
              background: 'rgba(212,168,85,0.1)',
              borderRadius: 8, border: '1px solid var(--border-gold)',
              cursor: 'pointer',
            }}
          >重新选择</button>
        </div>
      )}

      {/* Counting animation */}
      {phase === 'counting' && !showResult && (
        <div style={{
          position: 'relative', zIndex: 10,
          marginTop: 28, textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, margin: '0 auto',
            border: '3px solid rgba(212,168,85,0.3)',
            borderTopColor: 'var(--gold)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 12 }}>
            工人们正在投票...
          </p>
        </div>
      )}

      {/* Result */}
      {showResult && selected && (
        <div style={{
          position: 'relative', zIndex: 10,
          marginTop: 28, textAlign: 'center',
          padding: '20px 36px',
          background: 'rgba(26,21,16,0.9)',
          border: `2px solid ${selected.color}`,
          borderRadius: 12,
        }}>
          <p className="serif" style={{
            fontSize: 22, color: selected.color,
            letterSpacing: 4,
          }}>
            {selected.name} 当选！
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
            蛇口的工人们用手中的选票，选出了自己的管理者。
          </p>
        </div>
      )}
    </div>
  );
}
