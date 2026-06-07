import { useRef } from 'react';
import { useGame } from '../store/gameStore';
import GaugeBar from './GaugeBar';

export default function StatsHUD() {
  const { stats } = useGame();
  const prevStats = useRef(stats);

  const statKeys = ['economy', 'politics', 'support', 'innovation'];

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      width: 200,
      background: 'var(--bg-panel)',
      borderRadius: 10,
      padding: '10px 12px',
      border: '1px solid var(--border-gold)',
      backdropFilter: 'blur(10px)',
      zIndex: 10,
    }}>
      {statKeys.map(key => (
        <GaugeBar
          key={key}
          statKey={key}
          value={stats[key]}
          prevValue={prevStats.current[key]}
        />
      ))}
    </div>
  );
}
