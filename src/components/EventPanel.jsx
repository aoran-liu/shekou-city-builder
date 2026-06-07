import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGameDispatch } from '../store/gameStore';

const CHOICE_ICONS = [
  '/images/icons/choice-accept.png',
  '/images/icons/choice-delay.png',
  '/images/icons/choice-balance.png',
  '/images/icons/choice-guard.png',
];

export default function EventPanel({ event, onComplete }) {
  const panelRef = useRef(null);
  const portraitRef = useRef(null);
  const choicesRef = useRef(null);
  const dispatch = useGameDispatch();
  const [displayText, setDisplayText] = useState('');
  const [showChoices, setShowChoices] = useState(false);
  const typingRef = useRef(null);

  useEffect(() => {
    setDisplayText('');
    setShowChoices(false);

    const tl = gsap.timeline();
    tl.fromTo(panelRef.current,
      { y: '100%', opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
    );

    if (portraitRef.current) {
      tl.fromTo(portraitRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      );
    }

    const fullText = event.text;
    let i = 0;
    const speed = 28;

    let typeAudio = null;

    tl.call(() => {
      typingRef.current = setInterval(() => {
        i++;
        setDisplayText(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(typingRef.current);
          if (typeAudio) { typeAudio.pause(); typeAudio.currentTime = 0; }
          setShowChoices(true);
        }
      }, speed);
    }, null, '+=0.2');

    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [event]);

  useEffect(() => {
    if (showChoices && choicesRef.current) {
      const btns = choicesRef.current.children;
      gsap.set(btns, { opacity: 0, x: -20 });
      gsap.to(btns, {
        opacity: 1, x: 0,
        duration: 0.4, stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, [showChoices]);

  const handleSkipTyping = () => {
    if (!showChoices) {
      if (typingRef.current) clearInterval(typingRef.current);
      setDisplayText(event.text);
      setShowChoices(true);
    }
  };

  const handleChoice = (choice) => {
    try {
      const sfx = new Audio('/audio/sfx/click.mp3');
      sfx.volume = 0.3;
      sfx.play();
    } catch (_) {}
    dispatch({ type: 'APPLY_DECISION', payload: { effects: choice.effects, label: choice.label } });
    if (choice.news && !choice.consequence) {
      dispatch({ type: 'SHOW_NEWS', payload: choice.news });
    }
    gsap.to(panelRef.current, {
      y: '100%',
      opacity: 0,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: () => onComplete(choice),
    });
  };

  const hasPortrait = !!event.portrait;
  const docRef = useRef(null);

  useEffect(() => {
    if (event.docImage && docRef.current) {
      gsap.fromTo(docRef.current,
        { y: 40, opacity: 0, rotation: 8 },
        { y: 0, opacity: 1, rotation: -2, duration: 0.8, delay: 0.5, ease: 'back.out(1.5)' }
      );
    }
  }, [event.docImage]);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        overflow: 'visible',
      }}
    >
      {/* Floating document prop */}
      {event.docImage && (
        <div
          ref={docRef}
          style={{
            position: 'absolute',
            top: -180,
            right: 40,
            width: 200,
            zIndex: 55,
            transform: 'rotate(-2deg)',
            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.7))',
            cursor: 'pointer',
          }}
        >
          <img
            src={event.docImage}
            alt="文件道具"
            style={{
              width: '100%',
              borderRadius: 4,
              border: '1px solid rgba(212,168,85,0.3)',
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 11,
            color: 'var(--gold)',
            background: 'rgba(26,21,16,0.9)',
            padding: '2px 10px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
          }}>计件工资单</div>
        </div>
      )}
      {/* Main panel frame */}
      <div style={{
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(180deg, #2a2118 0%, #1a1510 60%, #0f0c08 100%)',
        borderTop: '3px solid #6b5530',
        boxShadow: '0 -6px 40px rgba(0,0,0,0.7), inset 0 2px 0 rgba(212,168,85,0.12)',
        overflow: 'visible',
      }}>
        {/* Gold trim line at top */}
        <div style={{
          position: 'absolute',
          top: -2,
          left: 40,
          right: 40,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #d4a855, #f0d48a, #d4a855, transparent)',
        }} />

        {/* Center top ornament */}
        <div style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 48,
          height: 14,
          background: 'linear-gradient(180deg, #f0d48a, #8b6914)',
          borderRadius: '3px 3px 8px 8px',
          border: '1px solid #d4a855',
          boxShadow: '0 2px 10px rgba(212,168,85,0.3)',
          zIndex: 5,
        }}>
          <div style={{
            position: 'absolute',
            top: 3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            background: '#c0392b',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(192,57,43,0.6)',
          }} />
        </div>

        {/* Subtle repeating texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(212,168,85,0.015) 3px, rgba(212,168,85,0.015) 4px)',
          pointerEvents: 'none',
        }} />

        {/* Main content layout */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          padding: '24px 28px 24px 0',
          overflow: 'visible',
        }}>

          {/* === LEFT: Portrait — breaks above panel === */}
          {hasPortrait && (
            <div
              ref={portraitRef}
              style={{
                position: 'relative',
                width: 280,
                minWidth: 280,
                alignSelf: 'flex-end',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Portrait frame — extends above panel */}
              <div style={{
                position: 'relative',
                width: 240,
                marginTop: -80,
              }}>
                {/* Frame border */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  bottom: 0,
                  border: '3px solid #6b5530',
                  borderRadius: 8,
                  background: 'linear-gradient(180deg, rgba(30,24,16,0.85) 0%, rgba(20,16,10,0.95) 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.3)',
                  zIndex: 1,
                }}>
                  {/* Inner gold border */}
                  <div style={{
                    position: 'absolute',
                    inset: 5,
                    border: '1px solid rgba(212,168,85,0.3)',
                    borderRadius: 4,
                  }} />
                  {/* Corner accents */}
                  {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map(corner => {
                    const isTop = corner.includes('top');
                    const isLeft = corner.includes('Left');
                    return (
                      <div key={corner} style={{
                        position: 'absolute',
                        [isTop ? 'top' : 'bottom']: -4,
                        [isLeft ? 'left' : 'right']: -4,
                        width: 12,
                        height: 12,
                        background: 'radial-gradient(circle, #d4a855, #8b6914)',
                        borderRadius: 2,
                        border: '1px solid #f0d48a',
                        boxShadow: '0 0 6px rgba(212,168,85,0.4)',
                      }} />
                    );
                  })}
                </div>

                {/* Portrait image — overflow above frame */}
                <img
                  src={event.portrait}
                  alt={event.character}
                  style={{
                    position: 'relative',
                    width: '100%',
                    zIndex: 2,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
                    borderRadius: 6,
                  }}
                />
              </div>

              {/* Name plate */}
              <div style={{
                position: 'relative',
                zIndex: 3,
                marginTop: -4,
                textAlign: 'center',
                padding: '8px 24px',
                background: 'linear-gradient(180deg, #2a2118, #1a1510)',
                border: '2px solid #6b5530',
                borderRadius: 4,
                boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
                minWidth: 140,
              }}>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--gold)',
                  letterSpacing: 5,
                  fontFamily: "'Noto Serif SC', serif",
                }}>{event.character}</div>
                {event.role && (
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginTop: 3,
                    letterSpacing: 1,
                  }}>{event.role}</div>
                )}
              </div>
            </div>
          )}

          {/* === RIGHT: Title + Text + Choices === */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: hasPortrait ? 16 : 28,
            gap: 10,
            justifyContent: 'center',
          }}>
            {/* Title */}
            <h3 className="serif" style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--gold-light)',
              margin: 0,
              paddingBottom: 10,
              borderBottom: '1px solid rgba(107,85,48,0.3)',
            }}>{event.title}</h3>

            {/* Dialogue text */}
            <div
              onClick={handleSkipTyping}
              style={{
                fontSize: 17,
                lineHeight: 1.9,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                cursor: showChoices ? 'default' : 'pointer',
              }}
            >
              {displayText}
              {!showChoices && (
                <span style={{ animation: 'pulse-glow 1s infinite', color: 'var(--gold)' }}>▌</span>
              )}
            </div>

            {/* Choice buttons — immediately after text, no flex spacer */}
            {showChoices && event.choices && (
              <div ref={choicesRef} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginTop: 8,
              }}>
                {event.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(choice)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 24px',
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      background: 'linear-gradient(90deg, rgba(212,168,85,0.06), rgba(212,168,85,0.14), rgba(212,168,85,0.06))',
                      border: '2px solid rgba(107,85,48,0.6)',
                      borderRadius: 6,
                      textAlign: 'left',
                      transition: 'all 0.25s',
                      cursor: 'pointer',
                      fontFamily: "'Noto Sans SC', sans-serif",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, rgba(212,168,85,0.1), rgba(212,168,85,0.25), rgba(212,168,85,0.1))';
                      e.currentTarget.style.borderColor = '#d4a855';
                      e.currentTarget.style.transform = 'translateX(6px)';
                      e.currentTarget.style.boxShadow = '0 0 18px rgba(212,168,85,0.2), inset 0 0 20px rgba(212,168,85,0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, rgba(212,168,85,0.06), rgba(212,168,85,0.14), rgba(212,168,85,0.06))';
                      e.currentTarget.style.borderColor = 'rgba(107,85,48,0.6)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{
                      width: 42,
                      height: 42,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(212,168,85,0.12)',
                      borderRadius: 6,
                      border: '1px solid rgba(212,168,85,0.3)',
                      flexShrink: 0,
                      padding: 6,
                    }}>
                      <img
                        src={CHOICE_ICONS[i] || CHOICE_ICONS[0]}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </span>
                    <span>{choice.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom decorative trim */}
        <div style={{
          position: 'absolute',
          bottom: 4,
          left: 40,
          right: 40,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(212,168,85,0.2), transparent)',
        }} />
      </div>
    </div>
  );
}
