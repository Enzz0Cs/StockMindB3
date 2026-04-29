import React from 'react';
import { motion } from 'motion/react';
import { Calculator, Target, Info, ShieldCheck } from 'lucide-react';
import { AIAnalysis, StockData } from '../types';
import { cn } from '../lib/utils';

interface ValuationCardProps {
  valuation: AIAnalysis['valuation'];
  stockData: StockData;
}

export const ValuationCard: React.FC<ValuationCardProps> = ({ valuation, stockData }) => {
  const currentPrice = stockData.price;

  const getDiscount = (fairValue: number) => {
    const discount = ((fairValue - currentPrice) / fairValue) * 100;
    return discount;
  };

  const renderMetric = (label: string, value: number, icon: React.ReactNode, description: string) => {
    const discount = getDiscount(value);
    const isUnderpriced = currentPrice < value;

    return (
      <div className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              {icon}
            </div>
            <span className="font-bold text-slate-800">{label}</span>
          </div>
          <div className={cn(
            "text-xs font-black px-2 py-1 rounded-md",
            isUnderpriced ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}>
            {isUnderpriced ? 'DESCONTO' : 'PREMIUM'}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900">
            R$ {(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className={cn(
            "text-sm font-bold",
            isUnderpriced ? "text-emerald-600" : "text-rose-600"
          )}>
            ({discount > 0 ? '+' : ''}{(discount ?? 0).toFixed(2)}%)
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed italic">
          {description}
        </p>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      <div className="flex items-center gap-2 mb-8">
        <Target className="w-6 h-6 text-brand-600" />
        <h3 className="text-xl font-bold text-slate-900">Valuation de Ativos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {renderMetric(
          "Graham", 
          valuation.grahamValue, 
          <Calculator size={18} />, 
          "Baseado no valor intrínseco (LPA e VPA). Ideal para empresas de valor."
        )}
        {renderMetric(
          "Bazin", 
          valuation.bazinValue, 
          <ShieldCheck size={18} />, 
          "Preço teto para garantir um dividend yield de no mínimo 6% ao ano."
        )}
        {renderMetric(
          "Fair Value", 
          valuation.fairValue, 
          <Target size={18} />, 
          "Preço justo ponderado pelo StockMind considerando múltiplos e cenário."
        )}
      </div>

      <div className="p-6 bg-brand-50/50 rounded-2xl border border-brand-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-brand-600 text-white rounded-xl mt-1 shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-bold text-brand-900 mb-1 text-lg">Análise de Margem de Segurança</h4>
            <p className="text-brand-800/80 leading-relaxed">
              {valuation.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
