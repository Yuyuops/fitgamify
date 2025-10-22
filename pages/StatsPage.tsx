import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { DailyLog, Supplement } from '../types';
import { CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import CollapsibleCard from '../components/ui/CollapsibleCard';
import Calendar from '../components/ui/Calendar';

interface StatsPageProps {
    dailyLogs: Record<string, DailyLog>;
    setDailyLogs: React.Dispatch<React.SetStateAction<Record<string, DailyLog>>>;
    supplements: Supplement[];
}

const StatsPage: React.FC<StatsPageProps> = ({ dailyLogs, setDailyLogs, supplements }) => {
    const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<DailyLog | null>(null);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const chartData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            const log = dailyLogs[dateString];
            data.push({
                name: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                volume: log ? log.sessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0) : 0,
                distance: log ? log.sessions.reduce((acc, s) => acc + (s.distanceKm || 0), 0) : 0,
            });
        }
        return data;
    }, [dailyLogs]);
    
    const logDates = useMemo(() => {
        const dates: Record<string, boolean> = {};
        for (const date in dailyLogs) {
            dates[date] = true;
        }
        return dates;
    }, [dailyLogs]);

    const handleReset = () => {
        if (window.confirm("Êtes-vous sûr de vouloir effacer tout l'historique ? Cette action est irréversible.")) {
            setDailyLogs({});
            alert("Vos statistiques ont été réinitialisées.");
        }
    };
    
    const handleEditClick = (date: string) => {
        setEditingLogDate(date);
        setEditedData(JSON.parse(JSON.stringify(dailyLogs[date]))); // deep copy
    };

    const handleModalClose = () => {
        setEditingLogDate(null);
        setEditedData(null);
    };

    const handleSaveChanges = () => {
        if (editingLogDate && editedData) {
            // If all sessions are deleted, and hydration is 0, and no supplements are checked, delete the log entirely
            const supplementsChecked = supplements.some(sup => editedData.supplementLog[sup.id]);
            if (editedData.sessions.length === 0 && editedData.hydration === 0 && !supplementsChecked) {
                 handleDeleteDayLog(false); // don't confirm again
            } else {
                setDailyLogs(prev => ({
                    ...prev,
                    [editingLogDate]: editedData
                }));
            }
            handleModalClose();
        }
    };
    
    const handleHydrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editedData) {
            setEditedData({ ...editedData, hydration: Number(e.target.value) || 0 });
        }
    };

    const handleSupplementLogChange = (supId: string, value: boolean) => {
        if (editedData) {
            const newSupplementLog = { ...editedData.supplementLog, [supId]: value };
            setEditedData({ ...editedData, supplementLog: newSupplementLog });
        }
    }
    
    const handleDeleteSession = (sessionId: string) => {
        if (editedData) {
            setEditedData({
                ...editedData,
                sessions: editedData.sessions.filter(s => s.id !== sessionId)
            });
        }
    };

    const handleDeleteDayLog = (confirm = true) => {
        const doDelete = () => {
            if (!editingLogDate) return;
            setDailyLogs(prev => {
                const newLogs = { ...prev };
                delete newLogs[editingLogDate];
                return newLogs;
            });
            handleModalClose();
        };

        if (confirm) {
            if (window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les données du ${formatDate(editingLogDate)} ? Cette action est irréversible.`)) {
                doDelete();
            }
        } else {
            doDelete();
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center" style={{fontFamily: "'Rajdhani', sans-serif"}}>Statistiques</h2>
      
      <CollapsibleCard title="Volume (kg) / 7 derniers jours">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#273349" />
            <XAxis dataKey="name" stroke="#9fb2d3" fontSize={12} />
            <YAxis stroke="#9fb2d3" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#121a28', border: '1px solid #273349' }} />
            <Bar dataKey="volume" fill="url(#colorVolume)" />
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b26bff" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6a8bff" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CollapsibleCard>

      <CollapsibleCard title="Distance Running (km) / 7 derniers jours">
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#273349" />
                <XAxis dataKey="name" stroke="#9fb2d3" fontSize={12} />
                <YAxis stroke="#9fb2d3" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#121a28', border: '1px solid #273349' }} />
                <Line type="monotone" dataKey="distance" stroke="#6a8bff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
      </CollapsibleCard>

      <CollapsibleCard title="Historique des entrées">
        {Object.keys(logDates).length > 0 ? (
          <Calendar
            logs={logDates}
            selectedDate={calendarDate}
            onDateSelect={handleEditClick}
            onMonthChange={setCalendarDate}
          />
        ) : <p className="text-dojo-text-muted text-center py-4">Aucune donnée enregistrée.</p>}
      </CollapsibleCard>

      <Button variant="secondary" onClick={handleReset} className="w-full bg-red-900/50 hover:bg-red-800/50">
        Réinitialiser les stats
      </Button>

      {editingLogDate && editedData && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <Card className="w-full max-w-md space-y-4 my-auto">
                <h3 className="font-bold text-lg">Modifier l'entrée du {formatDate(editingLogDate)}</h3>
                
                <div>
                    <h4 className="text-sm font-medium text-dojo-text-muted mb-2">Séances d'entraînement</h4>
                    <div className="max-h-32 overflow-y-auto pr-2 space-y-2">
                      {editedData.sessions.length > 0 ? (
                          editedData.sessions.map(session => (
                              <div key={session.id} className="flex items-center justify-between bg-dojo-bg-start p-2 rounded-lg">
                                  <span className="text-sm truncate pr-2">{session.programName}</span>
                                  <button 
                                      onClick={() => handleDeleteSession(session.id)} 
                                      className="p-1 text-dojo-text-muted hover:text-red-500 flex-shrink-0"
                                      aria-label={`Supprimer la séance ${session.programName}`}
                                  >
                                      <TrashIcon className="w-4 h-4" />
                                  </button>
                              </div>
                          ))
                      ) : (
                          <p className="text-sm text-dojo-text-muted text-center py-2">Aucune séance enregistrée.</p>
                      )}
                    </div>
                </div>

                <div>
                    <label htmlFor="hydration" className="block text-sm font-medium text-dojo-text-muted mb-1">Hydratation (ml)</label>
                    <input type="number" id="hydration" value={editedData.hydration} onChange={handleHydrationChange} className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue" />
                </div>
                
                <div>
                    <h4 className="text-sm font-medium text-dojo-text-muted mb-2">Compléments</h4>
                    <div className="space-y-2">
                        {supplements.map(sup => (
                           <div key={sup.id} className="flex items-center">
                               <input type="checkbox" id={`modal-sup-${sup.id}`} checked={!!editedData.supplementLog[sup.id]} onChange={e => handleSupplementLogChange(sup.id, e.target.checked)} className="h-4 w-4 rounded border-dojo-border bg-dojo-bg-start text-dojo-glow-blue focus:ring-dojo-glow-blue" />
                               <label htmlFor={`modal-sup-${sup.id}`} className="ml-2 text-dojo-text">{sup.name}</label>
                           </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button onClick={handleSaveChanges} className="flex-1 justify-center items-center gap-2"><CheckIcon className="w-5 h-5"/> Sauvegarder</Button>
                    <Button variant="secondary" onClick={handleModalClose} className="flex-1 justify-center items-center gap-2"><XMarkIcon className="w-5 h-5"/> Annuler</Button>
                </div>

                <div className="border-t border-dojo-border pt-4 mt-4">
                    <Button variant="secondary" onClick={() => handleDeleteDayLog()} className="w-full bg-red-900/50 hover:bg-red-800/50 !text-red-300">
                        Supprimer l'entrée de ce jour
                    </Button>
                </div>
            </Card>
        </div>
      )}

    </div>
  );
};

export default StatsPage;