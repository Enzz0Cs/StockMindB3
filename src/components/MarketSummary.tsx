import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Newspaper, Lightbulb, Activity } from 'lucide-react';
import { MarketSummaryData } from '../types';
import { cn } from '../lib/utils';

interface MarketSummaryProps {
  data: MarketSummaryData;
}

export const MarketSummary: React.FC<MarketSummaryProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Indices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(data.indices || []).map((idx) => (
          <motion.div
            key={idx.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">{idx.name}</div>
            <div className="flex items-end justify-between">
              <div className="text-xl font-bold text-slate-900">
                {(idx.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className={cn(
                "flex items-center text-sm font-bold",
                (idx.changePercent ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {(idx.changePercent ?? 0) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(idx.changePercent ?? 0).toFixed(2)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main News & Highlights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-bold text-slate-900">Sentimento do Mercado</h3>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "{data.marketSentiment}"
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-bold text-slate-900">Principais Notícias</h3>
            </div>
            <div className="space-y-4">
              {(data.mainNews || []).map((news, i) => (
                <div key={i} className="group cursor-pointer">
                  <h4 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {news.headline}
                  </h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{news.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase">
                    <span>{news.source}</span>
                    <span>•</span>
                    <span>{news.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel: Gainers/Losers & Highlights */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-bold text-slate-900">Destaques</h3>
            </div>
            <ul className="space-y-3">
              {(data.highlights || []).map((h, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Maiores Altas/Baixas</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                {(data.topGainers || []).map((g) => (
                  <div key={g.symbol} className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="font-bold text-emerald-900">{g.symbol}</span>
                    <span className="text-xs font-bold text-emerald-600">+{(g.changePercent ?? 0).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {(data.topLosers || []).map((l) => (
                  <div key={l.symbol} className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="font-bold text-rose-900">{l.symbol}</span>
                    <span className="text-xs font-bold text-rose-600">{(l.changePercent ?? 0).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
