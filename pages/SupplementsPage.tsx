import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Supplement, DailyLog } from '../types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import { MinusIcon, PlusIcon, TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CollapsibleCard from '../components/ui/CollapsibleCard';

interface SupplementsPageProps {
    supplements: Supplement[];
    setSupplements: React.Dispatch<React.SetStateAction<Supplement[]>>;
    dailyLogs: Record<string, DailyLog>;
    setDailyLogs: React.Dispatch<React.SetStateAction<Record<string, DailyLog>>>;
}

const SupplementsPage: React.FC<SupplementsPageProps> = ({ supplements, setSupplements, dailyLogs, setDailyLogs }) => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const today = getTodayDateString();

  const todayLog = dailyLogs[today] || { 
    date: today, 
    sessions: [], 
    hydration: 0, 
    supplementLog: supplements.reduce((acc, sup) => ({ ...acc, [sup.id]: false }), {})
  };

  // --- Hydration State ---
  const hydrationGoal = 3000;
  const currentHydration = todayLog.hydration;
  const hydrationProgress = Math.min((currentHydration / hydrationGoal) * 100, 100);
  const goalReached = currentHydration >= hydrationGoal;

  const updateTodayLog = (updatedLog: Partial<DailyLog>) => {
      setDailyLogs(prev => ({
          ...prev,
          [today]: { ...todayLog, ...updatedLog }
      }));
  };

  const handleAddWater = (amount: number) => {
    updateTodayLog({ hydration: currentHydration + amount });
  };

  const handleRemoveWater = (amount: number) => {
    updateTodayLog({ hydration: Math.max(0, currentHydration - amount) });
  };


  // --- Supplements State ---
  const [streak, setStreak] = useState(3);
  
  const [newSupName, setNewSupName] = useState('');
  const [newSupDosage, setNewSupDosage] = useState('');
  const [newSupTime, setNewSupTime] = useState('Matin');
  
  const [editingSupplementId, setEditingSupplementId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', dosage: '', time: '' });

  const handleToggle = (supplementId: string) => {
    const newSupplementLog = {
      ...todayLog.supplementLog,
      [supplementId]: !todayLog.supplementLog[supplementId]
    };
    updateTodayLog({ supplementLog: newSupplementLog });
  };
  
  const handleDeleteSupplement = (id: string) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce complément ?")) {
          setSupplements(supps => supps.filter(s => s.id !== id));
          setDailyLogs(prevLogs => {
              const newLogs = { ...prevLogs };
              for (const date in newLogs) {
                  delete newLogs[date].supplementLog[id];
              }
              return newLogs;
          });
      }
  };

  const handleAddSupplement = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSupName.trim() || !newSupDosage.trim()) {
          alert("Veuillez remplir le nom et le dosage.");
          return;
      }
      const newSupplement: Supplement = {
          id: `sup-${Date.now()}`,
          name: newSupName,
          dosage: newSupDosage,
          time: newSupTime,
      };
      setSupplements(prev => [...prev, newSupplement]);
      
      setNewSupName('');
      setNewSupDosage('');
      setNewSupTime('Matin');
  };
  
  const handleEditClick = (supplement: Supplement) => {
    setEditingSupplementId(supplement.id);
    setEditFormData({
        name: supplement.name,
        dosage: supplement.dosage,
        time: supplement.time,
    });
  };

  const handleCancelEdit = () => {
    setEditingSupplementId(null);
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSupplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplementId) return;
    
    setSupplements(supps => supps.map(s => 
        s.id === editingSupplementId ? { ...s, ...editFormData } : s
    ));
    setEditingSupplementId(null);
  };

  const allTaken = supplements.length > 0 && supplements.every(s => todayLog.supplementLog[s.id]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center" style={{fontFamily: "'Rajdhani', sans-serif"}}>Suivi Quotidien</h2>

      <CollapsibleCard title="Hydratation">
        <div className="text-center mb-4">
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-dojo-glow-violet to-dojo-glow-blue">{currentHydration}<span className="text-lg text-dojo-text-muted"> / {hydrationGoal} ml</span></p>
            {goalReached && <p className="text-sm text-dojo-glow-blue mt-1">+15 XP Objectif atteint!</p>}
        </div>
        <ProgressBar progress={hydrationProgress} />
        <div className="flex items-center justify-between gap-3 mt-4">
            <button 
                onClick={() => handleRemoveWater(250)} 
                className="bg-dojo-border rounded-full p-2 text-dojo-text-muted hover:bg-opacity-80 transition-colors h-10 w-10 flex-shrink-0 flex items-center justify-center"
                aria-label="Remove 250ml"
            >
                <MinusIcon className="w-6 h-6" />
            </button>
            <div className="flex-grow flex gap-2">
                <Button onClick={() => handleAddWater(250)} variant="secondary" className="flex-1">+250 ml</Button>
                <Button onClick={() => handleAddWater(500)} variant="secondary" className="flex-1">+500 ml</Button>
            </div>
            <button 
                onClick={() => handleAddWater(100)} 
                className="bg-dojo-border rounded-full p-2 text-dojo-text-muted hover:bg-opacity-80 transition-colors h-10 w-10 flex-shrink-0 flex items-center justify-center"
                aria-label="Add 100ml"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
      </CollapsibleCard>
      
      <div className="space-y-4">
         <div className="flex justify-between items-center px-1 mt-4">
             <h3 className="text-xl font-bold" style={{fontFamily: "'Rajdhani', sans-serif"}}>Compléments</h3>
             <div className="text-center">
                <p className="text-xs text-dojo-text-muted">Série</p>
                <p className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-dojo-glow-violet to-dojo-glow-blue">{streak}j</p>
             </div>
         </div>
        {allTaken && <p className="text-sm text-center text-dojo-glow-blue -mt-2">+5 XP pour aujourd'hui !</p>}

        {supplements.map(sup => (
          <Card key={sup.id} className="relative group transition-all">
            {editingSupplementId === sup.id ? (
                <form onSubmit={handleUpdateSupplement} className="space-y-3">
                    <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue font-bold text-lg" />
                    <div className="flex gap-2">
                        <input type="text" name="dosage" value={editFormData.dosage} onChange={handleEditFormChange} placeholder="Dosage" className="w-1/2 bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue" />
                        <select name="time" value={editFormData.time} onChange={handleEditFormChange} className="w-1/2 bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue">
                            <option>Matin</option>
                            <option>Déjeuner</option>
                            <option>Soir</option>
                        </select>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Button type="submit" className="flex-1 items-center justify-center gap-2"><CheckIcon className="w-5 h-5"/> Sauvegarder</Button>
                        <Button type="button" variant="secondary" onClick={handleCancelEdit} className="flex-1 items-center justify-center gap-2"><XMarkIcon className="w-5 h-5"/> Annuler</Button>
                    </div>
              </form>
            ) : (
             <>
                <div className="flex justify-between items-start">
                  <div className="pr-16">
                    <h3 className="font-bold text-lg">{sup.name}</h3>
                    <p className="text-sm text-dojo-text-muted">{sup.dosage} - {sup.time}</p>
                    {sup.notes && <p className="text-xs italic text-dojo-text-muted mt-1">{sup.notes}</p>}
                  </div>
                  <button onClick={() => handleToggle(sup.id)} className="p-2 flex-shrink-0">
                    {todayLog.supplementLog[sup.id] ? (
                      <CheckCircleIcon className="w-8 h-8 text-dojo-glow-blue" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-dojo-border bg-dojo-bg-start"></div>
                    )}
                  </button>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(sup)} className="p-1 text-dojo-text-muted hover:text-dojo-glow-blue" aria-label="Modifier le complément"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteSupplement(sup.id)} className="p-1 text-dojo-text-muted hover:text-red-500" aria-label="Supprimer le complément"><TrashIcon className="w-5 h-5" /></button>
                </div>
             </>
            )}
          </Card>
        ))}
        
        <CollapsibleCard title="Ajouter un complément" initialOpen={false}>
            <form onSubmit={handleAddSupplement} className="space-y-3">
                <input type="text" value={newSupName} onChange={e => setNewSupName(e.target.value)} placeholder="Nom (ex: Vitamine D3)" className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue" />
                <div className="flex gap-2">
                    <input type="text" value={newSupDosage} onChange={e => setNewSupDosage(e.target.value)} placeholder="Dosage" className="w-1/2 bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue" />
                    <select value={newSupTime} onChange={e => setNewSupTime(e.target.value)} className="w-1/2 bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue">
                        <option>Matin</option>
                        <option>Déjeuner</option>
                        <option>Soir</option>
                    </select>
                </div>
                <Button type="submit" className="w-full">Ajouter</Button>
            </form>
        </CollapsibleCard>

      </div>
    </div>
  );
};

export default SupplementsPage;
