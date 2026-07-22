import { useState } from 'react';
import {
  Camera,
  Trophy,
  Bell,
  CheckCircle,
  ShieldAlert,
  Flame,
  Palette
} from 'lucide-react';
import { useAppState } from '../store/AppContext';
import { GIFTS_CATALOG } from '../data/giftsData';
import GiftsMarket from './GiftsMarket';
import StoriesGeneratorModal from './StoriesGeneratorModal';
import WeeklyQuestModal from './WeeklyQuestModal';
import './Profile.css';

const AVATARS: Record<number, { icon: string; title: string; aura: string }> = {
  1: { icon: '👤', title: 'ТУМАННЫЙ РАЗУМ', aura: 'var(--text-dim)' },
  2: { icon: '🕶️', title: 'ПРОБУЖДЕНИЕ', aura: 'var(--violet)' },
  3: { icon: '🎧', title: 'ЯСНЫЙ ВЗГЛЯД', aura: 'var(--cyan)' },
  4: { icon: '⚡', title: 'ФОКУС', aura: 'var(--green)' },
  5: { icon: '🗿', title: 'СИГМА-РЕЖИМ', aura: 'var(--amber)' },
  6: { icon: '🧘', title: 'МАСТЕР ДЗЕН', aura: 'var(--amber)' },
  7: { icon: '💎', title: 'КРИСТАЛЬНЫЙ РАЗУМ', aura: '#ec4899' },
  8: { icon: '🔴', title: 'ДОМИНИРУЮЩИЙ', aura: 'var(--red)' },
  9: { icon: '⚡', title: 'MOGGER', aura: 'var(--cyan)' },
  10: { icon: '👑', title: 'CYBER GOD', aura: 'gold' },
};

const THEMES = [
  { id: 'cyber-dark', name: 'Cyber Dark', reqLevel: 1, color: '#00f0ff' },
  { id: 'tokyo-drift', name: 'Tokyo Drift', reqLevel: 3, color: '#8b5cf6' },
  { id: 'matrix-code', name: 'Matrix Code', reqLevel: 5, color: '#00ff88' },
  { id: 'sunset-vapor', name: 'Sunset Vaporwave', reqLevel: 7, color: '#ec4899' },
  { id: 'gold-sigma', name: 'Gold Sigma', reqLevel: 10, color: '#f59e0b' },
];

const ACHIEVEMENTS_LIST = [
  { id: 'first_split', title: '⚡ Первое Замыкание', desc: 'Закрыть все задачи в свой первый день сплита.', icon: '⚡' },
  { id: 'streak_3', title: '🔥 В Огне (3 Дня)', desc: 'Удерживать стрик 3 дня подряд.', icon: '🔥' },
  { id: 'streak_7', title: '🔥 Дисциплинированный (7 Дней)', desc: 'Не пропустить ни одного дня в течение недели.', icon: '🏆' },
  { id: 'sprint_5', title: '🧠 Погружение в Фокус', desc: 'Выполнить 5 Спринт-Фокусов по 60+ минут.', icon: '🎯' },
  { id: 'meditation_10', title: '🧘 Дзен Оператор', desc: 'Провести 10 сессий глубокого дыхания.', icon: '🌬️' },
  { id: 'delay_10', title: '🛡️ Железная Воля', desc: 'Успешно сопротивляться 10 искушениям.', icon: '🛡️' },
  { id: 'emotions_15', title: '📖 Осознанный Разум', desc: 'Сделать 15 записей в Эмоциональном Дневнике.', icon: '✍️' },
  { id: 'boss_quest_1', title: '🏅 Босс-Квест I ст.', desc: 'Успешно верифицировать еженедельный AI вызов.', icon: '🏅' },
];

