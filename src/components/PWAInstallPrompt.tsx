import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone, ArrowDown } from 'lucide-react';
import './PWAInstallPrompt.css';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is ALREADY running standalone (opened from Home Screen)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isDismissed = localStorage.getItem('mogger_pwa_dismissed') === 'true';

    if (!isStandalone && !isDismissed) {
      setShowPrompt(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    } else {
      // iOS Safari mode
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('mogger_pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Floating Install Bar */}
      <div className="pwa-prompt animate-fade-in">
        <div className="pwa-prompt__content">
          <div className="pwa-prompt__icon">⚡</div>
          <div className="pwa-prompt__text">
            <span className="pwa-prompt__title">УСТАНОВИТЬ MOGGER</span>
            <span className="pwa-prompt__sub">Добавьте иконку на рабочий стол</span>
          </div>
        </div>
        <div className="pwa-prompt__actions">
          <button className="pwa-prompt__install-btn" onClick={handleInstallClick}>
            <Smartphone size={14} />
            УСТАНОВИТЬ
          </button>
          <button className="pwa-prompt__close-btn" onClick={handleDismiss} title="Закрыть">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS Step-by-Step Guide Modal */}
      {showIOSModal && (
        <div className="pwa-modal__overlay" onClick={() => setShowIOSModal(false)}>
          <div className="pwa-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="pwa-modal__header">
              <h3>КАК ДОБАВИТЬ НА РАБОЧИЙ СТОЛ</h3>
              <button className="pwa-modal__close" onClick={() => setShowIOSModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="pwa-modal__body">
              <div className="pwa-modal__step">
                <div className="pwa-modal__step-num">1</div>
                <div className="pwa-modal__step-text">
                  Нажмите кнопку <strong>«Поделиться»</strong> <Share size={16} className="pwa-inline-icon" /> внизу экрана Safari
                </div>
              </div>

              <div className="pwa-modal__step">
                <div className="pwa-modal__step-num">2</div>
                <div className="pwa-modal__step-text">
                  Пролистайте вниз и выберите <strong>«На экран «Домой»»</strong> <PlusSquare size={16} className="pwa-inline-icon" />
                </div>
              </div>

              <div className="pwa-modal__step">
                <div className="pwa-modal__step-num">3</div>
                <div className="pwa-modal__step-text">
                  Нажмите <strong>«Добавить»</strong> в правом верхнем углу
                </div>
              </div>

              <div className="pwa-modal__pointer">
                <ArrowDown size={24} className="pwa-bounce" />
                <span>Кнопка находится в меню внизу</span>
              </div>
            </div>

            <div className="pwa-modal__footer">
              <button className="btn btn--primary" onClick={() => { setShowIOSModal(false); handleDismiss(); }}>
                ПОНЯТНО
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
