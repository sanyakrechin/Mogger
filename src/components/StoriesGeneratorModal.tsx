import { useRef } from 'react';
import { X, Download } from 'lucide-react';
import { useAppState } from '../store/AppContext';
import { GIFTS_CATALOG } from '../data/giftsData';
import './StoriesGeneratorModal.css';

interface StoriesModalProps {
  onClose: () => void;
}

const AVATARS_BY_LEVEL: Record<number, { icon: string; title: string }> = {
  1: { icon: '👤', title: 'ТУМАННЫЙ РАЗУМ' },
  2: { icon: '🕶️', title: 'ПРОБУЖДЕНИЕ' },
  3: { icon: '🎧', title: 'ЯСНЫЙ ВЗГЛЯД' },
  4: { icon: '⚡', title: 'ФОКУС' },
  5: { icon: '🗿', title: 'СИГМА-РЕЖИМ' },
  6: { icon: '🧘', title: 'МАСТЕР ДЗЕН' },
  7: { icon: '💎', title: 'КРИСТАЛЬНЫЙ РАЗУМ' },
  8: { icon: '🔴', title: 'ДОМИНИРУЮЩИЙ' },
  9: { icon: '⚡', title: 'MOGGER' },
  10: { icon: '👑', title: 'CYBER GOD' },
};

export default function StoriesGeneratorModal({ onClose }: StoriesModalProps) {
  const { state } = useAppState();
  const cardRef = useRef<HTMLDivElement>(null);

  const level = state.gamification.level;
  const avatarInfo = AVATARS_BY_LEVEL[Math.min(level, 10)] || AVATARS_BY_LEVEL[1];
  const hasFlame = state.gamification.streak >= 7;

  const equippedGifts = state.gamification.equippedGiftIds
    .map(id => GIFTS_CATALOG.find(g => g.id === id))
    .filter(Boolean);

  const handleDownload = () => {
    // Basic canvas capture simulation
    const cardEl = cardRef.current;
    if (!cardEl) return;

    alert('📸 Постер сгенерирован! В мобильном Telegram вы можете опубликовать его прямо в Stories.');
    onClose();
  };

  return (
    <div className="stories-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="stories-modal" onClick={e => e.stopPropagation()}>
        <button className="stories-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cyan)', marginBottom: '16px', fontSize: '1rem' }}>
          ГЕНЕРАТОР STORIES / REELS
        </h3>

        {/* Stories Preview Box */}
        <div
          ref={cardRef}
          className={`stories-preview-card ${level >= 10 ? 'stories-frame--cybergod' : level >= 5 ? 'stories-frame--sigma' : ''}`}
        >
          <div className="stories-brand">MOGGER // REPORT</div>

          <div className="stories-avatar-wrapper">
            {hasFlame && <div className="stories-flame-ring" />}
            <div className="stories-avatar-img">{avatarInfo.icon}</div>
          </div>

          <div>
            <div className="stories-user-title">{avatarInfo.title}</div>
            <div className="stories-user-level">УРОВЕНЬ {level}</div>
          </div>

          {/* Stats Box */}
          <div className="stories-stats-box">
            <div className="stories-stat-row">
              <span>СЕРИЯ ДНЕЙ:</span>
              <span style={{ color: 'var(--amber)' }}>🔥 {state.gamification.streak} ДНЕЙ</span>
            </div>
            <div className="stories-stat-row">
              <span>ДИСЦИПЛИНА:</span>
              <span style={{ color: 'var(--green)' }}>100% (7/7)</span>
            </div>
            <div className="stories-stat-row">
              <span>MOGGER COINS:</span>
              <span style={{ color: 'var(--cyan)' }}>{state.gamification.coins} 🪙</span>
            </div>
          </div>

          {/* Gifts Showcase */}
          {equippedGifts.length > 0 && (
            <div className="stories-gifts-row">
              {equippedGifts.map(g => (
                <span key={g?.id} title={g?.name}>{g?.icon}</span>
              ))}
            </div>
          )}

          <div className="stories-footer-qr">
            telegram: @mogger_app_bot // BRAIN.OS
          </div>
        </div>

        <button className="stories-download-btn" onClick={handleDownload}>
          <Download size={18} style={{ display: 'inline', marginRight: '8px' }} />
          СОХРАНИТЬ ДЛЯ STORIES
        </button>
      </div>
    </div>
  );
}
