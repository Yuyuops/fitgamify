import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BoltIcon, ChartBarIcon, ClipboardDocumentListIcon, SparklesIcon } from '@heroicons/react/24/outline';

const navItems = [
  { path: '/', label: 'Dojo', icon: HomeIcon },
  { path: '/programs', label: 'Training', icon: BoltIcon },
  { path: '/supplements', label: 'Suivi', icon: ClipboardDocumentListIcon },
  { path: '/stats', label: 'Stats', icon: ChartBarIcon },
  { path: '/coach', label: 'Sensei', icon: SparklesIcon },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dojo-card border-t border-dojo-border z-50">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs transition-colors duration-200 ${
                isActive ? 'text-dojo-glow-blue' : 'text-dojo-text-muted hover:text-dojo-text'
              }`
            }
          >
            <Icon className="h-6 w-6 mb-1" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;