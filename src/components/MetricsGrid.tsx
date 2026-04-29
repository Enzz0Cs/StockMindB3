import React from 'react';
import { StockData } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Activity, 
  Percent, 
  Wallet, 
  Briefcase, 
  ArrowDownCircle, 
  Calculator,
  Target
} from 'lucide-react';

interface MetricsGridProps {
  data: StockData;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ data }) => {
  const metrics = [
    { label: 'Cap. de Mercado', value: data.marketCap, icon: PieChart },
    { label: 'P/L (Preço/Lucro)', value: data.peRatio, icon: BarChart3 },
    { label: 'Div. Yield', value: data.dividendYield, icon: DollarSign },
    { label: 'P/VP', value: data.pBvRatio, icon: Calculator },
    { label: 'ROE', value: data.roe, icon: Percent },
    { label: 'Margem Líquida', value: data.netMargin, icon: TrendingUp },
    { label: 'EV (Enterprise Value)', value: data.enterpriseValue, icon: Briefcase },
    { label: 'EBITDA', value: data.ebitda, icon: Activity },
    { label: 'Lucro Líquido', value: data.netIncome, icon: Wallet },
    { label: 'LPA (Lucro por Ação)', value: `R$ ${(data.eps ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Target },
    { label: 'VPA (Valor Patrimonial)', value: `R$ ${(data.bvps ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Briefcase },
    { label: 'Dívida Total', value: data.totalDebt, icon: ArrowDownCircle },
    { label: 'Volume', value: data.volume, icon: Activity },
    { label: 'Máxima 52S', value: `R$ ${(data.high52w ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp },
    { label: 'Mínima 52S', value: `R$ ${(data.low52w ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingDown },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <m.icon size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">{m.label}</span>
          </div>
          <span className="text-lg font-bold text-slate-800">{m.value}</span>
        </div>
      ))}
    </div>
  );
};
