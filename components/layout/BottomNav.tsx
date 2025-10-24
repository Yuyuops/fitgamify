import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BoltIcon,
  BeakerIcon,
  ChartBarIcon,
  SparklesIcon,
  BookOpenIcon, // ✅ on utilise ça pour le Journal
} from '@heroicons/react/24/solid';

const BottomNav: React.FC = () => {
  const base = "flex flex-col items-center justify-center gap-1 text-xs";
  const active = "text-white";
  const inactive = "text-dojo-text-muted";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dojo-panel border-t border-dojo-border py-2 z-50">
      <div className="mx-auto max-w-3xl grid grid-cols-5">
        <NavLink to="/" className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
          <HomeIcon className="w-6 h-6" />
          <span>Dojo</span>
        </NavLink>

        <NavLink to="/training" className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
          <BoltIcon className="w-6 h-6" />
          <span>Training</span>
        </NavLink>

        {/* ✅ Journal */}
        <NavLink to="/journal" className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
          <BookOpenIcon className="w-6 h-6" />
          <span>Journal</span>
        </NavLink>

        <NavLink to="/stats" className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
          <ChartBarIcon className="w-6 h-6" />
          <span>Stats</span>
        </NavLink>

        <NavLink to="/coach" className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
          <SparklesIcon className="w-6 h-6" />
          <span>Sensei</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
