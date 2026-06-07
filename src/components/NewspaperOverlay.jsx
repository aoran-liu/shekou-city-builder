import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function NewspaperOverlay({ onComplete }) {
  const paperRef = useRef(null);
  const mastheadRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const divider1Ref = useRef(null);
  const body1Ref = useRef(null);
  const body2Ref = useRef(null);
  const divider2Ref = useRef(null);
  const bulletRefs = useRef([]);
  const divider3Ref = useRef(null);
  const editorialRef = useRef(null);
  const editorialSubRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(paperRef.current,
      { opacity: 0, y: 100, scale: 0.85, rotation: 3 },
      { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1, ease: 'power3.out' }
    );

    tl.fromTo(mastheadRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );

    const headlineText = '开山填海第一炮';
    const headlineEl = headlineRef.current;
    if (headlineEl) {
      headlineEl.textContent = '';
      tl.fromTo(headlineEl, { opacity: 0 }, { opacity: 1, duration: 0.1 });
      headlineText.split('').forEach((char) => {
        tl.call(() => { headlineEl.textContent += char; }, null, '>+0.09');
      });
      tl.fromTo(headlineEl, { scale: 1.04 }, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }

    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '+=0.15'
    );

    tl.fromTo(divider1Ref.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.4, ease: 'power2.inOut' },
      '+=0.1'
    );

    tl.fromTo(body1Ref.current,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      '+=0.1'
    );
    tl.fromTo(body2Ref.current,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      '+=0.1'
    );

    tl.fromTo(divider2Ref.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.4, ease: 'power2.inOut' },
      '+=0.1'
    );

    tl.fromTo(bulletRefs.current,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.15, ease: 'power2.out' },
      '+=0.05'
    );

    tl.fromTo(divider3Ref.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.4, ease: 'power2.inOut' },
      '+=0.15'
    );

    const editorialText = '山路炸开了，工棚里有人喊：留下来试试。';
    const editorialEl = editorialRef.current;
    if (editorialEl) {
      editorialEl.textContent = '';
      tl.fromTo(editorialEl, { opacity: 0 }, { opacity: 1, duration: 0.1 }, '+=0.2');
      editorialText.split('').forEach((char) => {
        tl.call(() => { editorialEl.textContent += char; }, null, '>+0.065');
      });
    }

    tl.fromTo(editorialSubRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: 'power1.inOut' },
      '+=0.3'
    );

    tl.fromTo(footerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.5'
    );

    tl.to(paperRef.current, {
      opacity: 0, y: -50, scale: 0.96,
      duration: 0.8, ease: 'power2.inOut', delay: 3.5,
      onComplete: () => onComplete?.(),
    });

    return () => tl.kill();
  }, [onComplete]);

  const dividerStyle = {
    width: '100%',
    height: 1,
    background: 'linear-gradient(90deg, transparent, #8b7355, #5a4a35, #8b7355, transparent)',
    margin: '14px 0',
    transformOrigin: 'center',
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 30, background: 'rgba(10,8,6,0.5)', pointerEvents: 'none',
    }}>
      <div ref={paperRef} style={{
        width: 520, maxHeight: '85vh', overflowY: 'auto',
        background: 'linear-gradient(170deg, #f5e6c8 0%, #e8d4a8 30%, #f0dbb8 60%, #e5d0a0 100%)',
        borderRadius: 4, position: 'relative', opacity: 0,
        boxShadow: '0 12px 50px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 4, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(139,115,85,0.06) 28px, rgba(139,115,85,0.06) 29px)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 4, pointerEvents: 'none',
          boxShadow: 'inset 0 0 40px rgba(100,80,50,0.15)',
        }} />

        <div ref={mastheadRef} style={{
          borderBottom: '3px double #8b7355', padding: '20px 32px 14px',
          textAlign: 'center', position: 'relative', opacity: 0,
        }}>
          <div style={{
            fontSize: 12, color: '#c0392b', letterSpacing: 2, marginBottom: 6,
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>★ 内部通讯 ★</div>
          <h1 style={{
            fontSize: 32, fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif",
            color: '#8b1a1a', letterSpacing: 12, margin: '0 0 6px', fontWeight: 400,
          }}>蛇口通讯</h1>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 12, color: '#6b5a45', fontFamily: "'Noto Serif SC', serif", padding: '0 8px',
          }}>
            <span>创刊号</span>
            <span>一九七九年七月八日</span>
            <span>第一版</span>
          </div>
        </div>

        <div style={{ padding: '16px 32px 28px', position: 'relative' }}>
          <p ref={headlineRef} style={{
            fontSize: 36, fontWeight: 900, fontFamily: "'Noto Serif SC', serif",
            color: '#1a1008', letterSpacing: 8, textAlign: 'center',
            lineHeight: 1.6, margin: '8px 0 4px', opacity: 0,
          }} />

          <p ref={subtitleRef} style={{
            fontSize: 16, fontFamily: "'Noto Serif SC', serif",
            color: '#4a3a28', textAlign: 'center', letterSpacing: 3,
            margin: '4px 0 8px', opacity: 0,
          }}>蛇口工业区基础工程破土动工</p>

          <div ref={divider1Ref} style={{ ...dividerStyle, opacity: 0 }} />

          <p ref={body1Ref} style={{
            fontSize: 15, fontFamily: "'Noto Serif SC', serif", color: '#2a1e10',
            lineHeight: 2, textIndent: '2em', margin: '4px 0', opacity: 0,
          }}>1979年7月2日，一声炮响在南头半岛南端的蛇口响起。炸开微波山的岩石，填入海中，建造出2.14平方公里的平整工业用地。</p>

          <p ref={body2Ref} style={{
            fontSize: 15, fontFamily: "'Noto Serif SC', serif", color: '#2a1e10',
            lineHeight: 2, textIndent: '2em', margin: '4px 0', opacity: 0,
          }}>这是新中国第一个外向型工业区的第一步——不是一纸批文，而是一声真实的爆破。</p>

          <div ref={divider2Ref} style={{ ...dividerStyle, opacity: 0 }} />

          {['· 炸山填海，开出蛇口第一条路', '· 中国改革开放的实质性起步', '·「时间就是金钱，效率就是生命」的起点'].map((text, i) => (
            <p key={i} ref={el => bulletRefs.current[i] = el} style={{
              fontSize: 14, fontFamily: "'Noto Serif SC', serif", color: '#3a2a18',
              lineHeight: 1.8, margin: '3px 0', paddingLeft: 8, opacity: 0,
            }}>{text}</p>
          ))}

          <div ref={divider3Ref} style={{ ...dividerStyle, opacity: 0 }} />

          <p ref={editorialRef} style={{
            fontSize: 20, fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif",
            color: '#1a1008', textAlign: 'center', lineHeight: 1.8,
            margin: '8px 0 4px', opacity: 0, minHeight: 36,
          }} />

          <p ref={editorialSubRef} style={{
            fontSize: 15, fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif",
            color: '#5a4a35', textAlign: 'center', lineHeight: 1.8,
            margin: '2px 0', opacity: 0,
          }}>这一炮，不只是炸开了山，也炸开了一种可能。</p>
        </div>

        <div ref={footerRef} style={{
          borderTop: '1px solid #8b7355', padding: '8px 32px',
          textAlign: 'center', fontSize: 11, color: '#8b7355',
          fontFamily: "'Noto Serif SC', serif", opacity: 0,
        }}>
          招商局蛇口工业区 · 编印
        </div>
      </div>
    </div>
  );
}
