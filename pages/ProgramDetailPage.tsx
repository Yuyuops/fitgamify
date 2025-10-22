import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Program, ProgramExercise } from '../types';
import { MOCK_EXERCISES } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ProgramDetailPageProps {
    allPrograms: Program[];
    updateProgram: (program: Program) => void;
}

const ProgramDetailPage: React.FC<ProgramDetailPageProps> = ({ allPrograms, updateProgram }) => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();
    
    const [program, setProgram] = useState<Program | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const foundProgram = allPrograms.find(p => p.id === programId);
        if (foundProgram) {
            setProgram(JSON.parse(JSON.stringify(foundProgram))); // Deep copy for editing
        } else {
            // Handle not found case
        }
    }, [programId, allPrograms]);

    if (!program) {
        return <div className="text-center">Programme non trouvé.</div>;
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProgram(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleExerciseChange = (index: number, field: keyof ProgramExercise | keyof ProgramExercise['target'], value: any) => {
        if (!program) return;
        
        const newExercises = [...program.exercises];
        const exercise = { ...newExercises[index] };

        if (field === 'reps' || field === 'timeSec') {
            exercise.target = { ...exercise.target, [field]: Number(value) || 0 };
        } else if (field === 'exerciseId') {
             exercise[field] = value;
        } else {
            (exercise as any)[field] = Number(value) || 0;
        }
        
        newExercises[index] = exercise;
        setProgram({ ...program, exercises: newExercises });
    };
    
    const addExercise = () => {
        if (!program) return;
        const newExercise: ProgramExercise = {
            exerciseId: MOCK_EXERCISES[0].id,
            target: { reps: 10 },
            sets: 3,
            restSec: 60
        };
        setProgram({ ...program, exercises: [...program.exercises, newExercise] });
    };

    const removeExercise = (index: number) => {
        if (!program) return;
        const newExercises = program.exercises.filter((_, i) => i !== index);
        setProgram({ ...program, exercises: newExercises });
    };

    const handleSaveChanges = () => {
        if (program) {
            updateProgram(program);
            setIsEditing(false);
            navigate('/programs');
        }
    };
    
    const getExerciseName = (id: string) => MOCK_EXERCISES.find(ex => ex.id === id)?.name || 'Exercice inconnu';

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 text-dojo-text-muted hover:text-dojo-text">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold" style={{fontFamily: "'Rajdhani', sans-serif"}}>{program.name}</h2>
            </div>

            {isEditing ? (
                 <Card>
                    <div className="space-y-2">
                       <label className="text-sm text-dojo-text-muted">Nom du Programme</label>
                        <input 
                            type="text"
                            name="name"
                            value={program.name}
                            onChange={handleInputChange}
                            className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-2"
                        />
                    </div>
                 </Card>
            ) : null}

            <h3 className="text-xl font-bold pt-4" style={{fontFamily: "'Rajdhani', sans-serif"}}>Exercices</h3>
            
            <div className="space-y-3">
            {program.exercises.map((ex, index) => (
                <Card key={index}>
                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <select 
                                    value={ex.exerciseId}
                                    onChange={(e) => handleExerciseChange(index, 'exerciseId', e.target.value)}
                                    className="flex-grow bg-dojo-bg-start border border-dojo-border rounded-lg p-2 font-bold"
                                >
                                {MOCK_EXERCISES.map(mockEx => <option key={mockEx.id} value={mockEx.id}>{mockEx.name}</option>)}
                                </select>
                                <button onClick={() => removeExercise(index)}>
                                    <TrashIcon className="w-5 h-5 text-red-500"/>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                {program.mode === 'series' && <div><label className="text-xs text-dojo-text-muted">Sets</label><input type="number" value={ex.sets || ''} onChange={e => handleExerciseChange(index, 'sets', e.target.value)} className="w-full bg-dojo-bg-start border border-dojo-border rounded p-1"/></div>}
                                <div><label className="text-xs text-dojo-text-muted">Reps</label><input type="number" value={ex.target.reps || ''} onChange={e => handleExerciseChange(index, 'reps', e.target.value)} className="w-full bg-dojo-bg-start border border-dojo-border rounded p-1"/></div>
                                <div><label className="text-xs text-dojo-text-muted">Temps (s)</label><input type="number" value={ex.target.timeSec || ''} onChange={e => handleExerciseChange(index, 'timeSec', e.target.value)} className="w-full bg-dojo-bg-start border border-dojo-border rounded p-1"/></div>
                                <div><label className="text-xs text-dojo-text-muted">Repos (s)</label><input type="number" value={ex.restSec || ''} onChange={e => handleExerciseChange(index, 'restSec', e.target.value)} className="w-full bg-dojo-bg-start border border-dojo-border rounded p-1"/></div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="font-bold">{getExerciseName(ex.exerciseId)}</h4>
                            <p className="text-sm text-dojo-text-muted">
                                {program.mode === 'series' && `${ex.sets} sets de `}
                                {ex.target.reps ? `${ex.target.reps} reps` : `${ex.target.timeSec}s`}
                                {ex.restSec && `, ${ex.restSec}s repos`}
                            </p>
                        </div>
                     )}
                </Card>
            ))}
            </div>

            {isEditing && (
                <Button variant="secondary" onClick={addExercise} className="w-full flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5"/> Ajouter un exercice
                </Button>
            )}

            <div className="mt-6">
                {isEditing ? (
                    <Button onClick={handleSaveChanges} className="w-full">Sauvegarder les changements</Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)} className="w-full">Modifier le programme</Button>
                )}
            </div>
        </div>
    );
};

export default ProgramDetailPage;