import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { ExternalLink, Newspaper, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface NewsFeedProps {
  news: NewsArticle[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'NEWS' | 'ANALYSIS' | 'REPORT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const filteredNews = (news || []).filter(item => {
    const matchesSearch = (item.headline || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.summary || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || item.category === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Pesquisar notícias..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>

        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {(['ALL', 'NEWS', 'ANALYSIS', 'REPORT'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-all",
                filter === f ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f === 'ALL' ? 'Tudo' : f === 'NEWS' ? 'Notícias' : f === 'ANALYSIS' ? 'Análise' : 'Relatórios'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {paginatedNews.length > 0 ? (
          paginatedNews.map((item, index) => (
            <div key={item.id || index} className="p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase",
                    item.category === 'NEWS' ? "bg-blue-100 text-blue-700" : 
                    item.category === 'ANALYSIS' ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {item.category === 'NEWS' ? 'NOTÍCIA' : item.category === 'ANALYSIS' ? 'ANÁLISE' : 'RELATÓRIO'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.source} • {item.date}</span>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-brand-600 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <h4 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors mb-2 leading-snug">
                {item.headline}
              </h4>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <Newspaper className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium">Nenhuma notícia encontrada para os critérios selecionados.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-8 h-8 text-xs font-bold rounded-lg transition-all",
                  currentPage === page ? "bg-brand-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};
