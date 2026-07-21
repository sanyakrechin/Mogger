import Sidebar from './components/Sidebar';
import WeekDashboard from './components/WeekDashboard';
import DayHistory from './components/DayHistory';
import EmotionJournal from './components/EmotionJournal';
import BrainTraining from './components/BrainTraining';
import Settings from './components/Settings';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { useAppState, getTodayIndex } from './store/AppContext';
import './App.css';

const DAY_NAMES = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
const MONTH_NAMES = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

function formatDate(): string {
  const d = new Date();
  const day = DAY_NAMES[(d.getDay() + 6) % 7];
  const date = d.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} // ${date}.${month}.${year}`;
}

function formatTime(): string {
  const d = new Date();
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function renderTab(tab: string) {
  switch (tab) {
    case 'home': return <WeekDashboard />;
    case 'history': return <DayHistory />;
    case 'emotions': return <EmotionJournal />;
    case 'training': return <BrainTraining />;
    case 'settings': return <Settings />;
    default: return <WeekDashboard />;
  }
}

export default function App() {
  const { state } = useAppState();
  const todayIndex = getTodayIndex();
  const assignment = state.weekAssignments.find(a => a.dayIndex === todayIndex);
  const todayTemplate = assignment ? state.templates.find(t => t.id === assignment.templateId) : undefined;

  return (
    <div className="app">
      <PWAInstallPrompt />
      <Sidebar />
      <main className="app__content">
        <header className="app__header">
          <div className="app__header-left">
            <span className="app__date">{formatDate()}</span>
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
            <span className="app__date">{formatTime()}</span>
          </div>
        </header>

        <div className="animate-fade-in" key={state.activeTab}>
          {renderTab(state.activeTab)}
        </div>
      </main>
    </div>
  );
}
