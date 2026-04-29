import React, { useState } from 'react';
import { Bell, Trash2, Plus, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { PriceAlert } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PriceAlertsProps {
  alerts: PriceAlert[];
  onAddAlert: (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => void;
  onRemoveAlert: (id: string) => void;
  currentSymbol?: string;
  currentPrice?: number;
}

export const PriceAlerts: React.FC<PriceAlertsProps> = ({ 
  alerts, 
  onAddAlert, 
  onRemoveAlert,
  currentSymbol,
  currentPrice
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [targetPrice, setTargetPrice] = useState<number>(currentPrice || 0);
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>(
    currentPrice && targetPrice > currentPrice ? 'ABOVE' : 'BELOW'
  );

  const handleAdd = () => {
    if (currentSymbol && targetPrice > 0) {
      onAddAlert(currentSymbol, targetPrice, condition);
      setIsAdding(false);
    }
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="glass-card p-8 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <Bell size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Alertas de Preço</h3>
            <p className="text-sm text-slate-500">Seja notificado quando o alvo for atingido</p>
          </div>
        </div>
        
        {currentSymbol && !isAdding && (
          <button 
            onClick={() => {
              setIsAdding(true);
              setTargetPrice(currentPrice || 0);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
          >
            <Plus size={16} />
            Novo Alerta para {currentSymbol}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden"
          >
            <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Configurar Alerta para {currentSymbol}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Preço Alvo (R$)</label>
                <input 
                  type="number" 
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Condição</label>
                <select 
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700 appearance-none"
                >
                  <option value="ABOVE">Acima de</option>
                  <option value="BELOW">Abaixo de</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button 
                  onClick={handleAdd}
                  className="flex-1 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-all"
                >
                  Salvar Alerta
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-300 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * O alerta será verificado sempre que você pesquisar esta ação ou atualizar os dados.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {activeAlerts.length === 0 && triggeredAlerts.length === 0 && !isAdding && (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Bell className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium">Você ainda não possui alertas configurados.</p>
          </div>
        )}

        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Alertas Ativos</h4>
            {activeAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    alert.condition === 'ABOVE' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {alert.condition === 'ABOVE' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{alert.symbol}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      {alert.condition === 'ABOVE' ? 'Acima de' : 'Abaixo de'} <span className="font-bold text-slate-700">R$ {alert.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveAlert(alert.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {triggeredAlerts.length > 0 && (
          <div className="space-y-3 pt-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Histórico de Alertas Atingidos</h4>
            {triggeredAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{alert.symbol}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      Alvo de <span className="font-bold">R$ {alert.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> atingido
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveAlert(alert.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
