import React, { useState, useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Bar,
  ComposedChart,
  Line,
  Brush
} from 'recharts';
import { ChartDataPoint } from '../types';
import { cn } from '../lib/utils';

interface StockChartProps {
  data: ChartDataPoint[];
  color?: string;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const StockChart: React.FC<StockChartProps> = ({ data, color = "#0ea5e9" }) => {
  const [range, setRange] = useState<TimeRange>('6M');
  const [showIndicators, setShowIndicators] = useState(true);
  const [activeIndicator, setActiveIndicator] = useState<'NONE' | 'RSI' | 'MACD'>('NONE');

  const rangeLabels: Record<TimeRange, string> = {
    '1M': '1M',
    '3M': '3M',
    '6M': '6M',
    '1Y': '1A',
    'ALL': 'TUDO'
  };

  const filteredData = useMemo(() => {
    const safeData = data || [];
    if (range === 'ALL') return safeData;
    const count = range === '1M' ? 5 : range === '3M' ? 10 : range === '6M' ? 15 : 30;
    return safeData.slice(-count);
  }, [data, range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                range === r ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowIndicators(!showIndicators)}
            className={cn(
              "text-xs font-bold px-3 py-1 rounded-md border transition-all",
              showIndicators ? "bg-brand-50 border-brand-200 text-brand-600" : "bg-white border-slate-200 text-slate-500"
            )}
          >
            Médias {showIndicators ? 'ON' : 'OFF'}
          </button>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['NONE', 'RSI', 'MACD'] as const).map((ind) => (
              <button
                key={ind}
                onClick={() => setActiveIndicator(ind)}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                  activeIndicator === ind ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {ind === 'NONE' ? 'Sem Oscilador' : ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Price Chart */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                dy={10}
                hide={activeIndicator !== 'NONE'}
              />
              <YAxis 
                yAxisId="price"
                orientation="right"
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <YAxis 
                yAxisId="volume"
                orientation="left"
                domain={[0, (data: any) => Math.max(...data.map((d: any) => d.volume)) * 4]}
                hide
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: any, name: string) => {
                  const labels: Record<string, string> = {
                    price: 'Preço',
                    volume: 'Volume',
                    ma20: 'Média 20',
                    ma50: 'Média 50'
                  };
                  return [value, labels[name] || name];
                }}
              />
              
              <Area 
                yAxisId="price"
                type="monotone" 
                dataKey="price" 
                name="price"
                stroke={color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={1000}
              />

              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                name="volume"
                fill="#cbd5e1" 
                opacity={0.4}
                radius={[2, 2, 0, 0]}
              />

              {showIndicators && (
                <>
                  <Line 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="ma20" 
                    stroke="#f59e0b" 
                    strokeWidth={1.5} 
                    dot={false}
                    strokeDasharray="5 5"
                    name="ma20"
                  />
                  <Line 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="ma50" 
                    stroke="#8b5cf6" 
                    strokeWidth={1.5} 
                    dot={false}
                    strokeDasharray="3 3"
                    name="ma50"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* RSI Chart */}
        {activeIndicator === 'RSI' && (
          <div className="h-[150px] w-full pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">RSI (14)</div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  hide
                />
                <YAxis 
                  domain={[0, 100]}
                  ticks={[30, 70]}
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ fontSize: '10px', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rsi" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  dot={false}
                  name="RSI"
                />
                {/* Overbought/Oversold lines */}
                <Line dataKey={() => 70} stroke="#f43f5e" strokeDasharray="3 3" dot={false} />
                <Line dataKey={() => 30} stroke="#10b981" strokeDasharray="3 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* MACD Chart */}
        {activeIndicator === 'MACD' && (
          <div className="h-[150px] w-full pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">MACD (12, 26, 9)</div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  hide
                />
                <YAxis 
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ fontSize: '10px', borderRadius: '8px' }}
                />
                <Bar dataKey="histogram" fill="#94a3b8" opacity={0.5} />
                <Line 
                  type="monotone" 
                  dataKey="macd" 
                  stroke="#2563eb" 
                  strokeWidth={1.5} 
                  dot={false}
                  name="MACD"
                />
                <Line 
                  type="monotone" 
                  dataKey="signal" 
                  stroke="#f59e0b" 
                  strokeWidth={1.5} 
                  dot={false}
                  name="Sinal"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="h-[40px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData}>
              <XAxis dataKey="date" hide />
              <Brush 
                dataKey="date" 
                height={30} 
                stroke={color} 
                fill="#f8fafc"
                travellerWidth={10}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
