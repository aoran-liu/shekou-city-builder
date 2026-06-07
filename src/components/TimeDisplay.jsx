import { useGame } from '../store/gameStore';

export default function TimeDisplay() {
  const { year, season } = useGame();

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      left: 12,
      background: 'var(--bg-panel)',
      borderRadius: 10,
      padding: '8px 16px',
      border: '1px solid var(--border-gold)',
      backdropFilter: 'blur(10px)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{
        fontSize: 20,
        fontWeight: 900,
        color: 'var(--gold)',
        fontFamily: "'Noto Serif SC', serif",
      }}>{year}年</span>
      <span style={{
        fontSize: 14,
        color: 'var(--text-secondary)',
        fontWeight: 500,
      }}>· {season}</span>
    </div>
  );
}
