import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_EXERCISES } from '../constants';
import { Program } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { parseWorkoutFromImage } from '../services/geminiService';
import { DocumentPlusIcon, PhotoIcon, TrashIcon, XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';

interface ProgramsPageProps {
    programs: Program[];
    setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
}

const ProgramsPage: React.FC<ProgramsPageProps> = ({ programs, setPrograms }) => {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const navigate = useNavigate();
    
    // State for creating new program
    const [newProgramName, setNewProgramName] = useState('');
    const [newProgramCategory, setNewProgramCategory] = useState('');

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            try {
                const newProgramData = await parseWorkoutFromImage(base64String, file.type);
                if (newProgramData) {
                    const fullProgram: Program = {
                        id: `prog-${Date.now()}`,
                        name: newProgramData.name || 'Imported Program',
                        mode: newProgramData.mode || 'series',
                        rounds: newProgramData.rounds,
                        restBetweenRoundsSec: newProgramData.restBetweenRoundsSec,
                        category: newProgramData.category || [],
                        equipment: newProgramData.equipment || [],
                        estDurationMin: newProgramData.estDurationMin || 30,
                        intensity: newProgramData.intensity || 3,
                        exercises: (newProgramData.exercises || []).map((ex: any) => ({
                            ...ex,
                            exerciseId: MOCK_EXERCISES.find(e => e.name.toLowerCase() === ex.name.toLowerCase())?.id || ex.exerciseId
                        }))
                    };
                    setPrograms(prev => [fullProgram, ...prev]);
                    alert('Programme importé avec succès! (Vérifiez les détails)');
                } else {
                     alert("Échec de l'importation. Le mode OCR local (Tesseract.js) serait utilisé ici si l'API Gemini n'est pas configurée.");
                }
            } catch (error) {
                 alert("Une erreur est survenue lors de l'importation.");
                 console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteProgram = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) {
            setPrograms(progs => progs.filter(p => p.id !== id));
        }
    };
    
    const handleCreateProgram = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProgramName.trim()) {
            alert("Veuillez donner un nom au programme.");
            return;
        }
        const newProgram: Program = {
            id: `prog-${Date.now()}`,
            name: newProgramName,
            mode: 'series',
            category: newProgramCategory.split(',').map(c => c.trim()).filter(Boolean),
            equipment: ['none'],
            estDurationMin: 20,
            intensity: 3,
            exercises: [
                { exerciseId: 'ex7', target: { reps: 10 }, sets: 3, restSec: 60 },
                { exerciseId: 'ex9', target: { reps: 15 }, sets: 3, restSec: 60 },
            ]
        };
        setPrograms(prev => [newProgram, ...prev]);
        setShowCreateForm(false);
        setNewProgramName('');
        setNewProgramCategory('');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center" style={{fontFamily: "'Rajdhani', sans-serif"}}>Entraînement</h2>
            
            <div className="flex gap-2">
                <Button className="flex-1 justify-center items-center gap-2" variant="secondary" onClick={() => setShowCreateForm(prev => !prev)}>
                    <DocumentPlusIcon className="w-5 h-5" /> Créer
                </Button>
                <Button className="flex-1 justify-center items-center gap-2" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                    <PhotoIcon className="w-5 h-5" />
                    {isLoading ? 'Analyse...' : 'Importer'}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
            </div>

            {showCreateForm && (
                <Card>
                    <form onSubmit={handleCreateProgram} className="space-y-4">
                        <div className="flex justify-between items-center">
                           <h3 className="text-lg font-bold">Nouveau Programme</h3>
                           <button type="button" onClick={() => setShowCreateForm(false)} className="p-1 text-dojo-text-muted hover:text-dojo-text">
                               <XMarkIcon className="w-6 h-6"/>
                           </button>
                        </div>
                        <div>
                            <label htmlFor="prog-name" className="block text-sm font-medium text-dojo-text-muted mb-1">Nom du programme</label>
                            <input
                                id="prog-name"
                                type="text"
                                value={newProgramName}
                                onChange={(e) => setNewProgramName(e.target.value)}
                                placeholder="Ex: Guerrier du Matin"
                                className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue"
                            />
                        </div>
                         <div>
                            <label htmlFor="prog-cat" className="block text-sm font-medium text-dojo-text-muted mb-1">Catégories (séparées par une virgule)</label>
                            <input
                                id="prog-cat"
                                type="text"
                                value={newProgramCategory}
                                onChange={(e) => setNewProgramCategory(e.target.value)}
                                placeholder="Ex: Full-Body, HIIT"
                                className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue"
                            />
                        </div>
                        <p className="text-xs text-dojo-text-muted">Les exercices pourront être ajoutés et modifiés sur la page de détails.</p>
                        <Button type="submit" className="w-full">Sauvegarder</Button>
                    </form>
                </Card>
            )}

            <div className="space-y-4">
                {programs.map(program => (
                    <Card key={program.id} className="group">
                        <div className="flex items-start justify-between">
                            <Link to={`/program/${program.id}`} className="flex-1 pr-4">
                                <h3 className="font-bold text-lg">{program.name}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dojo-text-muted mt-1">
                                    <span>{program.category.join(', ')}</span>
                                    <span>~{program.estDurationMin} min</span>
                                    <span>
                                        {[...new Set(program.exercises.flatMap(ex => MOCK_EXERCISES.find(e => e.id === ex.exerciseId)?.equipment || []))].join(', ')}
                                    </span>
                                </div>
                            </Link>
                            <div className="flex flex-col items-center gap-2">
                                 <Button onClick={() => navigate(`/workout/${program.id}`)} className="px-4 py-2 flex items-center justify-center">
                                    <PlayIcon className="w-6 h-6" />
                                </Button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteProgram(program.id); }} 
                                    className="p-1 text-dojo-text-muted hover:text-red-500"
                                    aria-label="Supprimer le programme"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProgramsPage;