export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  dividendYield: string;
  high52w: number;
  low52w: number;
  volume: string;
  description: string;
  sector: string;
  industry: string;
  netMargin: string; // Margem Líquida
  roe: string; // Return on Equity
  pBvRatio: number; // P/VP
  enterpriseValue: string; // EV
  ebitda: string;
  netIncome: string; // Lucro Total
  totalDebt: string; // Dívida Total
  eps: number; // Earnings Per Share (LPA)
  bvps: number; // Book Value Per Share (VPA)
  dps: number; // Dividend Per Share (Dividendo por Ação)
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  ma20?: number;
  ma50?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
}

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  date: string;
  category: 'NEWS' | 'ANALYSIS' | 'REPORT';
}

export interface PriceProjection {
  timeframe: string;
  low: number;
  expected: number;
  high: number;
  reasoning: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  createdAt: string;
  triggered: boolean;
}

export interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface MarketSummaryData {
  date: string;
  indices: IndexData[];
  topGainers: { symbol: string; changePercent: number }[];
  topLosers: { symbol: string; changePercent: number }[];
  mainNews: NewsArticle[];
  marketSentiment: string;
  highlights: string[];
}

export interface AIAnalysis {
  summary: string;
  pros: string[];
  cons: string[];
  verdict: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL';
  verdictReasoning: string; // Justificativa detalhada do veredito
  score: number; // 0-100
  news: NewsArticle[];
  projections: PriceProjection[];
  valuation: {
    grahamValue: number;
    bazinValue: number;
    fairValue: number;
    description: string;
  };
}
