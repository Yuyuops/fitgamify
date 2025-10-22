import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { validateApiKey } from '../services/openaiService';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

type KeyStatus = 'idle' | 'checking' | 'valid' | 'invalid';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<KeyStatus>('idle');

    useEffect(() => {
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey) {
            setApiKey(storedKey);
            setStatus(localStorage.getItem('openai_api_key_status') as KeyStatus || 'idle');
        }
    }, []);
    
    const handleSaveAndValidate = async () => {
        setStatus('checking');
        const isValid = await validateApiKey(apiKey);
        if (isValid) {
            localStorage.setItem('openai_api_key', apiKey);
            localStorage.setItem('openai_api_key_status', 'valid');
            setStatus('valid');
        } else {
            localStorage.removeItem('openai_api_key');
            localStorage.removeItem('openai_api_key_status');
            setStatus('invalid');
        }
    };

    const handleRemoveKey = () => {
        setApiKey('');
        setStatus('idle');
        localStorage.removeItem('openai_api_key');
        localStorage.removeItem('openai_api_key_status');
    };
    
    const statusInfo = {
        idle: { text: "Aucune clé configurée. Le Sensei utilisera Gemini.", color: "text-dojo-text-muted" },
        checking: { text: "Vérification en cours...", color: "text-yellow-400" },
        valid: { text: "Clé OpenAI valide et active. Le Sensei utilisera ChatGPT.", color: "text-green-400", icon: <CheckCircleIcon className="w-5 h-5" /> },
        invalid: { text: "Clé OpenAI invalide.", color: "text-red-400", icon: <XCircleIcon className="w-5 h-5" /> },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 text-dojo-text-muted hover:text-dojo-text">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-center" style={{fontFamily: "'Rajdhani', sans-serif"}}>Paramètres</h2>
            </div>

            <Card>
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">Configuration du Sensei AI</h3>
                    <p className="text-sm text-dojo-text-muted">
                        Par défaut, le Sensei utilise le modèle Gemini de Google. Vous pouvez optionnellement utiliser l'API OpenAI (ChatGPT) en fournissant votre propre clé.
                    </p>
                    <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-dojo-text-muted mb-1">Clé API OpenAI</label>
                        <input
                            id="api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setStatus('idle'); // Reset status on change
                            }}
                            placeholder="sk-..."
                            className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-2 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue"
                        />
                    </div>
                    
                    <div className={`flex items-center gap-2 text-sm ${statusInfo[status].color}`}>
                        {/* FIX: Conditionally render icon only if it exists for the current status to prevent type errors. */}
                        {'icon' in statusInfo[status] && statusInfo[status].icon}
                        <span>{statusInfo[status].text}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                         <Button onClick={handleSaveAndValidate} className="flex-1" disabled={status === 'checking' || !apiKey}>
                            {status === 'checking' ? 'Validation...' : 'Valider & Sauvegarder'}
                        </Button>
                        {apiKey && <Button onClick={handleRemoveKey} variant="secondary" className="flex-1">Supprimer la clé</Button>}
                    </div>
                    <p className="text-xs text-dojo-text-muted pt-2">Votre clé API est stockée uniquement dans votre navigateur et n'est jamais envoyée à nos serveurs.</p>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;