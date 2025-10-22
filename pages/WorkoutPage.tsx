import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Program, Session, DailyLog } from '../types';
import { MOCK_EXERCISES } from '../constants';
import { PlayIcon, PauseIcon, ForwardIcon, StopIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';

interface WorkoutPageProps {
    programs: Program[];
    setDailyLogs: React.Dispatch<React.SetStateAction<Record<string, DailyLog>>>;
}

const WorkoutPage: React.FC<WorkoutPageProps> = ({ programs, setDailyLogs }) => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();
    
    const program = useMemo(() => programs.find(p => p.id === programId), [programId, programs]);

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [currentRound, setCurrentRound] = useState(1);
    const [status, setStatus] = useState<'idle' | 'working' | 'resting' | 'finished'>('idle');
    const [timer, setTimer] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const currentExercise = program?.exercises[currentExerciseIndex];
    const isTimedExercise = (currentExercise?.target.timeSec ?? 0) > 0;

    const logSession = () => {
        if (!program) return;
        const getTodayDateString = () => new Date().toISOString().split('T')[0];
        const today = getTodayDateString();
        const newSession: Session = {
            id: `sess-${Date.now()}`,
            programName: program.name,
            date: new Date(),
            xpGained: 150, // mock
            totalVolumeKg: program.category.includes('Running') ? undefined : Math.floor(Math.random() * 1000 + 1000),
            distanceKm: program.category.includes('Running') ? 5 : undefined,
        };
        setDailyLogs(prev => {
            const todayLog = prev[today] || { date: today, sessions: [], hydration: 0, supplementLog: {} };
            return {
                ...prev,
                [today]: {
                    ...todayLog,
                    sessions: [...todayLog.sessions, newSession]
                }
            };
        });
        setIsFinished(true);
    }

    useEffect(() => {
        let interval: number | undefined;
        if ((status === 'working' || status === 'resting') && timer > 0) {
            interval = window.setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && (status === 'working' || status === 'resting')) {
            handleNextStep();
        }
        return () => clearInterval(interval);
    }, [status, timer]);

    const handleNextStep = () => {
        if (isFinished) return;
        setStatus('idle');
        
        if (!program || !currentExercise) return;

        if (status === 'working') {
             // Finished work, now rest
            const restTime = currentExercise.restSec || 10;
            if(restTime > 0) {
                setTimer(restTime);
                setStatus('resting');
                return;
            }
        }

        // Finished resting or manual next
        if (program.mode === 'series') {
            const totalSets = currentExercise.sets || 1;
            if (currentSet < totalSets) {
                setCurrentSet(prev => prev + 1);
                 startWorkout(false); // start next set immediately
            } else {
                setCurrentSet(1);
                if (currentExerciseIndex < program.exercises.length - 1) {
                    setCurrentExerciseIndex(prev => prev + 1);
                } else {
                    setStatus('finished');
                    logSession();
                }
            }
        } else { // 'sets' mode (rounds)
             if (currentExerciseIndex < program.exercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
                startWorkout(false); // start next exercise
             } else { // end of round
                if (currentRound < (program.rounds || 1)) {
                    setCurrentRound(prev => prev + 1);
                    setCurrentExerciseIndex(0);
                    // Round rest
                     setTimer(program.restBetweenRoundsSec || 30);
                     setStatus('resting');

                } else {
                    setStatus('finished');
                    logSession();
                }
             }
        }
    };
    
    const startWorkout = (isFirstStart = true) => {
        if(!isFirstStart) {
            const nextExercise = program?.exercises[currentExerciseIndex];
             if (nextExercise?.target.timeSec) {
                setTimer(nextExercise.target.timeSec);
                setStatus('working');
            } else {
                setStatus('working');
            }
            return;
        }

        if (!currentExercise) return;
        if (isTimedExercise) {
            setTimer(currentExercise.target.timeSec!);
            setStatus('working');
        } else {
            setStatus('working'); // For rep-based exercises, no timer
        }
    };
    
    const handlePause = () => setStatus('idle');

    if (!program) {
        return <div className="text-center">Programme non trouvé. <Button onClick={() => navigate('/programs')}>Retour</Button></div>;
    }
    const currentExerciseDef = program?.exercises[currentExerciseIndex];

    const getExerciseName = (id: string) => MOCK_EXERCISES.find(ex => ex.id === id)?.name || 'Exercice inconnu';
    
    const totalExercisesInRound = program.exercises.length;

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col justify-between text-center p-4">
             <div className="absolute top-4 left-4">
                <button onClick={() => navigate(-1)} className="p-2 text-dojo-text-muted hover:text-dojo-text">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div>
                 <h2 className="text-2xl font-bold" style={{fontFamily: "'Rajdhani', sans-serif"}}>{program.name}</h2>
                 {program.mode === 'sets' && <p className="text-dojo-text-muted">Round {currentRound}/{program.rounds}</p>}
                 <p className="text-dojo-text-muted">Exercice {currentExerciseIndex + 1}/{totalExercisesInRound}</p>
            </div>
            
            <div className="my-8">
                {status === 'finished' ? (
                    <>
                        <h3 className="text-4xl font-bold text-dojo-glow-blue">Terminé !</h3>
                        <p className="mt-2 text-lg">+150 XP gagnés</p>
                    </>
                ) : status === 'resting' ? (
                     <>
                        <h3 className="text-4xl font-bold text-dojo-glow-violet">Repos</h3>
                        <p className="text-8xl font-bold my-4">{timer}</p>
                        <p className="text-lg text-dojo-text-muted">Prochain : {getExerciseName(program.exercises[(currentExerciseIndex + 1) % totalExercisesInRound]?.exerciseId)}</p>
                     </>
                ) : (
                    <>
                        <h3 className="text-3xl md:text-4xl font-bold">{getExerciseName(currentExerciseDef.exerciseId)}</h3>
                        {program.mode === 'series' && <p className="text-xl text-dojo-text-muted">Set {currentSet}/{currentExerciseDef.sets}</p>}
                        
                        <div className="text-8xl font-bold my-4 text-dojo-glow-blue">
                             {isTimedExercise ? timer : currentExerciseDef.target.reps}
                        </div>
                        <p className="text-2xl">{isTimedExercise ? 'secondes' : 'reps'}</p>
                    </>
                )}
            </div>

            <div>
                {status === 'finished' ? (
                     <Button onClick={() => navigate('/')} className="w-full">Retour au Dojo</Button>
                ) : status === 'idle' ? (
                     <Button onClick={()=>startWorkout()} className="w-full py-4 text-lg">
                        <PlayIcon className="w-8 h-8 inline-block mr-2" /> Démarrer
                     </Button>
                ) : status === 'working' ? (
                    <div className="flex gap-4">
                        <Button onClick={handlePause} variant="secondary" className="flex-1 py-4">
                            <PauseIcon className="w-8 h-8" />
                        </Button>
                        <Button onClick={handleNextStep} className="flex-1 py-4">
                            <ForwardIcon className="w-8 h-8" />
                        </Button>
                    </div>
                ) : ( // Resting
                    <Button onClick={handleNextStep} className="w-full py-4">
                         Passer le repos <ForwardIcon className="w-6 h-6 inline-block ml-2"/>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default WorkoutPage;
