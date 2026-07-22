import { useState } from 'react';
import { X, Trophy, CheckCircle2, UploadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppState } from '../store/AppContext';
import './WeeklyQuestModal.css';

interface QuestModalProps {
  onClose: () => void;
}

export default function WeeklyQuestModal({ onClose }: QuestModalProps) {
  const { state, dispatch } = useAppState();
  const [proofText, setProofText] = useState('');

  const quest = state.gamification.weeklyQuest;
  if (!quest) return null;

  const handleSubmit = () => {
    if (!proofText.trim()) return;
    dispatch({ type: 'SUBMIT_WEEKLY_QUEST', proofText });
  };

  const handleClaim = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    dispatch({ type: 'CLAIM_WEEKLY_QUEST_REWARD' });
    onClose();
  };

  return (
    <div className="quest-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="quest-modal" onClick={e => e.stopPropagation()}>
        <button
          className="stories-close-btn"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <span className="quest-header-badge">🎯 ЕЖЕНЕДЕЛЬНЫЙ AI БОСС-КВЕСТ</span>

        <h2 className="quest-title">{quest.title}</h2>

        <div className="quest-desc">
          {quest.description}
        </div>

        <div className="quest-reward-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy color="var(--amber)" size={20} />
            <span style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '0.9rem' }}>НАГРАДА ЗА ПОБЕДУ:</span>
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--amber)', fontSize: '1rem' }}>
            +{quest.rewardCoins} 🪙 + 🏅 Медаль I ст.
          </span>
        </div>

        {/* Verification Form */}
        {quest.status === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              ВЕРИФИКАЦИЯ (Прикрепите скриншот, ссылку на коммит или опишите выполнение):
            </label>
            <textarea
              className="quest-proof-input"
              placeholder="> Прикрепить скриншот / ссылку на выполненную задачу..."
              value={proofText}
              onChange={e => setProofText(e.target.value)}
            />
            <button
              className="quest-submit-btn"
              disabled={!proofText.trim()}
              onClick={handleSubmit}
            >
              <UploadCloud size={18} style={{ display: 'inline', marginRight: '8px' }} />
              ОТПРАВИТЬ НА ВЕРИФИКАЦИЮ
            </button>
          </div>
        )}

        {quest.status === 'submitted' && (
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '12px', border: '1px solid var(--cyan)' }}>
            <CheckCircle2 color="var(--cyan)" size={32} style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '8px' }}>ОТЧЕТ ПРИНЯТ НА ПРОВЕРКУ!</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Алгоритм подтвердил выполнение задания. Заберите заслуженную награду!
            </p>
            <button className="quest-submit-btn" onClick={handleClaim}>
              🏆 ЗАБРАТЬ НАГРАДУ
            </button>
          </div>
        )}

        {quest.status === 'completed' && (
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '12px', border: '1px solid var(--green)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--green)', fontSize: '1.1rem' }}>✓ ВЫЗОВ УСПЕШНО ВЫПОЛНЕН</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Вы получили +500 🪙 Mogger Coins и Трофей в профиль. Новый вызов появится в понедельник!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