export default function Profile() {
  const { state, dispatch } = useAppState();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'market'>('profile');
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const level = state.gamification.level;
  const avatarInfo = AVATARS[Math.min(level, 10)] || AVATARS[1];
  const xpInLevel = state.gamification.xp % 200;
  const filledSegments = Math.floor((xpInLevel / 200) * 10);
  const hasFlame = state.gamification.streak >= 7;

  const equippedGifts = (state.gamification?.equippedGiftIds || [])
    .map(id => GIFTS_CATALOG.find(g => g.id === id))
    .filter(Boolean);

  const handleTestPush = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('MOGGER // ПУШ-УВЕДОМЛЕНИЕ', {
        body: state.gamification.pushStyle === 'aggressive'
          ? '💀 Ты так и хочешь оставаться слабым? Твой сплит сам себя не сделает!'
          : '⚡ Пора зайти в Моггер и закрыть задачи дня!',
      });
    } else if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('MOGGER // УВЕДОМЛЕНИЯ ВКЛЮЧЕНЫ', {
            body: 'Мотивирующие пуши будут приходить при пропуске активности!',
          });
        }
      });
    } else {
      setToastMessage('Тестовое уведомление: 💀 Ты так и хочешь оставаться слабым? Зайди в Моггер!');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="profile animate-fade-in">
      {/* Sub-Tab Navigation Header */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className={`btn ${activeSubTab === 'profile' ? 'btn--primary' : ''}`}
          onClick={() => setActiveSubTab('profile')}
        >
          👤 ПРОФИЛЬ И СТАТУС
        </button>
        <button
          className={`btn ${activeSubTab === 'market' ? 'btn--primary' : ''}`}
          onClick={() => setActiveSubTab('market')}
        >
          🎁 МАГАЗИН ПОДАРКОВ
        </button>
      </div>

      {activeSubTab === 'market' ? (
        <GiftsMarket />
      ) : (
        <>
          {/* Hero Card */}
          <div className="profile-hero" style={{ borderColor: avatarInfo.aura }}>
            <div className="profile-avatar-container">
              {hasFlame && <div className="profile-flame-ring" />}
              <div className="profile-avatar" style={{ boxShadow: `0 0 25px ${avatarInfo.aura}` }}>
                {avatarInfo.icon}
              </div>
            </div>

            <div className="profile-hero-info">
              <div className="profile-title">{avatarInfo.title}</div>
              <div className="profile-level-badge" style={{ color: avatarInfo.aura }}>
                <span>УРОВЕНЬ {level}</span>
                <span>•</span>
                <span>{state.gamification.xp} XP</span>
              </div>

              {/* XP Segment Bar */}
              <div className="profile-xp-bar">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`profile-xp-segment ${i < filledSegments ? 'profile-xp-segment--filled' : ''}`}
                  />
                ))}
              </div>

              {/* Quick Actions */}
              <div className="profile-actions-row">
                <button className="profile-btn" onClick={() => setShowStoriesModal(true)}>
                  <Camera size={14} />
                  ПОДЕЛИТЬСЯ B STORIES
                </button>

                <button className="profile-btn" onClick={() => setShowQuestModal(true)}>
                  <Trophy size={14} color="var(--amber)" />
                  БОСС-КВЕСТ ВЕКТОРА
                </button>
              </div>

              {/* Showcase Box */}
              {equippedGifts.length > 0 && (
                <div className="profile-showcase" style={{ marginTop: '12px' }}>
                  <span className="profile-showcase-title">ВИТРИНА ПОДАРКОВ:</span>
                  <div className="profile-showcase-items">
                    {equippedGifts.map(g => (
                      <span key={g?.id} title={g?.name}>{g?.icon}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Streak Section */}
          <div className="profile-streak-card glass-card">
            <div className="profile-streak-header">
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem' }}>
                  СЕРИЯ ДНЕЙ «В ОГНЕ»
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Заходите каждый день и выполняйте сплиты, чтобы не потерять стрик!
                </span>
              </div>
              <div className="profile-streak-val">
                <Flame size={24} />
                <span>{state.gamification.streak} ДНЕЙ</span>
              </div>
            </div>

            <div className="profile-streak-grid">
              {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day, i) => {
                const isActive = i < (state.gamification.streak % 7 || (state.gamification.streak > 0 ? 7 : 0));
                return (
                  <div key={day} className={`profile-streak-day ${isActive ? 'profile-streak-day--active' : ''}`}>
                    <span className="profile-streak-day-name">{day}</span>
                    <span className="profile-streak-day-icon">{isActive ? '🔥' : '🔘'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unlockable Themes Selector */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cyan)', marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={18} />
              ТЕМА ОФОРМЛЕНИЯ И АНИМАЦИИ (ОТ УРОВНЯ)
            </h3>

            <div className="profile-themes-grid">
              {THEMES.map(t => {
                const isUnlocked = level >= t.reqLevel;
                const isActive = state.gamification.activeTheme === t.id;

                return (
                  <div
                    key={t.id}
                    className={`profile-theme-card ${isActive ? 'profile-theme-card--active' : ''} ${!isUnlocked ? 'profile-theme-card--locked' : ''}`}
                    onClick={() => isUnlocked && dispatch({ type: 'SET_THEME', themeId: t.id })}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: t.color }}>
                        {t.name}
                      </span>
                      {isActive && <CheckCircle size={16} color="var(--cyan)" />}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {isUnlocked ? '✓ РАЗБЛОКИРОВАНО' : `🔒 Нужен Уровень ${t.reqLevel}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Push Notifications Controls */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--amber)', marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} />
              ДЕРЗКИЕ ПУШ-УВЕДОМЛЕНИЯ (МОТИВАЦИЯ)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.95rem' }}>Включить Уведомления</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Приходить при пропуске активности</div>
                </div>
                <input
                  type="checkbox"
                  checked={state.gamification.pushNotificationsEnabled}
                  onChange={e => dispatch({ type: 'TOGGLE_PUSH_NOTIFICATIONS', enabled: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className={`btn ${state.gamification.pushStyle === 'aggressive' ? 'btn--primary' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_PUSH_NOTIFICATIONS', style: 'aggressive' })}
                >
                  🌶️ ЖЕСТКИЙ МОГГИНГ («Ты так и хочешь быть слабым?»)
                </button>
                <button
                  className={`btn ${state.gamification.pushStyle === 'coach' ? 'btn--primary' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_PUSH_NOTIFICATIONS', style: 'coach' })}
                >
                  ⚡ КИБЕР-ТРЕНЕР («Зайди и закрой задачи»)
                </button>
              </div>

              <button className="profile-btn" style={{ alignSelf: 'flex-start' }} onClick={handleTestPush}>
                <ShieldAlert size={14} color="var(--amber)" />
                ПРОВЕРИТЬ ТЕСТОВЫЙ ПУШ
              </button>

              {toastMessage && (
                <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--amber)', borderRadius: '8px', color: 'var(--amber)', fontSize: '0.85rem' }}>
                  {toastMessage}
                </div>
              )}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--cyan)', marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} />
              ДОСТИЖЕНИЯ И ТРОФЕИ (ACHIEVEMENTS)
            </h3>

            <div className="profile-achievements-grid">
              {ACHIEVEMENTS_LIST.map(ach => {
                const isUnlocked = state.gamification.achievements.some(a => a.id === ach.id);
                return (
                  <div key={ach.id} className={`profile-ach-card ${isUnlocked ? 'profile-ach-card--unlocked' : ''}`}>
                    <div className="profile-ach-icon">{ach.icon}</div>
                    <div className="profile-ach-info">
                      <div className="profile-ach-title">{ach.title}</div>
                      <div className="profile-ach-desc">{ach.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showStoriesModal && <StoriesGeneratorModal onClose={() => setShowStoriesModal(false)} />}
      {showQuestModal && <WeeklyQuestModal onClose={() => setShowQuestModal(false)} />}
    </div>
  );
}
