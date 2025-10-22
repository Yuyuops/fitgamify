import React from 'react';
import { Link } from 'react-router-dom';
import { DAILY_REFLECTIONS } from '../constants';
import { calculateXpAndLevel } from '../utils/xpUtils';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import { BoltIcon } from '@heroicons/react/24/solid';
import { Program, DailyLog, Supplement } from '../types';

interface HomePageProps {
  programs: Program[];
  dailyLogs: Record<string, DailyLog>;
  supplements: Supplement[];
}

const HomePage: React.FC<HomePageProps> = ({ programs, dailyLogs, supplements }) => {
  const { level, currentLevelXp, xpForNextLevel } = calculateXpAndLevel(dailyLogs, supplements);
  const xpProgress = (currentLevelXp / xpForNextLevel) * 100;
  
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs[getTodayDateString()];
  const todayHydrationPercent = todayLog ? Math.min(Math.round((todayLog.hydration / 3000) * 100), 100) : 0;
  const totalSessions = Object.values(dailyLogs).reduce((acc, log) => acc + log.sessions.length, 0);

  const kpiData = [
    { label: 'Programs', value: programs.length },
    { label: 'Sessions Done', value: totalSessions },
    { label: 'Hydration', value: `${todayHydrationPercent}%` },
  ];

  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const reflection = DAILY_REFLECTIONS[dayOfYear % DAILY_REFLECTIONS.length];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">Level {level}</h2>
          <span className="text-sm text-dojo-text-muted">{Math.round(currentLevelXp)} / {xpForNextLevel} XP</span>
        </div>
        <ProgressBar progress={xpProgress} />
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {kpiData.map(kpi => (
          <Card key={kpi.label} className="text-center">
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-dojo-glow-violet to-dojo-glow-blue">{kpi.value}</p>
            <p className="text-xs text-dojo-text-muted">{kpi.label}</p>
          </Card>
        ))}
      </div>

       <Link to="/programs" className="block">
        <Button className="w-full py-4 text-lg flex items-center justify-center gap-2">
            <BoltIcon className="w-6 h-6" />
            Commencer un entraînement
        </Button>
      </Link>

      <Card>
        <h3 className="font-bold text-lg mb-2">Réflexion du Sensei</h3>
        <p className="text-dojo-text-muted italic mb-4">"{reflection}"</p>
        <Link to="/coach" state={{ prompt: `Ma réflexion du jour est : "${reflection}". Peux-tu m'aider à y voir plus clair ?` }}>
            <Button variant="secondary" className="w-full">
                En discuter avec le Sensei
            </Button>
        </Link>
      </Card>
    </div>
  );
};

export default HomePage;
