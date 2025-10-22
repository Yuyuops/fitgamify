import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface CalendarProps {
  logs: Record<string, boolean>;
  selectedDate: Date;
  onDateSelect: (date: string) => void;
  onMonthChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ logs, selectedDate, onDateSelect, onMonthChange }) => {
  
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  const prevMonth = () => onMonthChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const nextMonth = () => onMonthChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

  const days = [];
  let startDay = startOfMonth.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1; // Monday is 0, Sunday is 6

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`pad-start-${i}`} className="p-2"></div>);
  }

  for (let day = 1; day <= endOfMonth.getDate(); day++) {
    const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    const dateString = currentDate.toISOString().split('T')[0];
    const hasLog = logs[dateString];
    
    const isToday = new Date().toISOString().split('T')[0] === dateString;

    const classNames = [
      'w-10 h-10 flex items-center justify-center rounded-full transition-colors',
      hasLog ? 'bg-dojo-glow-blue/30 text-dojo-text cursor-pointer hover:bg-dojo-glow-blue/50' : 'text-dojo-text-muted',
      isToday ? 'border-2 border-dojo-glow-violet' : '',
      !hasLog ? 'cursor-not-allowed' : ''
    ].join(' ');

    days.push(
      <div key={day} className="flex justify-center items-center">
        <button
          onClick={() => hasLog && onDateSelect(dateString)}
          className={classNames}
          disabled={!hasLog}
          aria-label={hasLog ? `Voir les données du ${day}` : `Pas de données pour le ${day}`}
        >
          {day}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-dojo-border" aria-label="Mois précédent">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h4 className="font-bold text-lg capitalize">
          {selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h4>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-dojo-border" aria-label="Mois suivant">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {daysOfWeek.map(day => (
          <div key={day} className="text-xs font-bold text-dojo-text-muted">{day}</div>
        ))}
        {days}
      </div>
    </div>
  );
};

export default Calendar;
