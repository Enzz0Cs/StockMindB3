import React from 'react';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Info } from 'lucide-react';
import { PriceProjection as PriceProjectionType } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PriceProjectionProps {
  projections: PriceProjectionType[];
  currentPrice: number;
}

export const PriceProjection: React.FC<PriceProjectionProps> = ({ projections, currentPrice }) => {
  if (!projections || projections.length === 0) return null;

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
          <Target size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Projeções de Preço (IA)</h3>
          <p className="text-sm text-slate-500">Estimativas baseadas em fundamentos e tendências</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projections.map((proj, idx) => {
          const upside = ((proj.expected / currentPrice) - 1) * 100;
          
          return (
            <motion.div 
              key={proj.timeframe}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                  Horizonte: {proj.timeframe}
                </span>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-bold",
                  upside >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {upside >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {upside >= 0 ? '+' : ''}{(upside ?? 0).toFixed(2)}%
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                    <TrendingUp size={14} className="text-emerald-500" />
                    Otimista
                  </div>
                  <span className="font-bold text-slate-700">R$ {(proj.high ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="relative py-2">
                  <div className="h-2 bg-slate-200 rounded-full w-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full"
                      style={{ 
                        width: '40%', 
                        marginLeft: '30%' 
                      }}
                    />
                  </div>
                  <div 
                    className="absolute top-0 w-1 h-6 bg-brand-600 rounded-full -translate-x-1/2 shadow-sm"
                    style={{ left: '50%' }}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-400">Pessimista</span>
                    <span className="text-[10px] font-bold text-brand-600">Alvo Esperado</span>
                    <span className="text-[10px] font-bold text-slate-400">Otimista</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                    <Target size={14} className="text-brand-500" />
                    Esperado
                  </div>
                  <span className="text-xl font-black text-slate-900">R$ {(proj.expected ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                    <TrendingDown size={14} className="text-rose-500" />
                    Pessimista
                  </div>
                  <span className="font-bold text-slate-700">R$ {(proj.low ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-200">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    "{proj.reasoning}"
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>AVISO:</strong> Projeções de preço são baseadas em modelos estatísticos e análise de sentimentos por IA. O mercado de ações é imprevisível e estas estimativas não garantem retornos futuros. Use como um dos muitos fatores em sua tomada de decisão.
        </p>
      </div>
    </div>
  );
};
