import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Calendar, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface DividendCalculatorProps {
  initialTicker?: string;
  initialPrice?: number;
  initialYield?: string;
}

export const DividendCalculator: React.FC<DividendCalculatorProps> = ({ 
  initialTicker = '', 
  initialPrice = 0, 
  initialYield = '0%' 
}) => {
  const [ticker, setTicker] = useState(initialTicker);
  const [shares, setShares] = useState<number>(100);
  const [price, setPrice] = useState<number>(initialPrice);
  const [yieldPercent, setYieldPercent] = useState<number>(0);
  const [years, setYears] = useState<number>(1);

  useEffect(() => {
    setTicker(initialTicker);
    setPrice(initialPrice);
    const numericYield = parseFloat(initialYield.replace('%', '').replace(',', '.')) || 0;
    setYieldPercent(numericYield);
  }, [initialTicker, initialPrice, initialYield]);

  const calculateDividends = () => {
    const annualDividendPerShare = (price * yieldPercent) / 100;
    const annualTotal = annualDividendPerShare * shares;
    const periodTotal = annualTotal * years;
    const yieldOnCost = price > 0 ? (annualDividendPerShare / price) * 100 : 0;

    return {
      annualTotal,
      periodTotal,
      yieldOnCost,
      dividendPerShare: annualDividendPerShare
    };
  };

  const results = calculateDividends();

  return (
    <div className="glass-card p-8 h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
          <Calculator size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Calculadora de Dividendos</h3>
          <p className="text-sm text-slate-500">Projete sua renda passiva com B3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ticker da Ação</label>
            <input 
              type="text" 
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
              placeholder="Ex: PETR4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Qtd. de Ações</label>
              <input 
                type="number" 
                value={shares}
                onChange={(e) => setShares(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preço Médio (R$)</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dividend Yield (%)</label>
              <input 
                type="number" 
                value={yieldPercent}
                onChange={(e) => setYieldPercent(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Período (Anos)</label>
              <select 
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700 appearance-none"
              >
                <option value={1}>1 Ano</option>
                <option value={5}>5 Anos</option>
                <option value={10}>10 Anos</option>
                <option value={20}>20 Anos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Renda Estimada ({years} {years === 1 ? 'ano' : 'anos'})</span>
              <div className="text-3xl font-black text-emerald-600">
                R$ {results.periodTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Anual</span>
                <span className="text-sm font-bold text-slate-700">R$ {results.annualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mensal (Méd.)</span>
                <span className="text-sm font-bold text-slate-700">R$ {(results.annualTotal / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Dividendo por Ação (Anual)</span>
                <span className="font-bold text-slate-700 text-sm">R$ {results.dividendPerShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Yield on Cost</span>
                <span className="font-bold text-slate-700 text-sm">{results.yieldOnCost.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 flex items-start gap-2">
            <Info size={14} className="text-slate-400 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-tight">
              Esta projeção assume que o Dividend Yield e o preço médio permanecem constantes. Dividendos passados não garantem rendimentos futuros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
