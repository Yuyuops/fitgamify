import React, { useState } from 'react';
import Card from './Card';
import { ChevronUpIcon } from '@heroicons/react/24/solid';

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  initialOpen?: boolean;
  className?: string;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ title, children, initialOpen = true, className }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <Card className={`transition-all duration-300 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
        aria-expanded={isOpen}
      >
        <h3 className="font-bold text-lg">{title}</h3>
        <ChevronUpIcon
          className={`w-6 h-6 text-dojo-text-muted transition-transform duration-300 ${
            isOpen ? 'transform rotate-0' : 'transform rotate-180'
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out grid ${
          isOpen ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'
        }`}
        style={{ transitionProperty: 'grid-template-rows, padding, opacity' }}
      >
        <div className="overflow-hidden">
            {children}
        </div>
      </div>
    </Card>
  );
};

export default CollapsibleCard;
