import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const PeriodSelector = ({ value, onChange }) => {
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const changeMonth = (direction) => {
    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + direction);
    onChange(date.toISOString().slice(0, 7));
  };

  const quickSelect = (option) => {
    const now = new Date();
    let targetDate;

    switch (option) {
      case 'atual':
        targetDate = now;
        break;
      case 'anterior':
        targetDate = new Date(now.getFullYear(), now.getMonth() - 1);
        break;
      case 'proximo':
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1);
        break;
      default:
        targetDate = now;
    }

    onChange(targetDate.toISOString().slice(0, 7));
    setShowQuickSelect(false);
  };

  const formatDisplay = () => {
    const [year, month] = value.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-3">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Mês anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 relative">
          <button
            onClick={() => setShowQuickSelect(!showQuickSelect)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-700 rounded transition-colors"
          >
            <Calendar size={18} />
            <span className="font-medium capitalize">{formatDisplay()}</span>
          </button>

          {showQuickSelect && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
              <button
                onClick={() => quickSelect('anterior')}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors border-b border-gray-700"
              >
                📅 Mês Anterior
              </button>
              <button
                onClick={() => quickSelect('atual')}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors border-b border-gray-700"
              >
                📍 Mês Atual
              </button>
              <button
                onClick={() => quickSelect('proximo')}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors"
              >
                ⏭️ Próximo Mês
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Próximo mês"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
      />
    </div>
  );
};

export default PeriodSelector;