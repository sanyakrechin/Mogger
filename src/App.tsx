import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WeekDashboard from './components/WeekDashboard';
import DayHistory from './components/DayHistory';
import EmotionJournal from './components/EmotionJournal';
import BrainTraining from './components/BrainTraining';
import Profile from './components/Profile';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { useAppState, getTodayIndex } from './store/AppContext';
import './App.css';

function renderTab(tab: string) {
  switch (tab) {
    case 'home': return <WeekDashboard />;
    case 'history': return <DayHistory />;
    case 'emotions': return <EmotionJournal />;
    case 'training': return <BrainTraining />;
    case 'profile': return <Profile />;
    case 'settings': return <Profile />;
    default: return <WeekDashboard />;
  }
}

export default function App() {
  const { state } = useAppState();
  const todayIndex = getTodayIndex();
  const assignment = state.weekAssignments.find(a => a.dayIndex === todayIndex);
  const todayTemplate = assignment ? state.templates.find(t => t.id === assignment.templateId) : undefined;

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
      CSS.supports('-webkit-touch-callout', 'none');
    
    if (isIOS) {
      document.body.classList.add('is-ios');
    }
  }, []);

  return (
    <div
      className="app"
      data-level={state.gamification.level}
      data-theme={state.gamification.activeTheme || 'cyber-dark'}
    >
      <PWAInstallPrompt />
      <Sidebar />
      <main className="app__content">
        <header className="app__header">
          <div className="app__header-left">
            {todayTemplate && (
              <span
                className="app__split-badge"
                style={{ borderColor: todayTemplate.color + '40', color: todayTemplate.color }}
              >
                {todayTemplate.icon} {todayTemplate.name}
              </span>
            )}
          </div>
          <div className="app__header-right">
            <span className="app__status">
              <span className="app__status-dot" />
              SYS.ONLINE
            </span>
          </div>
        </header>

        <div className="animate-fade-in" key={state.activeTab}>
          {renderTab(state.activeTab)}
        </div>
      </main>
    </div>
  );
}
