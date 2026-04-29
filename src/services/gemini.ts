import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { StockData, AIAnalysis, ChartDataPoint, MarketSummaryData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Helpers para cache persistente
const getStorageItem = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

const setStorageItem = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Silencioso se o storage estiver cheio
  }
};

const CACHE_TTL = 1000 * 60 * 15; // 15 minutos
const SUMMARY_CACHE_TTL = 1000 * 60 * 30; // 30 minutos

export async function getStockAnalysis(symbol: string): Promise<{ data: StockData; analysis: AIAnalysis; history: ChartDataPoint[] }> {
  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `stock_analysis_${upperSymbol}`;
  
  // Verificar cache persistente
  const cached = getStorageItem(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache Persistente] Retornando dados para: ${upperSymbol}`);
    return cached;
  }

  const model = "gemini-3.1-flash-lite-preview";
  
  const prompt = `Analise a ação ${upperSymbol} (B3) de forma quantitativa e direta.
  1. Dados atuais em R$, histórico de 12 meses (30 pontos), volume e médias (MA20, MA50).
  2. Indicadores: RSI(14) e MACD(12,26,9) em cada ponto.
  3. Métricas: P/L, DY, Margem Líquida, ROE, P/VP, EV, EBITDA, Lucro Líquido, Dívida Total.
  4. Cálculos Específicos de Valuation:
     - Método de Graham: RaizQuadrada(22.5 * LPA * VPA).
     - Método de Bazin: DividendoAnual / 0.06.
  5. Veredito (BUY/SELL/HOLD/NEUTRAL) e Score (0-100) baseado em: Valuation(30%), Rentabilidade(25%), Saúde(20%), Dividendos(15%), Técnico(10%).
  6. 10 notícias recentes (feed robusto).
  7. Projeções 1 e 5 anos (Otimista, Esperado, Pessimista).
  Responda em PORTUGUÊS no formato JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          data: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              change: { type: Type.NUMBER },
              changePercent: { type: Type.NUMBER },
              marketCap: { type: Type.STRING, description: "Valor de Mercado" },
              peRatio: { type: Type.NUMBER, description: "P/L (Preço/Lucro)" },
              dividendYield: { type: Type.STRING, description: "Dividend Yield (%)" },
              high52w: { type: Type.NUMBER, description: "Máxima 52 Semanas" },
              low52w: { type: Type.NUMBER, description: "Mínima 52 Semanas" },
              volume: { type: Type.STRING, description: "Volume de Negociação" },
              description: { type: Type.STRING },
              sector: { type: Type.STRING },
              industry: { type: Type.STRING },
              netMargin: { type: Type.STRING, description: "Margem Líquida (%)" },
              roe: { type: Type.STRING, description: "ROE (%)" },
              pBvRatio: { type: Type.NUMBER, description: "P/VP (Preço/Valor Patrimonial)" },
              enterpriseValue: { type: Type.STRING, description: "EV (Enterprise Value)" },
              ebitda: { type: Type.STRING, description: "EBITDA" },
              netIncome: { type: Type.STRING, description: "Lucro Líquido Total" },
              totalDebt: { type: Type.STRING, description: "Dívida Total" },
              eps: { type: Type.NUMBER, description: "LPA (Lucro por Ação)" },
              bvps: { type: Type.NUMBER, description: "VPA (Valor Patrimonial por Ação)" },
              dps: { type: Type.NUMBER, description: "Dividendo por Ação (DPS)" },
            },
            required: ["symbol", "name", "price", "change", "changePercent", "eps", "bvps", "dps"]
          },
          history: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                price: { type: Type.NUMBER },
                volume: { type: Type.NUMBER },
                ma20: { type: Type.NUMBER },
                ma50: { type: Type.NUMBER },
                rsi: { type: Type.NUMBER },
                macd: { type: Type.NUMBER },
                signal: { type: Type.NUMBER },
                histogram: { type: Type.NUMBER }
              }
            }
          },
          analysis: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              verdict: { type: Type.STRING, enum: ["BUY", "SELL", "HOLD", "NEUTRAL"] },
              verdictReasoning: { type: Type.STRING, description: "Explicação detalhada do cálculo do veredito" },
              score: { type: Type.NUMBER },
              news: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    url: { type: Type.STRING },
                    source: { type: Type.STRING },
                    date: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["NEWS", "ANALYSIS", "REPORT"] }
                  }
                }
              },
              projections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeframe: { type: Type.STRING, description: "Ex: '1 Ano', '5 Anos'" },
                    low: { type: Type.NUMBER, description: "Cenário Pessimista" },
                    expected: { type: Type.NUMBER, description: "Cenário Esperado" },
                    high: { type: Type.NUMBER, description: "Cenário Otimista" },
                    reasoning: { type: Type.STRING, description: "Justificativa da projeção" }
                  }
                }
              },
              valuation: {
                type: Type.OBJECT,
                properties: {
                  grahamValue: { type: Type.NUMBER, description: "Preço Justo de Graham" },
                  bazinValue: { type: Type.NUMBER, description: "Preço Teto de Bazin" },
                  fairValue: { type: Type.NUMBER, description: "Preço Justo Médio/StockMind" },
                  description: { type: Type.STRING, description: "Comparação entre os métodos e o preço atual" }
                },
                required: ["grahamValue", "bazinValue", "fairValue", "description"]
              }
            },
            required: ["summary", "verdict", "score", "news", "projections", "verdictReasoning", "valuation"]
          }
        },
        required: ["data", "history", "analysis"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  
  if (!result.data || !result.analysis || !result.history) {
    throw new Error("Dados incompletos retornados pela IA");
  }

  // Salvar no cache persistente
  setStorageItem(cacheKey, {
    ...result,
    timestamp: Date.now()
  });

  return result;
}

export async function getMarketSummary(): Promise<MarketSummaryData> {
  const cacheKey = 'market_summary_cache';
  
  // Verificar cache persistente
  const cached = getStorageItem(cacheKey);
  if (cached && Date.now() - cached.timestamp < SUMMARY_CACHE_TTL) {
    console.log("[Cache Persistente] Retornando resumo do mercado");
    return cached.data;
  }

  const model = "gemini-3-flash-preview";
  const prompt = `RESUMO RÁPIDO DO MERCADO B3 (${new Date().toLocaleDateString('pt-BR')}).
  Extraia via Google Search:
  1. Ibovespa, IFIX, SMLL, Dólar (R$ e %).
  2. 3 Maiores Altas e 3 Maiores Baixas.
  3. 3 Notícias curtas.
  
  JSON PORTUGUÊS. Seja o mais rápido possível (máxima prioridade).`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          indices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER },
                change: { type: Type.NUMBER },
                changePercent: { type: Type.NUMBER }
              }
            }
          },
          topGainers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                changePercent: { type: Type.NUMBER }
              }
            }
          },
          topLosers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                symbol: { type: Type.STRING },
                changePercent: { type: Type.NUMBER }
              }
            }
          },
          mainNews: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                headline: { type: Type.STRING },
                summary: { type: Type.STRING },
                url: { type: Type.STRING },
                source: { type: Type.STRING },
                date: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["NEWS", "ANALYSIS", "REPORT"] }
              }
            }
          },
          marketSentiment: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["date", "indices", "topGainers", "topLosers", "mainNews", "marketSentiment", "highlights"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}") as MarketSummaryData;
  
  if (!result.indices || !result.mainNews) {
    throw new Error("Resumo do mercado incompleto");
  }

  // Salvar no cache persistente
  setStorageItem(cacheKey, {
    data: result,
    timestamp: Date.now()
  });

  return result;
}
