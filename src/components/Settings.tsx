import { useAppState } from '../store/AppContext';
import { getXpForNextLevel } from '../store/AppContext';
import './Settings.css';

const ACHIEVEMENTS_DEF = [
  { id: 'first_task', icon: '📝', title: 'Первый Шаг', desc: 'Добавить задачу в дашборд', tiers: [5, 25, 50] },
  { id: 'clear_mind', icon: '⚡', title: 'Чистый Разум', desc: 'Завершить срочные задачи', tiers: [25, 100, 250] },
  { id: 'iron_will', icon: '🛡️', title: 'Железная Воля', desc: 'Выдержать сессии отсрочки', tiers: [15, 50, 150] },
  { id: 'zen_master', icon: '🧘', title: 'Мастер Дзена', desc: 'Минут в медитации дыхания', tiers: [300, 1500, 5000] },
  { id: 'eq_master', icon: '💜', title: 'Эмоциональный Интеллект', desc: 'Записей в дневник эмоций', tiers: [35, 150, 500] },
  { id: 'sprinter', icon: '🏃', title: 'Спринтер', desc: 'Завершить фокус-спринты', tiers: [50, 250, 1000] },
];

export default function Settings() {
  const { state } = useAppState();
  const { xp, level } = state.gamification;
  const nextLevelXp = getXpForNextLevel(level);
  
  // To make the progress bar relative to current level:
  const prevLevelXp = level > 1 ? getXpForNextLevel(level - 1) : 0;
  const progressPercent = Math.min(100, Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  // Compute progress for each achievement based on state
  const getProgress = (id: string) => {
    switch(id) {
      case 'first_task': return state.tasks.length;
      case 'clear_mind': return state.tasks.filter(t => t.category === 'immediate' && t.completed).length;
      case 'iron_will': return state.delays.filter(d => d.resisted).length;
      case 'zen_master': return Math.floor(state.meditations.reduce((acc, m) => acc + m.durationSeconds, 0) / 60);
      case 'eq_master': return state.emotions.length;
      case 'sprinter': return state.sprints.length;
      default: return 0;
    }
  };

  return (
    <div className="settings">
      <div className="settings__card">
        <h2 className="settings__title">СТАТИСТИКА И ПРОГРЕСС</h2>
        
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          УРОВЕНЬ {level}
        </div>
        
        <div className="settings__xp-bar">
          <div className="settings__xp-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        
        <div className="settings__level-info">
          <span>{xp} XP</span>
          <span>{nextLevelXp} XP (След. уровень)</span>
        </div>
      </div>

      <div className="settings__card">
        <h2 className="settings__title">ДОСТИЖЕНИЯ</h2>
        <div className="settings__achievements">
          {ACHIEVEMENTS_DEF.map(ach => {
            const progress = getProgress(ach.id);
            let currentTier = 0;
            if (progress >= ach.tiers[2]) currentTier = 3;
            else if (progress >= ach.tiers[1]) currentTier = 2;
            else if (progress >= ach.tiers[0]) currentTier = 1;

            return (
              <div key={ach.id} className={`settings__achievement ${currentTier > 0 ? 'settings__achievement--unlocked' : ''}`}>
                <div className="settings__achievement-icon">{ach.icon}</div>
                <div className="settings__achievement-info">
                  <div className="settings__achievement-title">{ach.title}</div>
                  <div className="settings__achievement-desc">
                    {ach.desc} ({progress} / {ach.tiers[currentTier === 3 ? 2 : currentTier]})
                  </div>
                  <div className="settings__achievement-level">
                    {[1, 2, 3].map(star => (
                      <span key={star} className={`settings__star ${star <= currentTier ? 'settings__star--active' : ''}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
