import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MOTIVATIONAL_QUOTES } from '../../constants';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  return (
    <header className="p-4 text-center relative">
       <h1 className="text-3xl font-bold text-dojo-text" style={{fontFamily: "'Rajdhani', sans-serif"}}>FitGamify</h1>
      <p className="text-sm text-dojo-text-muted italic mt-1">"{quote}"</p>
      <div className="absolute top-4 right-4">
        <Link to="/settings" className="text-dojo-text-muted hover:text-dojo-text p-2">
            <Cog6ToothIcon className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
