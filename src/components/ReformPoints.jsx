import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGameDispatch } from '../store/gameStore';

gsap.registerPlugin(Draggable);

const ZONES = [
  {
    id: 'port', label: '港口区', icon: '⚓', color: '#4fc3f7',
    x: '18%', y: '50%',
    effect: '经济 +5',
    desc: '修建码头泊位',
  },
  {
    id: 'industry', label: '工业区', icon: '🏭', color: '#ffb74d',
    x: '42%', y: '22%',
    effect: '创新 +5',
    desc: '开办来料加工厂',
  },
  {
    id: 'housing', label: '住宅区', icon: '🏠', color: '#81c784',
    x: '72%', y: '28%',
    effect: '民心 +5',
    desc: '兴建工人宿舍',
  },
  {
    id: 'commerce', label: '商业区', icon: '🏪', color: '#ce93d8',
    x: '52%', y: '58%',
    effect: '经济 +3 · 政治 +2',
    desc: '建设商贸中心',
  },
];

const TOTAL_POINTS = 4;

export default function ReformPoints({ onComplete }) {
  const containerRef = useRef(null);
  const ballRefs = useRef([]);
  const zoneRefs = useRef({});
  const [allocation, setAllocation] = useState({ port: 0, industry: 0, housing: 0, commerce: 0 });
  const [placed, setPlaced] = useState(0);
  const dispatch = useGameDispatch();

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6 }
    );

    ballRefs.current.forEach((ball, i) => {
      if (!ball) return;
      gsap.fromTo(ball,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, delay: 0.3 + i * 0.1, ease: 'back.out(2)' }
      );

      Draggable.create(ball, {
        type: 'x,y',
        bounds: containerRef.current,
        onDragEnd: function() {
          let hitZone = null;
          for (const zone of ZONES) {
            const zoneEl = zoneRefs.current[zone.id];
            if (zoneEl && this.hitTest(zoneEl, '30%')) {
              hitZone = zone;
              break;
            }
          }

          if (hitZone) {
            const zoneEl = zoneRefs.current[hitZone.id];
            const zoneRect = zoneEl.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const targetX = zoneRect.left + zoneRect.width / 2 - containerRect.left - ball.offsetLeft - ball.offsetWidth / 2;
            const targetY = zoneRect.top + zoneRect.height / 2 - containerRect.top - ball.offsetTop - ball.offsetHeight / 2;

            gsap.to(ball, {
              x: targetX,
              y: targetY,
              scale: 0.5,
              opacity: 0.3,
              duration: 0.3,
              ease: 'elastic.out(1, 0.5)',
            });

            gsap.to(zoneEl, {
              borderColor: hitZone.color,
              boxShadow: `0 0 30px ${hitZone.color}55, inset 0 0 40px ${hitZone.color}22`,
              duration: 0.3,
            });

            ball.dataset.zone = hitZone.id;

            try {
              const sfx = new Audio('/audio/sfx/coin.mp3');
              sfx.volume = 0.4;
              sfx.play();
            } catch (_) {}

            recountAllocation();
          } else {
            gsap.to(ball, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' });
            ball.dataset.zone = '';
            recountAllocation();
          }
        },
      });
    });
  }, []);

  const recountAllocation = useCallback(() => {
    const counts = { port: 0, industry: 0, housing: 0, commerce: 0 };
    let total = 0;
    ballRefs.current.forEach(ball => {
      if (ball?.dataset.zone) {
        counts[ball.dataset.zone]++;
        total++;
      }
    });
    setAllocation(counts);
    setPlaced(total);
  }, []);

  const handleConfirm = () => {
    dispatch({ type: 'SET_REFORM_POINTS', payload: allocation });

    const effects = { economy: 0, politics: 0, support: 0, innovation: 0 };
    effects.economy += allocation.port * 5 + allocation.commerce * 3;
    effects.innovation += allocation.industry * 5;
    effects.support += allocation.housing * 5;
    effects.politics += allocation.commerce * 2;

    dispatch({ type: 'APPLY_DECISION', payload: { effects, label: '改革点数分配' } });

    try {
      const sfx = new Audio('/audio/sfx/stamp.mp3');
      sfx.volume = 0.5;
      sfx.play();
    } catch (_) {}

    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => onComplete(allocation),
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
      }}
    >
      <img
        src="/images/diorama-1979.png"
        alt="改革规划"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(26,21,16,0.3)',
      }} />

      {/* Title bar */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(26,21,16,0.88)',
        borderRadius: 10,
        padding: '12px 28px',
        border: '1px solid var(--border-gold)',
        textAlign: 'center',
        zIndex: 10,
        backdropFilter: 'blur(10px)',
      }}>
        <h3 className="serif" style={{ fontSize: 22, color: 'var(--gold-light)', marginBottom: 4 }}>
          改革规划
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          拖动改革点到目标区域，决定蛇口的发展方向（{placed}/{TOTAL_POINTS}）
        </p>
      </div>

      {/* Drop zones with effect labels */}
      {ZONES.map(zone => (
        <div
          key={zone.id}
          ref={el => zoneRefs.current[zone.id] = el}
          style={{
            position: 'absolute',
            left: zone.x,
            top: zone.y,
            width: 140,
            height: 130,
            transform: 'translate(-50%, -50%)',
            border: `2px dashed ${allocation[zone.id] > 0 ? zone.color : zone.color + '77'}`,
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(20,16,10,0.75)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.3s',
            gap: 2,
          }}
        >
          <span style={{ fontSize: 24 }}>{zone.icon}</span>
          <span style={{
            fontSize: 16,
            fontWeight: 700,
            color: zone.color,
            fontFamily: "'Noto Serif SC', serif",
            textShadow: `0 0 10px ${zone.color}44`,
          }}>{zone.label}</span>

          {/* Effect label — always visible */}
          <span style={{
            fontSize: 12,
            color: zone.color,
            opacity: 0.8,
            marginTop: 2,
          }}>{zone.effect}</span>
          <span style={{
            fontSize: 11,
            color: 'var(--text-secondary)',
          }}>{zone.desc}</span>

          {/* Count badge */}
          {allocation[zone.id] > 0 && (
            <div style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: zone.color,
              color: '#1a1510',
              fontSize: 16,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 12px ${zone.color}88`,
            }}>{allocation[zone.id]}</div>
          )}
        </div>
      ))}

      {/* Draggable reform coins */}
      <div style={{
        position: 'absolute',
        bottom: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 20,
        zIndex: 20,
      }}>
        {Array.from({ length: TOTAL_POINTS }).map((_, i) => (
          <div
            key={i}
            ref={el => ballRefs.current[i] = el}
            data-zone=""
            style={{
              width: 56,
              height: 56,
              cursor: 'grab',
              zIndex: 25,
              filter: 'drop-shadow(0 4px 10px rgba(212,168,85,0.6))',
            }}
          >
            <img
              src="/images/icon-reform-point.png"
              alt="改革点"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* Confirm button */}
      {placed === TOTAL_POINTS && (
        <button
          onClick={handleConfirm}
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '14px 44px',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--bg-dark)',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(212,168,85,0.5)',
            zIndex: 30,
            letterSpacing: 4,
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={e => gsap.to(e.target, { scale: 1.05, duration: 0.2 })}
          onMouseLeave={e => gsap.to(e.target, { scale: 1, duration: 0.2 })}
        >
          确认分配
        </button>
      )}
    </div>
  );
}
