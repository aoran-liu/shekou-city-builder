import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import NewspaperOverlay from './NewspaperOverlay';

const INTRO_SUBS = [
  { text: '1978年，十一届三中全会后，中央决定在南方"杀出一条血路来"。', start: 0, end: 2.2 },
  { text: '1979年1月，交通部副部长袁庚受命南下，在广东宝安县一个叫蛇口的渔村，划出2.14平方公里的土地，筹建中国第一个外向型工业区。', start: 2.2, end: 4.2 },
  { text: '这里三面荒山，一面朝海。没有路，没有电，没有一寸平地可以建厂。', start: 4.2, end: 5.5 },
];

export default function BlastMiniGame({ event, onComplete }) {
  const rootRef = useRef(null);
  const [phase, setPhase] = useState('intro');
  const [sub, setSub] = useState('');
  const [progress, setProgress] = useState(0);
  const [introVisible, setIntroVisible] = useState(true);

  const phaseRef = useRef('intro');
  const introVidRef = useRef(null);
  const blastVidRef = useRef(null);
  const afterImgRef = useRef(null);
  const flashRef = useRef(null);
  const countNumRef = useRef(null);
  const progBarRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // === INTRO: play video → bridge ===
  useEffect(() => {
    if (phase !== 'intro') return;

    const v = introVidRef.current;
    if (!v) {
      setIntroVisible(false);
      setPhase('bridge');
      return;
    }

    let cancelled = false;

    const goToBridge = () => {
      if (cancelled) return;
      cancelled = true;
      setSub('');
      gsap.to(v, {
        opacity: 0, duration: 1,
        onComplete: () => {
          setIntroVisible(false);
          setPhase('bridge');
        },
      });
    };

    const onTime = () => {
      if (cancelled) return;
      const t = v.currentTime;
      const found = INTRO_SUBS.find(s => t >= s.start && t < s.end);
      setSub(found ? found.text : '');
    };

    const onEnd = () => goToBridge();
    const onError = () => {
      if (!cancelled) { cancelled = true; setIntroVisible(false); setPhase('bridge'); }
    };

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnd);
    v.addEventListener('error', onError);

    const playPromise = v.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        if (!cancelled) { cancelled = true; setIntroVisible(false); setPhase('bridge'); }
      });
    }

    const fallback = setTimeout(() => goToBridge(), 12000);

    return () => {
      cancelled = true;
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnd);
      v.removeEventListener('error', onError);
      clearTimeout(fallback);
    };
  }, [phase]);

  // === BRIDGE → ready ===
  useEffect(() => {
    if (phase !== 'bridge') return;
    const t = setTimeout(() => setPhase('ready'), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  // === EXPLODING: blast video end → aftermath ===
  useEffect(() => {
    if (phase !== 'exploding') return;
    const v = blastVidRef.current;
    if (!v) { setPhase('aftermath'); return; }

    let done = false;
    const goAftermath = () => {
      if (done) return;
      done = true;
      setPhase('aftermath');
      gsap.to(v, { opacity: 0, duration: 1 });
      if (afterImgRef.current) gsap.to(afterImgRef.current, { opacity: 1, duration: 1.2 });
    };

    v.addEventListener('ended', goAftermath);

    const iv = setInterval(() => {
      if (!v.duration) return;
      const pr = Math.min(100, ((v.currentTime - 2) / (v.duration - 2)) * 100);
      setProgress(Math.round(pr));
      if (progBarRef.current) gsap.set(progBarRef.current, { width: `${pr}%` });
      if (pr >= 100) { clearInterval(iv); goAftermath(); }
    }, 200);

    const fallback = setTimeout(() => goAftermath(), 20000);

    return () => {
      done = true;
      v.removeEventListener('ended', goAftermath);
      clearInterval(iv);
      clearTimeout(fallback);
    };
  }, [phase]);

  // === DETONATE ===
  const handleDetonate = useCallback(() => {
    if (phaseRef.current !== 'ready') return;
    setPhase('countdown');

    const nums = ['三', '二', '一'];
    let step = 0;
    const el = countNumRef.current;

    const next = () => {
      if (step >= nums.length) {
        doExplosion();
        return;
      }
      if (!el) { doExplosion(); return; }
      el.textContent = nums[step];
      gsap.fromTo(el,
        { scale: 2.5, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)',
          onComplete: () => gsap.to(el, {
            opacity: 0, scale: 0.5, duration: 0.3, delay: 0.3,
            onComplete: () => { step++; next(); },
          }),
        }
      );
    };
    next();
  }, []);

  const doExplosion = useCallback(() => {
    setPhase('exploding');

    const fl = flashRef.current;
    if (fl) {
      gsap.to(fl, {
        opacity: 1, duration: 0.1,
        onComplete: () => {
          const v = blastVidRef.current;
          if (v) { v.currentTime = 2; v.play().catch(() => {}); gsap.to(v, { opacity: 1, duration: 0.3, delay: 0.1 }); }
          gsap.to(fl, { opacity: 0, duration: 1, delay: 0.2 });
        },
      });
    }

    const root = rootRef.current;
    if (root) {
      gsap.to(root, {
        x: 'random(-14,14)', y: 'random(-8,8)',
        duration: 0.04, repeat: 20, yoyo: true, ease: 'none',
        onComplete: () => gsap.set(root, { x: 0, y: 0 }),
      });
      for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const c = ['#ff6b35', '#ffa500', '#ff4444', '#ffcc00', '#ff8844', '#8B4513'];
        p.style.background = c[Math.floor(Math.random() * c.length)];
        p.style.left = `${40 + Math.random() * 20}%`;
        p.style.top = `${20 + Math.random() * 30}%`;
        const sz = 6 + Math.random() * 16;
        p.style.width = `${sz}px`; p.style.height = `${sz}px`;
        root.appendChild(p);
        gsap.to(p, {
          x: (Math.random() - 0.5) * 500, y: (Math.random() - 0.5) * 400,
          opacity: 0, scale: 0,
          duration: 1 + Math.random() * 0.8, delay: Math.random() * 0.3,
          ease: 'power2.out', onComplete: () => p.remove(),
        });
      }
    }
  }, []);

  const onNewspaperDone = useCallback(() => {
    gsap.to(rootRef.current, {
      opacity: 0, duration: 1,
      onComplete: () => onComplete(event.onComplete),
    });
  }, [onComplete, event]);

  return (
    <div ref={rootRef} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0806', overflow: 'hidden',
    }}>
      {/* Mountain photo - always behind */}
      <img src="/images/bg-blast-before.png" alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center 30%', pointerEvents: 'none',
      }} />

      {/* Blast video (hidden until explosion) */}
      <video ref={blastVidRef} src="/videos/blast.mp4" playsInline style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', opacity: 0, pointerEvents: 'none',
      }} />

      {/* Aftermath photo */}
      <img ref={afterImgRef} src="/images/bg-blasting.png" alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', opacity: 0, pointerEvents: 'none',
      }} />

      {/* Intro video — ONLY rendered during intro, removed after */}
      {introVisible && (
        <video ref={introVidRef} src="/videos/intro-1979.mp4" playsInline muted style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', pointerEvents: 'none',
        }} />
      )}

      {/* White flash */}
      <div ref={flashRef} style={{
        position: 'absolute', inset: 0, background: '#fff', opacity: 0, pointerEvents: 'none',
      }} />

      {/* Countdown number */}
      <div ref={countNumRef} className="serif" style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
        fontSize: 120, fontWeight: 900, color: '#fff', opacity: 0, pointerEvents: 'none',
        textShadow: '0 0 40px rgba(255,100,0,0.8), 0 0 80px rgba(255,50,0,0.4)',
      }} />

      {/* ── INTRO ── */}
      {phase === 'intro' && sub && (
        <div style={{
          position: 'absolute', bottom: 60, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <p className="serif" style={{
            maxWidth: 700, fontSize: 18, color: '#fff', lineHeight: 1.8, textAlign: 'center',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)', background: 'rgba(0,0,0,0.4)',
            padding: '12px 28px', borderRadius: 6, backdropFilter: 'blur(4px)',
          }}>{sub}</p>
        </div>
      )}

      {/* ── BRIDGE ── */}
      {phase === 'bridge' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse, transparent 40%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '45%', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
            <p className="serif" style={{
              fontSize: 28, color: '#fff', letterSpacing: 6,
              textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.4)',
            }}>一切，要从炸开这座山开始。</p>
          </div>
        </>
      )}

      {/* ── READY ── */}
      {phase === 'ready' && (
        <>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, #000, transparent)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, background: 'linear-gradient(0deg, #000, rgba(0,0,0,0.7) 50%, transparent)' }} />
          </div>

          <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <p className="serif" style={{
              maxWidth: 640, textAlign: 'center', fontSize: 17, color: '#e8dcc8',
              lineHeight: 2, letterSpacing: 1, padding: '0 20px',
              textShadow: '0 1px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)',
            }}>{event.text}</p>
          </div>

          <div style={{
            position: 'absolute', bottom: 30, left: 0, right: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            pointerEvents: 'none',
          }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <div style={{
                position: 'absolute', inset: -6, borderRadius: '50%',
                border: '2px solid rgba(231,76,60,0.4)', animation: 'pulse-red 2s infinite',
              }} />
              <button
                type="button"
                onClick={handleDetonate}
                style={{
                  pointerEvents: 'auto',
                  position: 'relative',
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #e74c3c, #8B0000 70%, #4a0000)',
                  border: '3px solid rgba(255,100,50,0.5)',
                  boxShadow: '0 0 30px rgba(231,76,60,0.5), inset 0 -3px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,200,150,0.3)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Noto Serif SC', serif", fontSize: 16, fontWeight: 700,
                  color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)', letterSpacing: 2,
                }}
              >引爆</button>
            </div>
            <span className="serif" style={{
              fontSize: 13, color: 'rgba(255,200,150,0.7)', letterSpacing: 3,
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>按下起爆器</span>
          </div>
        </>
      )}

      {/* ── COUNTDOWN ── */}
      {phase === 'countdown' && (
        <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          <p className="serif" style={{
            fontSize: 18, color: 'rgba(255,200,100,0.9)', letterSpacing: 4,
            textShadow: '0 0 20px rgba(255,100,0,0.6)',
          }}>准备引爆——</p>
        </div>
      )}

      {/* ── EXPLODING ── */}
      {phase === 'exploding' && (
        <>
          <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
            <p className="serif" style={{
              fontSize: 16, color: 'rgba(255,255,255,0.8)', letterSpacing: 2,
              textShadow: '0 1px 8px rgba(0,0,0,0.9)',
            }}>1979年7月2日，蛇口工业区一声炮响，拉开了改革开放的序幕。</p>
          </div>
          <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            width: 360, pointerEvents: 'none',
          }}>
            <div style={{
              height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5,
              overflow: 'hidden', border: '1px solid rgba(212,168,85,0.3)',
            }}>
              <div ref={progBarRef} style={{
                height: '100%', width: '0%', borderRadius: 5,
                background: 'linear-gradient(90deg, #e74c3c, #f39c12, #d4a855)',
              }} />
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              工程进度 {progress}%
            </p>
          </div>
        </>
      )}

      {/* ── AFTERMATH ── */}
      {phase === 'aftermath' && (
        <NewspaperOverlay onComplete={onNewspaperDone} />
      )}
    </div>
  );
}
