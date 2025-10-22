import React, { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import Header from './components/layout/Header';
import CoachPage from './pages/CoachPage';
import HomePage from './pages/HomePage';
import ProgramsPage from './pages/ProgramsPage';
import StatsPage from './pages/StatsPage';
import SupplementsPage from './pages/SupplementsPage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import WorkoutPage from './pages/WorkoutPage';
import SettingsPage from './pages/SettingsPage';
import { MOCK_PROGRAMS, MOCK_DAILY_LOGS, INITIAL_SUPPLEMENTS } from './constants';
import { Program, Supplement, DailyLog } from './types';


const App: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>(MOCK_PROGRAMS);
  const [supplements, setSupplements] = useState<Supplement[]>(INITIAL_SUPPLEMENTS);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(MOCK_DAILY_LOGS);
  
  const handleSetPrograms = (newPrograms: Program[] | ((prevState: Program[]) => Program[])) => {
    setPrograms(newPrograms);
  };

  const updateProgram = (updatedProgram: Program) => {
    setPrograms(prev => prev.map(p => p.id === updatedProgram.id ? updatedProgram : p));
  };

  return (
    <div className="bg-gradient-to-b from-dojo-bg-start to-dojo-bg-end min-h-screen text-dojo-text font-sans">
      <HashRouter>
        <div className="pb-20">
          <Header />
          <main className="p-4">
            <Routes>
              <Route path="/" element={<HomePage programs={programs} dailyLogs={dailyLogs} supplements={supplements} />} />
              <Route path="/programs" element={<ProgramsPage programs={programs} setPrograms={handleSetPrograms} />} />
              <Route path="/program/:programId" element={<ProgramDetailPage allPrograms={programs} updateProgram={updateProgram} />} />
              <Route path="/workout/:programId" element={<WorkoutPage programs={programs} setDailyLogs={setDailyLogs} />} />
              <Route path="/supplements" element={<SupplementsPage supplements={supplements} setSupplements={setSupplements} dailyLogs={dailyLogs} setDailyLogs={setDailyLogs} />} />
              <Route path="/stats" element={<StatsPage dailyLogs={dailyLogs} setDailyLogs={setDailyLogs} supplements={supplements}/>} />
              <Route path="/coach" element={<CoachPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
        <BottomNav />
      </HashRouter>
    </div>
  );
};

export default App;
