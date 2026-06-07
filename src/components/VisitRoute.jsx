import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGameDispatch } from '../store/gameStore';

const LOCATIONS = [
  {
    id: 'port',
    name: '蛇口码头',
    icon: '⚓',
    desc: '万吨巨轮停靠的现代化港口',
    x: '15%', y: '55%',
    effects: { economy: 5, politics: 0, support: 0, innovation: 0 },
  },
  {
    id: 'factory',
    name: '合资工厂',
    icon: '🏭',
    desc: '中外合资的电子元件生产线',
    x: '35%', y: '30%',
    effects: { economy: 3, politics: 0, support: 0, innovation: 5 },
  },
  {
    id: 'housing',
    name: '工人社区',
    icon: '🏠',
    desc: '配套齐全的现代化工人住宅区',
    x: '60%', y: '25%',
    effects: { economy: 0, politics: 0, support: 5, innovation: 0 },
  },
  {
    id: 'school',
    name: '培训中心',
    icon: '📚',
    desc: '全国首创的职业技术培训学校',
    x: '75%', y: '45%',
    effects: { economy: 0, politics: 3, support: 0, innovation: 5 },
  },
  {
    id: 'minghua',
    name: '明华轮',
    icon: '🚢',
    desc: '改造成海上娱乐城的法国邮轮',
    x: '50%', y: '60%',
    effects: { economy: 3, politics: 3, support: 3, innovation: 3 },
  },
];

const MAX_STOPS = 3;

export default function VisitRoute({ event, onComplete }) {
  const containerRef = useRef(null);
  const [selected, setSelected] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const dispatch = useGameDispatch();

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
  }, []);

  const toggleLocation = useCallback((loc) => {
    if (confirmed) return;
    setSelected(prev => {
      if (prev.find(l => l.id === loc.id)) {
        return prev.filter(l => l.id !== loc.id);
      }
      if (prev.length >= MAX_STOPS) return prev;
      return [...prev, loc];
    });
  }, [confirmed]);

  const handleConfirm = useCallback(() => {
    if (selected.length !== MAX_STOPS) return;
    setConfirmed(true);

    const totalEffects = { economy: 0, politics: 0, support: 0, innovation: 0 };
    selected.forEach(loc => {
      Object.entries(loc.effects).forEach(([k, v]) => {
        totalEffects[k] += v;
      });
    });

    if (event?.onComplete) {
      Object.entries(event.onComplete.effects).forEach(([k, v]) => {
        totalEffects[k] += v;
      });
    }

    dispatch({ type: 'APPLY_DECISION', payload: { effects: totalEffects, label: '邓小平视察路线' } });
    if (event?.onComplete?.news) {
      dispatch({ type: 'SHOW_NEWS', payload: event.onComplete.news });
    }

    try {
      const sfx = new Audio('/audio/sfx/stamp.mp3');
      sfx.volume = 0.5;
      sfx.play();
    } catch (_) {}

    selected.forEach((loc, i) => {
      const el = containerRef.current.querySelector(`[data-loc="${loc.id}"]`);
      if (el) {
        gsap.to(el, {
          boxShadow: '0 0 30px rgba(212,168,85,0.6)',
          duration: 0.5, delay: i * 0.8,
        });
      }
    });

    setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0, duration: 0.8,
        onComplete: () => onComplete(event?.onComplete),
      });
    }, 3500);
  }, [selected, confirmed, dispatch, event, onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0a0806',
        overflow: 'hidden',
      }}
    >
      <img
        src={event?.background || '/images/diorama-1984.png'}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.4,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,6,0.5)' }} />

      {/* Title */}
      <div style={{
        position: 'absolute', top: 16, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10, textAlign: 'center',
        background: 'rgba(26,21,16,0.88)',
        borderRadius: 10, padding: '12px 28px',
        border: '1px solid var(--border-gold)',
        backdropFilter: 'blur(10px)',
      }}>
        <h2 className="serif" style={{
          fontSize: 22, color: 'var(--gold-light)',
          marginBottom: 4,
        }}>邓小平视察路线</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          选择 {MAX_STOPS} 个地点带邓小平参观（已选 {selected.length}/{MAX_STOPS}）
        </p>
      </div>

      {/* Location markers */}
      {LOCATIONS.map(loc => {
        const isSelected = selected.find(l => l.id === loc.id);
        const orderNum = selected.findIndex(l => l.id === loc.id) + 1;
        return (
          <div
            key={loc.id}
            data-loc={loc.id}
            onClick={() => toggleLocation(loc)}
            style={{
              position: 'absolute',
              left: loc.x, top: loc.y,
              transform: 'translate(-50%, -50%)',
              width: 140, padding: '16px 12px',
              background: isSelected
                ? 'rgba(212,168,85,0.2)'
                : 'rgba(20,16,10,0.8)',
              border: `2px solid ${isSelected ? 'var(--gold)' : 'rgba(107,85,48,0.4)'}`,
              borderRadius: 12,
              textAlign: 'center',
              cursor: confirmed ? 'default' : 'pointer',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.3s',
              zIndex: 5,
              boxShadow: isSelected ? '0 0 20px rgba(212,168,85,0.3)' : 'none',
            }}
          >
            {isSelected && (
              <div style={{
                position: 'absolute', top: -12, right: -12,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--gold)',
                color: '#1a1510', fontSize: 16, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(212,168,85,0.6)',
              }}>{orderNum}</div>
            )}
            <span style={{ fontSize: 28 }}>{loc.icon}</span>
            <div className="serif" style={{
              fontSize: 15, fontWeight: 700,
              color: isSelected ? 'var(--gold-light)' : 'var(--text-primary)',
              marginTop: 4,
            }}>{loc.name}</div>
            <div style={{
              fontSize: 11, color: 'var(--text-secondary)',
              marginTop: 4, lineHeight: 1.4,
            }}>{loc.desc}</div>
          </div>
        );
      })}

      {/* Route lines between selected locations */}
      {selected.length >= 2 && (
        <svg style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          zIndex: 4, pointerEvents: 'none',
        }}>
          {selected.slice(0, -1).map((loc, i) => {
            const next = selected[i + 1];
            return (
              <line
                key={i}
                x1={loc.x} y1={loc.y}
                x2={next.x} y2={next.y}
                stroke="rgba(212,168,85,0.5)"
                strokeWidth="2"
                strokeDasharray="8,4"
              />
            );
          })}
        </svg>
      )}

      {/* Confirm button */}
      {selected.length === MAX_STOPS && !confirmed && (
        <button
          onClick={handleConfirm}
          style={{
            position: 'absolute', bottom: 28,
            left: '50%', transform: 'translateX(-50%)',
            padding: '14px 44px', fontSize: 18, fontWeight: 700,
            color: 'var(--bg-dark)',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(212,168,85,0.5)',
            zIndex: 30, letterSpacing: 4,
          }}
        >确认路线</button>
      )}

      {/* Result text */}
      {confirmed && (
        <div style={{
          position: 'absolute', bottom: 28,
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 30, textAlign: 'center',
          background: 'rgba(26,21,16,0.9)',
          padding: '16px 32px', borderRadius: 10,
          border: '1px solid var(--border-gold)',
        }}>
          <p className="serif" style={{
            fontSize: 18, color: 'var(--gold-light)',
            letterSpacing: 3,
          }}>
            邓小平同志沿路线参观了蛇口的{selected.map(l => l.name).join('、')}
          </p>
        </div>
      )}
    </div>
  );
}
