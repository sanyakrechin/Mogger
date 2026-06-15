import Sidebar from './components/Sidebar';
import BrainDump from './components/BrainDump';
import EmotionJournal from './components/EmotionJournal';
import BrainTraining from './components/BrainTraining';
import DaySplit from './components/DaySplit';
import Settings from './components/Settings';
import { useAppState, getTodaySphere } from './store/AppContext';
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
    case 'dashboard': return <BrainDump />;
    case 'emotions': return <EmotionJournal />;
    case 'training': return <BrainTraining />;
    case 'splits': return <DaySplit />;
    case 'settings': return <Settings />;
    default: return <BrainDump />;
  }
}

export default function App() {
  const { state } = useAppState();
  const todaySphere = getTodaySphere(state.daySplits);

  return (
    <div className="app">
      <Sidebar />
      <main className="app__content">
        <header className="app__header">
          <div className="app__header-left">
            <span className="app__date">{formatDate()}</span>
            {todaySphere && (
              <span
                className="app__split-badge"
                style={{ borderColor: todaySphere.color + '40', color: todaySphere.color }}
              >
                {todaySphere.sphere}
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
