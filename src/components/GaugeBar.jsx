import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const STAT_CONFIG = {
  economy: { label: '经济', icon: '/images/icons/stat-economy.png', color: '#d4a020', bgColor: 'rgba(212, 160, 32, 0.15)' },
  politics: { label: '政治', icon: '/images/icons/stat-politics.png', color: '#2980b9', bgColor: 'rgba(41, 128, 185, 0.15)' },
  support: { label: '民心', icon: '/images/icons/stat-support.png', color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.15)' },
  innovation: { label: '创新', icon: '/images/icons/stat-innovation.png', color: '#8e44ad', bgColor: 'rgba(142, 68, 173, 0.15)' },
};

export default function GaugeBar({ statKey, value, prevValue }) {
  const fillRef = useRef(null);
  const numRef = useRef(null);
  const config = STAT_CONFIG[statKey];

  useEffect(() => {
    if (!fillRef.current) return;
    gsap.to(fillRef.current, {
      width: `${value}%`,
      duration: 0.8,
      ease: 'power2.out',
    });
    gsap.fromTo(numRef.current,
      { innerText: prevValue ?? value },
      {
        innerText: value,
        duration: 0.8,
        ease: 'power2.out',
        snap: { innerText: 1 },
        onUpdate() {
          if (numRef.current) numRef.current.textContent = Math.round(gsap.getProperty(numRef.current, 'innerText'));
        },
      }
    );
  }, [value, prevValue]);

  const isLow = value < 30;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 0',
    }}>
      <img src={config.icon} alt={config.label} style={{ width: 20, height: 20, objectFit: 'contain' }} />
      <span style={{
        fontSize: 11,
        color: 'var(--text-secondary)',
        width: 28,
        fontWeight: 500,
      }}>{config.label}</span>
      <div style={{
        flex: 1,
        height: 14,
        background: config.bgColor,
        borderRadius: 7,
        overflow: 'hidden',
        border: `1px solid ${config.color}33`,
        position: 'relative',
      }}>
        <div
          ref={fillRef}
          style={{
            height: '100%',
            width: `${value}%`,
            background: `linear-gradient(90deg, ${config.color}cc, ${config.color})`,
            borderRadius: 7,
            transition: 'box-shadow 0.3s',
            boxShadow: isLow ? `0 0 10px ${config.color}88` : 'none',
            animation: isLow ? 'pulse-red 1.5s infinite' : 'none',
          }}
        />
      </div>
      <span
        ref={numRef}
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: isLow ? 'var(--red-glow)' : config.color,
          width: 30,
          textAlign: 'right',
          fontFamily: 'monospace',
        }}
      >{value}</span>
    </div>
  );
}
