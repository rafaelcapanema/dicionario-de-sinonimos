
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchSynonyms } from './services/geminiService';
import { SynonymResponse, LoadingState } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SynonymResponse | null>(null);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [showOthers, setShowOthers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (word: string) => {
    if (!word.trim()) {
      setResult(null);
      setLoading(LoadingState.IDLE);
      return;
    }

    setLoading(LoadingState.LOADING);
    setError(null);
    setShowOthers(false);

    try {
      const data = await fetchSynonyms(word);
      setResult(data);
      setLoading(LoadingState.SUCCESS);
    } catch (err) {
      setError("Não conseguimos encontrar sinônimos para esta palavra.");
      setLoading(LoadingState.ERROR);
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (query) {
      timeoutRef.current = setTimeout(() => {
        search(query);
      }, 800);
    } else {
      setResult(null);
      setLoading(LoadingState.IDLE);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 pb-20 px-6 max-w-5xl mx-auto">
      {/* Header / Brand */}
      <header className="mb-20 text-center">
        <h1 className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium mb-2">
          Dicionário de Sinônimos
        </h1>
        <div className="h-px w-12 bg-gray-200 mx-auto"></div>
      </header>

      {/* Main Search Input */}
      <div className="w-full relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="escreva uma palavra..."
          className="w-full bg-transparent border-none focus:ring-0 text-6xl md:text-8xl serif text-center outline-none transition-all duration-500 placeholder:italic lowercase"
          autoFocus
        />
      </div>

      {/* Loading Indicator */}
      {loading === LoadingState.LOADING && (
        <div className="mt-12 flex space-x-2 animate-pulse">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      )}

      {/* Results Section */}
      {loading === LoadingState.SUCCESS && result && (
        <div className="mt-12 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Primary Synonym - Large Font */}
          <div className="text-6xl md:text-8xl serif text-gray-500 italic text-center mb-16 leading-tight lowercase">
            {result.primary.toLowerCase()}
          </div>

          {/* Top 5 Synonyms - Smaller Font */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-3xl mb-12">
            {result.topFive.map((syn, idx) => (
              <span 
                key={idx} 
                className="text-xl md:text-2xl text-gray-400 font-light hover:text-gray-600 transition-colors cursor-default lowercase"
              >
                {syn.toLowerCase()}
              </span>
            ))}
          </div>

          {/* "More" Toggle Button */}
          {result.others.length > 0 && (
            <button
              onClick={() => setShowOthers(!showOthers)}
              className="group flex flex-col items-center space-y-2 focus:outline-none"
            >
              <span className="text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
                {showOthers ? 'Recolher' : 'Mais sinônimos'}
              </span>
              <div className={`w-4 h-4 transition-transform duration-300 ${showOthers ? 'rotate-180' : ''}`}>
                 <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>
          )}

          {/* All Other Synonyms - Smallest Font */}
          {showOthers && (
            <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 max-w-2xl animate-in fade-in zoom-in-95 duration-500">
              {result.others.map((syn, idx) => (
                <span 
                  key={idx} 
                  className="text-sm text-gray-400 font-normal hover:text-gray-500 lowercase"
                >
                  {syn.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {loading === LoadingState.ERROR && (
        <div className="mt-12 text-gray-400 italic text-sm">
          {error}
        </div>
      )}

      {/* Empty State / Welcome */}
      {loading === LoadingState.IDLE && !query && (
        <div className="mt-20 text-gray-300 text-sm tracking-wide uppercase font-light">
          A linguagem é infinita.
        </div>
      )}

      {/* Footer Decoration */}
      <footer className="fixed bottom-10 left-0 w-full flex justify-center pointer-events-none opacity-20">
         <span className="text-[8px] uppercase tracking-[1em] text-gray-900">
           Minimalista • Elegante • Preciso
         </span>
      </footer>
    </div>
  );
};

export default App;
