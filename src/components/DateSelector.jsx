import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DateSelector = ({ value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [ano, setAno] = useState(parseInt(value.slice(0, 4)));
  const [mes, setMes] = useState(parseInt(value.slice(5, 7)));

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleAnterior = () => {
    const novaData = new Date(ano, mes - 2); // mes - 2 porque Date usa 0-11
    onChange(novaData.toISOString().slice(0, 7));
  };

  const handleProximo = () => {
    const novaData = new Date(ano, mes); // mes porque Date usa 0-11
    onChange(novaData.toISOString().slice(0, 7));
  };

  const handleSelecionarMes = (mesIndex) => {
    const novaMesStr = `${ano}-${String(mesIndex + 1).padStart(2, '0')}`;
    onChange(novaMesStr);
    setMes(mesIndex + 1);
    setShowPicker(false);
  };

  const handleSelecionarAno = (novoAno) => {
    setAno(novoAno);
  };

  const formatarData = (mesAno) => {
    const [a, m] = mesAno.split('-');
    return `${meses[parseInt(m) - 1]} de ${a}`;
  };

  return (
    <div className="relative">
      {/* Botão Principal - Estilo da Imagem */}
      <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <button
          onClick={handleAnterior}
          className="p-2 hover:bg-gray-700 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-lg transition-all min-h-[44px]"
        >
          <Calendar size={18} />
          <span className="font-semibold text-base">{formatarData(value)}</span>
        </button>

        <button
          onClick={handleProximo}
          className="p-2 hover:bg-gray-700 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Picker Completo */}
      {showPicker && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl shadow-2xl z-50 p-4 border border-gray-700">
          {/* Seletor de Ano */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => handleSelecionarAno(ano - 1)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-bold text-lg">{ano}</span>
              <button
                onClick={() => handleSelecionarAno(ano + 1)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Grid de Meses */}
            <div className="grid grid-cols-3 gap-2">
              {meses.map((nomeMes, index) => {
                const isAtual = index + 1 === mes && ano === parseInt(value.slice(0, 4));
                return (
                  <button
                    key={index}
                    onClick={() => handleSelecionarMes(index)}
                    className={`py-3 rounded-lg font-medium text-sm transition-all min-h-[44px] ${
                      isAtual
                        ? 'bg-blue-600 text-white scale-105'
                        : 'bg-gray-700 hover:bg-gray-600 active:scale-95'
                    }`}
                  >
                    {nomeMes.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botões Rápidos */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700">
            <button
              onClick={() => {
                const hoje = new Date();
                onChange(hoje.toISOString().slice(0, 7));
                setAno(hoje.getFullYear());
                setMes(hoje.getMonth() + 1);
                setShowPicker(false);
              }}
              className="py-2 px-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-sm font-medium transition-all text-green-400"
            >
              Hoje
            </button>
            <button
              onClick={() => {
                const mesPassado = new Date(ano, mes - 2);
                onChange(mesPassado.toISOString().slice(0, 7));
                setAno(mesPassado.getFullYear());
                setMes(mesPassado.getMonth() + 1);
                setShowPicker(false);
              }}
              className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-all"
            >
              Mês Passado
            </button>
            <button
              onClick={() => setShowPicker(false)}
              className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSelector;