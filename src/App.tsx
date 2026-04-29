import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  BarChart2,
  ShieldCheck,
  Zap,
  Activity,
  Newspaper,
  Calculator,
  Bookmark,
  FileText,
  X,
  LineChart as ChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStockAnalysis, getMarketSummary } from './services/gemini';
import { StockData, AIAnalysis, ChartDataPoint, MarketSummaryData, PriceAlert } from './types';
import { StockChart } from './components/StockChart';
import { MetricsGrid } from './components/MetricsGrid';
import { NewsFeed } from './components/NewsFeed';
import { AutocompleteSearch } from './components/AutocompleteSearch';
import { Toaster, toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

// Extend jsPDF with autoTable type
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

// Lazy loaded components
const DividendCalculator = lazy(() => import('./components/DividendCalculator').then(m => ({ default: m.DividendCalculator })));
const PriceProjection = lazy(() => import('./components/PriceProjection').then(m => ({ default: m.PriceProjection })));
const PriceAlerts = lazy(() => import('./components/PriceAlerts').then(m => ({ default: m.PriceAlerts })));
const MarketSummary = lazy(() => import('./components/MarketSummary').then(m => ({ default: m.MarketSummary })));
const ValuationCard = lazy(() => import('./components/ValuationCard').then(m => ({ default: m.ValuationCard })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
  </div>
);
import { cn } from './lib/utils';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<{ data: StockData; analysis: AIAnalysis; history: ChartDataPoint[] } | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<{ [symbol: string]: { data: StockData; analysis: AIAnalysis; timestamp: number } }>(() => {
    const saved = localStorage.getItem('stockmind_saved');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('stockmind_saved', JSON.stringify(savedAnalyses));
  }, [savedAnalyses]);

  const toggleSaveAnalysis = () => {
    if (!stockData) return;
    
    const symbol = stockData.data.symbol;
    if (savedAnalyses[symbol]) {
      const newSaved = { ...savedAnalyses };
      delete newSaved[symbol];
      setSavedAnalyses(newSaved);
      toast.success(`${symbol} removida da carteira`);
    } else {
      setSavedAnalyses({
        ...savedAnalyses,
        [symbol]: {
          data: stockData.data,
          analysis: stockData.analysis,
          timestamp: Date.now()
        }
      });
      toast.success(`${symbol} salva na carteira com sucesso!`);
    }
  };

  const generatePDF = () => {
    const symbols = Object.keys(savedAnalyses);
    if (symbols.length === 0) {
      toast.error("Adicione análises à sua carteira antes de gerar o PDF");
      return;
    }

    try {
      const doc = new jsPDF() as jsPDFWithAutoTable;
      const date = new Date().toLocaleDateString('pt-BR');

      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text('Relatório Integrado de Investimentos', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Gerado por StockMind B3 - ${date}`, 105, 28, { align: 'center' });

      symbols.forEach((symbol, index) => {
        if (index > 0) doc.addPage();
        
        const item = savedAnalyses[symbol];
        if (!item) return;
        
        // Symbol Header
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text(`${item.data.symbol} - ${item.data.name}`, 14, 45);
        
        doc.setFontSize(12);
        doc.text(`Preço Atual: R$ ${item.data.price.toLocaleString('pt-BR')}`, 14, 55);

        // Financial Metrics Table
        autoTable(doc, {
          startY: 65,
          head: [['Métrica', 'Valor']],
          body: [
            ['P/L', (item.data.peRatio ?? 0).toFixed(2)],
            ['P/VP', (item.data.pbRatio ?? 0).toFixed(2)],
            ['Dividend Yield', `${((item.data.dividendYield ?? 0) * 100).toFixed(2)}%`],
            ['ROE', `${((item.data.roe ?? 0) * 100).toFixed(2)}%`],
            ['Margem Líquida', `${((item.data.netMargin ?? 0) * 100).toFixed(2)}%`],
            ['VPA', `R$ ${(item.data.bvps ?? 0).toFixed(2)}`],
            ['LPA', `R$ ${(item.data.eps ?? 0).toFixed(2)}`],
          ],
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] }
        });

        // Analysis Section
        let currentY = (doc as any).lastAutoTable.finalY + 15;
        
        doc.setFontSize(14);
        doc.text('Análise da IA', 14, currentY);
        
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const summaryText = item.analysis.summary || 'Sem resumo disponível';
        const splitText = doc.splitTextToSize(summaryText, 180);
        doc.text(splitText, 14, currentY + 10);
        
        currentY += (splitText.length * 5) + 20;

        // Pros and Cons
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('Pontos Fortes:', 14, currentY);
        (item.analysis.pros || []).forEach((pro, i) => {
          doc.text(`• ${pro}`, 14, currentY + 7 + (i * 6));
        });

        currentY += ((item.analysis.pros || []).length * 6) + 15;
        
        doc.text('Riscos:', 14, currentY);
        (item.analysis.cons || []).forEach((con, i) => {
          doc.text(`• ${con}`, 14, currentY + 7 + (i * 6));
        });
      });

      doc.save(`Relatorio_StockMind_${date.replace(/\//g, '-')}.pdf`);
      toast.success("Relatório gerado com sucesso!");
    } catch (err) {
      console.error("PDF Error:", err);
      toast.error("Erro ao gerar o PDF. Verifique se os dados estão carregados corretamente.");
    }
  };
  const [marketSummary, setMarketSummary] = useState<MarketSummaryData | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('stockmind_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('stockmind_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const fetchSummary = async (retries = 2, isRetry = false) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 90000)
    );

    try {
      if (!isRetry) {
        setSummaryLoading(true);
        setSummaryError(false);
      }
      
      const summary = await Promise.race([
        getMarketSummary(),
        timeoutPromise
      ]) as MarketSummaryData;
      
      setMarketSummary(summary);
      setSummaryLoading(false);
    } catch (err) {
      console.error(`Failed to fetch market summary (retries left: ${retries}):`, err);
      if (retries > 0) {
        console.log("Retrying market summary fetch...");
        // Pequeno delay antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchSummary(retries - 1, true);
      }
      setSummaryError(true);
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const checkAlerts = (symbol: string, currentPrice: number) => {
    let triggeredAny = false;
    const updatedAlerts = alerts.map(alert => {
      if (alert.symbol === symbol && !alert.triggered) {
        const isTriggered = alert.condition === 'ABOVE' 
          ? currentPrice >= alert.targetPrice 
          : currentPrice <= alert.targetPrice;
        
        if (isTriggered) {
          triggeredAny = true;
          toast.success(`Alerta Atingido: ${symbol}`, {
            description: `${symbol} atingiu R$ ${currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Alvo: R$ ${alert.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
            duration: 10000,
          });
          return { ...alert, triggered: true };
        }
      }
      return alert;
    });

    if (triggeredAny) {
      setAlerts(updatedAlerts);
    }
  };

  const handleSearch = async (symbol: string, retries = 1, isRetry = false) => {
    if (!symbol.trim()) return;
    if (loading && !isRetry) return;

    setLoading(true);
    setError(null);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 45000)
    );

    try {
      const result = await Promise.race([
        getStockAnalysis(symbol),
        timeoutPromise
      ]) as { data: StockData; analysis: AIAnalysis; history: ChartDataPoint[] };

      setStockData(result);
      setLoading(false); // Success, stop loading
      checkAlerts(result.data.symbol, result.data.price);
    } catch (err) {
      console.error(`Search failed (retries left: ${retries}):`, err);
      
      if (retries > 0) {
        return handleSearch(symbol, retries - 1, true);
      }

      setLoading(false); // No more retries, stop loading
      if (err instanceof Error && err.message === "Timeout") {
        setError('A análise está demorando mais que o esperado. O mercado pode estar instável ou a busca por dados em tempo real está lenta.');
      } else {
        setError('Ocorreu um erro ao buscar os dados. Verifique o ticker (ex: PETR4, VALE3) e tente novamente.');
      }
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'BUY': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'SELL': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'HOLD': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'BUY': return 'COMPRA';
      case 'SELL': return 'VENDA';
      case 'HOLD': return 'MANTER';
      default: return 'NEUTRO';
    }
  };

  const handleAddAlert = (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    const newAlert: PriceAlert = {
      id: crypto.randomUUID(),
      symbol,
      targetPrice,
      condition,
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
    toast.success('Alerta configurado com sucesso!');
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <BarChart2 size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">StockMind <span className="text-brand-600">B3</span></span>
          </div>
          
          {stockData && (
            <AutocompleteSearch 
              onSearch={handleSearch} 
              className="hidden md:block w-96" 
              placeholder="Buscar outra ação..."
              loading={loading}
            />
          )}

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              <Zap size={12} className="text-amber-500" />
              Tecnologia Gemini 3
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {!stockData && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Análise de ações <span className="text-brand-600 italic">inteligente</span> para investidores decididos.
              </h1>
              <p className="text-lg text-slate-500 mb-10">
                Obtenha insights profundos, métricas claras e recomendações baseadas em IA para qualquer ação do mercado global.
              </p>
              
              <AutocompleteSearch 
                onSearch={handleSearch} 
                className="relative group max-w-2xl mx-auto"
                inputClassName="pl-16 pr-40 py-5 bg-white border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 focus:border-brand-500 text-lg font-medium"
                placeholder="Digite o ticker ou nome da empresa (ex: PETR4, VALE3)..."
                showButton={true}
                loading={loading}
              />

              <div className="mt-12 flex flex-wrap justify-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <span className="text-sm font-medium">Dados Verificados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-brand-500" />
                  <span className="text-sm font-medium">Análise em Tempo Real</span>
                </div>
              </div>

              <div className="mt-16 pt-16 border-t border-slate-100 w-full">
                {/* Market Summary Section */}
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Activity className="w-6 h-6 text-brand-600" />
                      <h2 className="text-2xl font-bold text-slate-900">Resumo do Mercado</h2>
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase">
                      {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </div>
                  </div>

                  {summaryLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 border-dashed">
                      <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-4" />
                      <p className="text-slate-500 font-medium italic">Gerando resumo diário com IA...</p>
                    </div>
                  ) : marketSummary ? (
                    <Suspense fallback={<LoadingFallback />}>
                      <MarketSummary data={marketSummary} />
                    </Suspense>
                  ) : (
                    <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 border-dashed">
                      <p className="text-slate-400 italic mb-4">
                        {summaryError 
                          ? "A geração do resumo demorou muito ou falhou." 
                          : "Não foi possível carregar o resumo do mercado no momento."}
                      </p>
                      <button 
                        onClick={() => fetchSummary(2, false)}
                        className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm flex items-center gap-2 mx-auto"
                      >
                        <Activity size={16} />
                        Tentar novamente
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Nossas Ferramentas</h3>
                <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                  <DividendCalculator />
                  <PriceAlerts 
                    alerts={alerts} 
                    onAddAlert={handleAddAlert} 
                    onRemoveAlert={handleRemoveAlert} 
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative mb-8">
              <Loader2 className="animate-spin text-brand-600" size={64} />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart2 size={24} className="text-brand-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Processando Análise...</h2>
            <p className="text-slate-500 font-medium animate-pulse max-w-sm text-center">
              Nossa IA está consultando o mercado e compilando os melhores dados para sua decisão.
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} />
              <p className="font-bold">Ops! Algo deu errado.</p>
            </div>
            <p className="text-sm font-medium opacity-80">{error}</p>
            <button 
              onClick={() => {
                const lastSymbol = stockData?.data.symbol || "";
                if (lastSymbol) handleSearch(lastSymbol);
              }}
              className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors text-sm"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {stockData && !loading && (
            <motion.div 
              key={stockData.data.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Main Info & Chart */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-md uppercase tracking-wider">
                          {stockData.data.sector}
                        </span>
                        <span className="text-slate-400 text-sm font-medium">{stockData.data.industry}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900">{stockData.data.name}</h2>
                        <button 
                          onClick={toggleSaveAnalysis}
                          className={cn(
                            "p-2 rounded-xl transition-all border",
                            savedAnalyses[stockData.data.symbol] 
                              ? "bg-brand-50 text-brand-600 border-brand-200" 
                              : "bg-white text-slate-400 border-slate-200 hover:text-brand-600 hover:border-brand-200"
                          )}
                          title={savedAnalyses[stockData.data.symbol] ? "Remover da carteira" : "Salvar análise na carteira"}
                        >
                          <Bookmark size={20} fill={savedAnalyses[stockData.data.symbol] ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-slate-500 font-mono text-lg">{stockData.data.symbol}</p>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <div className="text-3xl md:text-4xl font-black text-slate-900">
                        R$ {stockData.data.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={cn(
                        "flex items-center md:justify-end gap-1 font-bold text-lg",
                        stockData.data.change >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {stockData.data.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        {stockData.data.change >= 0 ? '+' : ''}{stockData.data.change} ({stockData.data.changePercent}%)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <ChartIcon size={20} className="text-brand-600" />
                      Evolução de Preço
                    </div>
                    <StockChart 
                      data={stockData.history} 
                      color={stockData.data.change >= 0 ? "#10b981" : "#f43f5e"} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Suspense fallback={<LoadingFallback />}>
                    <ValuationCard 
                      valuation={stockData.analysis.valuation} 
                      stockData={stockData.data} 
                    />
                  </Suspense>
                  
                  <div className="glass-card p-6 h-full">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                      <Info size={18} className="text-brand-600" />
                      Métricas Principais
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">P/L</div>
                        <div className="text-lg font-black text-slate-900">{stockData.data.peRatio.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">P/VP</div>
                        <div className="text-lg font-black text-slate-900">{stockData.data.pbRatio.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">DY</div>
                        <div className="text-lg font-black text-slate-900">{(stockData.data.dividendYield * 100).toFixed(2)}%</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">ROE</div>
                        <div className="text-lg font-black text-slate-900">{(stockData.data.roe * 100).toFixed(2)}%</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                      <button 
                        onClick={() => {
                          const metricsEl = document.getElementById('full-metrics');
                          metricsEl?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                      >
                        Ver todas as métricas <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <Suspense fallback={<LoadingFallback />}>
                  <PriceProjection 
                    projections={stockData.analysis.projections} 
                    currentPrice={stockData.data.price} 
                  />
                </Suspense>

                <div id="full-metrics" className="glass-card p-8 scroll-mt-24">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <Info size={20} className="text-brand-600" />
                    Métricas Detalhadas
                  </h3>
                  <MetricsGrid data={stockData.data} />
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <Newspaper size={20} className="text-brand-600" />
                    Notícias e Análises de Especialistas
                  </h3>
                  <NewsFeed news={stockData.analysis.news} />
                </div>

                <Suspense fallback={<LoadingFallback />}>
                  <DividendCalculator 
                    initialTicker={stockData.data.symbol}
                    initialPrice={stockData.data.price}
                    initialYield={stockData.data.dividendYield}
                  />
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                  <PriceAlerts 
                    alerts={alerts} 
                    onAddAlert={handleAddAlert} 
                    onRemoveAlert={handleRemoveAlert}
                    currentSymbol={stockData.data.symbol}
                    currentPrice={stockData.data.price}
                  />
                </Suspense>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-4">Sobre a Empresa</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {stockData.data.description}
                  </p>
                </div>
              </div>

              {/* Right Column: AI Analysis */}
              <div className="space-y-8">
                <div className={cn(
                  "p-8 rounded-2xl border-2 shadow-xl flex flex-col items-center text-center sticky top-24",
                  getVerdictColor(stockData.analysis.verdict)
                )}>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Veredito da IA</span>
                  <div className="text-5xl font-black mb-4 tracking-tighter">{getVerdictLabel(stockData.analysis.verdict)}</div>
                  
                  <div className="w-full bg-white/50 rounded-full h-3 mb-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stockData.analysis.score}%` }}
                      className="h-full bg-current"
                    />
                  </div>
                  <span className="text-xs font-bold uppercase">Confiança: {stockData.analysis.score}%</span>
                  
                  <div className="mt-6 text-sm font-medium leading-relaxed opacity-90">
                    {stockData.analysis.summary}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/20 w-full text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calculator size={14} />
                      Racional do Cálculo
                    </h4>
                    <p className="text-xs leading-relaxed opacity-80 italic">
                      {stockData.analysis.verdictReasoning}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-6">Pontos Chave</h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        Pontos Positivos
                      </h4>
                      <ul className="space-y-2">
                        {(stockData.analysis.pros || []).map((pro, i) => (
                          <li key={i} className="text-sm text-slate-700 flex gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-rose-700 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Riscos & Desafios
                      </h4>
                      <ul className="space-y-2">
                        {(stockData.analysis.cons || []).map((con, i) => (
                          <li key={i} className="text-sm text-slate-700 flex gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-500/30">
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Zap size={18} className="text-amber-300" />
                    Dica do Especialista
                  </h4>
                  <p className="text-sm text-brand-50 leading-relaxed">
                    Sempre diversifique sua carteira. Esta análise é baseada em dados históricos e tendências atuais processadas por IA, mas o mercado é volátil.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Watchlist Section */}
        {Object.keys(savedAnalyses).length > 0 && (
          <div className="mt-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Bookmark className="text-brand-600" />
                  Sua Carteira de Análises
                </h3>
                <p className="text-slate-500 font-medium">Ações salvas para comparação e relatórios</p>
              </div>
              <button 
                onClick={generatePDF}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
              >
                <FileText size={20} />
                Gerar Relatório PDF ({Object.keys(savedAnalyses).length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(savedAnalyses).map((item: any) => (
                <div 
                  key={item.data.symbol} 
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-200 transition-all cursor-pointer"
                  onClick={() => handleSearch(item.data.symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">{item.data.symbol}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newSaved = { ...savedAnalyses };
                        delete newSaved[item.data.symbol];
                        setSavedAnalyses(newSaved);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-black text-slate-700">R$ {item.data.price.toLocaleString('pt-BR')}</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-lg",
                      item.data.changePercent >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {item.data.changePercent >= 0 ? '+' : ''}{item.data.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">StockMind B3 © 2026</p>
          <p className="text-slate-400 text-[10px] max-w-2xl mx-auto leading-relaxed">
            AVISO LEGAL: As informações fornecidas por esta ferramenta são geradas por inteligência artificial e destinam-se apenas a fins informativos. Não constituem aconselhamento financeiro, recomendação de investimento ou oferta de compra/venda de valores mobiliários. Investir em ações envolve riscos.
          </p>
        </div>
      </footer>
    </div>
  );
}
