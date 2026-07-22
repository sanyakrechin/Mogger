import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './OnboardingModal.css';

interface OnboardingModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    step: 1,
    title: '⚡ НЕИЗБЕЖНЫЕ СПЛИТЫ (ГЛАВНАЯ)',
    icon: '🎯',
    desc: 'Твоя неделя разбита по сферам (IT, Спорт, Обучение...). Каждый день ты выполняешь обязательные и свои задачи. Отмечай выполненное, чтобы копить XP и удерживать стрик!',
  },
  {
    step: 2,
    title: '🧠 ТРЕНИНГ РАЗУМА И СФЕРЫ',
    icon: '⏱️',
    desc: 'Используй Спринт-Фокус (60-90 мин) для глубокой работы, Медитацию Дыхания для снижения стресса и Отсрочку Удовольствия для прокачки силы воли.',
  },
  {
    step: 3,
    title: '📖 ЭМОЦИОНАЛЬНЫЙ ДНЕВНИК',
    icon: '✍️',
    desc: 'Выплескивай свои мысли и выбирай эмоцию дня. Это очищает оперативную память мозга, а паттерны за 30 дней показывают твое психологическое состояние.',
  },
  {
    step: 4,
    title: '👤 ПРОФИЛЬ, СТАТУС И СТРИКИ',
    icon: '🗿',
    desc: 'За каждый день без пропусков загорается огонь стрика! Повышай Уровень с 1 до 10+, превращая аватар в Гигачада и разблокируя новые темы оформления.',
  },
  {
    step: 5,
    title: '🎁 ПОДАРКИ, БОСС-КВЕСТЫ И STORIES',
    icon: '🏆',
    desc: 'Зарабатывай Mogger Coins, покупай мемные и редкие подарки на Почетную Витрину, сдавай отчеты по Босс-Квестам и делись своими успехами в Stories!',
  },
];

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      localStorage.setItem('mogger-onboarding-done', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="onboarding-overlay animate-fade-in" onClick={onClose}>
      <div className="onboarding-modal" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <span className="onboarding-step-badge">
          ИНСТРУКЦИЯ // ШАГ {step.step} ИЗ {STEPS.length}
        </span>

        <div className="onboarding-icon">{step.icon}</div>

        <h3 className="onboarding-title">{step.title}</h3>

        <div className="onboarding-desc">{step.desc}</div>

        {/* Dots */}
        <div className="onboarding-progress-dots">
          {STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`onboarding-dot ${idx === currentStepIndex ? 'onboarding-dot--active' : ''}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="onboarding-controls">
          <button
            className="btn"
            disabled={currentStepIndex === 0}
            onClick={handlePrev}
            style={{ opacity: currentStepIndex === 0 ? 0.3 : 1 }}
          >
            <ArrowLeft size={16} style={{ display: 'inline', marginRight: '6px' }} />
            НАЗАД
          </button>

          <button className="btn btn--primary onboarding-nav-btn" onClick={handleNext}>
            {currentStepIndex === STEPS.length - 1 ? (
              <>
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
                ПОНЯТНО! В БОЙ
              </>
            ) : (
              <>
                ДАЛЕЕ
                <ArrowRight size={16} style={{ display: 'inline', marginLeft: '6px' }} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
