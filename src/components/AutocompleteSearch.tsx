import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { COMMON_STOCKS } from '../constants';
import { cn } from '../lib/utils';

interface AutocompleteSearchProps {
  onSearch: (symbol: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showButton?: boolean;
  loading?: boolean;
}

export const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({ 
  onSearch, 
  placeholder = "Buscar ação...", 
  className,
  inputClassName,
  showButton = false,
  loading = false
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = COMMON_STOCKS.filter(
        stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
          stock.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0 && !loading);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, loading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim().toUpperCase());
      setIsOpen(false);
    }
  };

  const handleSelect = (symbol: string) => {
    if (loading) return;
    setQuery(symbol);
    onSearch(symbol);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          placeholder={placeholder}
          disabled={loading}
          className={cn(
            "w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-brand-500 transition-all outline-none text-sm disabled:opacity-50",
            inputClassName
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && !loading && setIsOpen(suggestions.length > 0)}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className={cn("text-brand-600 animate-spin", inputClassName?.includes('py-5') && "ml-3")}>
               <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          ) : (
            <Search className={cn("text-slate-400", inputClassName?.includes('py-5') && "ml-3")} size={inputClassName?.includes('py-5') ? 24 : 18} />
          )}
        </div>
        
        {showButton && (
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analisando...' : 'Analisar'}
            {!loading && <Search size={18} />}
          </button>
        )}
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden">
          {suggestions.map((stock) => (
            <button
              key={stock.symbol}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-50 last:border-none"
              onClick={() => handleSelect(stock.symbol)}
            >
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm">{stock.symbol}</span>
                <span className="text-xs text-slate-500">{stock.name}</span>
              </div>
              <Search size={14} className="text-slate-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
