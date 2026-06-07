import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGameDispatch } from '../store/gameStore';

gsap.registerPlugin(Draggable);

const SLOGAN_CHARS = '时间就是金钱效率就是生命'.split('');
const SLOT_COUNT = SLOGAN_CHARS.length;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SloganPuzzle({ event, onComplete }) {
  const containerRef = useRef(null);
  const tileRefs = useRef([]);
  const slotRefs = useRef([]);
  const [placed, setPlaced] = useState(new Array(SLOT_COUNT).fill(null));
  const [completed, setCompleted] = useState(false);
  const dispatch = useGameDispatch();

  const shuffledChars = useRef(shuffle(SLOGAN_CHARS.map((ch, i) => ({ ch, correctIndex: i }))));

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });

    tileRefs.current.forEach((tile, i) => {
      if (!tile) return;
      gsap.fromTo(tile,
        { scale: 0, opacity: 0, rotation: Math.random() * 20 - 10 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.4, delay: 0.3 + i * 0.05, ease: 'back.out(2)' }
      );

      Draggable.create(tile, {
        type: 'x,y',
        bounds: containerRef.current,
        zIndexBoost: true,
        onDragEnd: function () {
          let hitSlot = null;
          let hitIdx = -1;
          for (let s = 0; s < SLOT_COUNT; s++) {
            const slotEl = slotRefs.current[s];
            if (slotEl && this.hitTest(slotEl, '40%')) {
              hitSlot = slotEl;
              hitIdx = s;
              break;
            }
          }

          if (hitSlot && !placed[hitIdx]) {
            const slotRect = hitSlot.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const targetX = slotRect.left + slotRect.width / 2 - containerRect.left - tile.offsetLeft - tile.offsetWidth / 2;
            const targetY = slotRect.top + slotRect.height / 2 - containerRect.top - tile.offsetTop - tile.offsetHeight / 2;

            gsap.to(tile, {
              x: targetX, y: targetY,
              duration: 0.25, ease: 'back.out(1.5)',
            });

            const charData = shuffledChars.current[i];
            const isCorrect = charData.correctIndex === hitIdx;

            tile.dataset.slot = hitIdx;
            tile.style.borderColor = isCorrect ? '#4fc3f7' : '#e74c3c';

            setPlaced(prev => {
              const next = [...prev];
              next[hitIdx] = { tileIndex: i, charData };
              return next;
            });

            try {
              const sfx = new Audio('/audio/sfx/coin.mp3');
              sfx.volume = 0.3;
              sfx.play();
            } catch (_) {}
          } else {
            gsap.to(tile, { x: 0, y: 0, duration: 0.4, ease: 'back.out(1.5)' });
            const prevSlot = tile.dataset.slot;
            if (prevSlot !== '' && prevSlot !== undefined) {
              setPlaced(prev => {
                const next = [...prev];
                next[Number(prevSlot)] = null;
                return next;
              });
            }
            tile.dataset.slot = '';
            tile.style.borderColor = 'rgba(212,168,85,0.5)';
          }
        },
      });
    });
  }, []);

  useEffect(() => {
    const allPlaced = placed.every(p => p !== null);
    if (!allPlaced) return;

    const allCorrect = placed.every((p, idx) => p && p.charData.correctIndex === idx);
    if (allCorrect && !completed) {
      setCompleted(true);

      tileRefs.current.forEach(tile => {
        if (tile) {
          tile.style.borderColor = '#4fc3f7';
          gsap.to(tile, {
            boxShadow: '0 0 20px rgba(79,195,247,0.6)',
            duration: 0.5,
          });
        }
      });

      try {
        const sfx = new Audio('/audio/sfx/stamp.mp3');
        sfx.volume = 0.5;
        sfx.play();
      } catch (_) {}

      if (event?.onComplete) {
        dispatch({ type: 'APPLY_DECISION', payload: { effects: event.onComplete.effects, label: '标语拼图' } });
        if (event.onComplete.news) {
          dispatch({ type: 'SHOW_NEWS', payload: event.onComplete.news });
        }
      }

      setTimeout(() => {
        gsap.to(containerRef.current, {
          opacity: 0, duration: 0.8,
          onComplete: () => onComplete(event?.onComplete),
        });
      }, 2000);
    }
  }, [placed, completed, dispatch, event, onComplete]);

  const firstHalf = SLOGAN_CHARS.slice(0, 6);
  const secondHalf = SLOGAN_CHARS.slice(6);

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
          objectFit: 'cover', opacity: 0.3,
        }}
      />

      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,6,0.6)' }} />

      {/* Title */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center', marginBottom: 40,
      }}>
        <h2 className="serif" style={{
          fontSize: 28, color: 'var(--gold-light)',
          letterSpacing: 6, marginBottom: 8,
        }}>竖起标语牌</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          把文字拖到正确的位置，拼出这句改变时代的口号
        </p>
      </div>

      {/* Slots — two rows */}
      <div style={{ position: 'relative', zIndex: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          {firstHalf.map((ch, i) => (
            <div
              key={i}
              ref={el => slotRefs.current[i] = el}
              style={{
                width: 60, height: 60,
                border: '2px dashed rgba(212,168,85,0.4)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: 'rgba(212,168,85,0.2)',
                background: 'rgba(20,16,10,0.6)',
              }}
            >{i + 1}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {secondHalf.map((ch, i) => (
            <div
              key={i + 6}
              ref={el => slotRefs.current[i + 6] = el}
              style={{
                width: 60, height: 60,
                border: '2px dashed rgba(212,168,85,0.4)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: 'rgba(212,168,85,0.2)',
                background: 'rgba(20,16,10,0.6)',
              }}
            >{i + 7}</div>
          ))}
        </div>
      </div>

      {/* Draggable tiles */}
      <div style={{
        position: 'relative', zIndex: 20,
        display: 'flex', flexWrap: 'wrap',
        gap: 10, justifyContent: 'center',
        maxWidth: 500, marginTop: 20,
      }}>
        {shuffledChars.current.map((item, i) => (
          <div
            key={i}
            ref={el => tileRefs.current[i] = el}
            data-slot=""
            style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #2a2118, #1a1510)',
              border: '2px solid rgba(212,168,85,0.5)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700,
              color: 'var(--gold-light)',
              fontFamily: "'Noto Serif SC', serif",
              cursor: 'grab',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              userSelect: 'none',
            }}
          >
            {item.ch}
          </div>
        ))}
      </div>

      {completed && (
        <div style={{
          position: 'relative', zIndex: 10,
          marginTop: 24, textAlign: 'center',
        }}>
          <p className="serif" style={{
            fontSize: 20, color: '#4fc3f7',
            letterSpacing: 4,
            textShadow: '0 0 20px rgba(79,195,247,0.4)',
          }}>时间就是金钱，效率就是生命！</p>
        </div>
      )}
    </div>
  );
}
