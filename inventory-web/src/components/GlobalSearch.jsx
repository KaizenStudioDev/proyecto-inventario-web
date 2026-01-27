import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from 'react-i18next';

export default function GlobalSearch() {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ products: [], customers: [], suppliers: [] });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Keyboard shortcut Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsExpanded(true);
            }
            if (e.key === 'Escape') {
                setIsExpanded(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                if (query.length === 0) setIsExpanded(false);
            }
        };
        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, query]);

    // Search logic
    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length === 0) {
                setResults({ products: [], customers: [], suppliers: [] });
                return;
            }
            setLoading(true);

            const [productsRes, customersRes, suppliersRes] = await Promise.all([
                supabase.from('products').select('id, name, sku').ilike('name', `%${query}%`).limit(5),
                supabase.from('customers').select('id, name').ilike('name', `%${query}%`).limit(5),
                supabase.from('suppliers').select('id, name').ilike('name', `%${query}%`).limit(5),
            ]);

            setResults({
                products: productsRes.data || [],
                customers: customersRes.data || [],
                suppliers: suppliersRes.data || [],
            });
            setLoading(false);
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (type, id) => {
        setIsExpanded(false);
        setQuery('');
        navigate(`/app/${type}?id=${id}`);
    };

    return (
        <div className="relative flex items-center justify-end h-9" ref={searchRef}>
            {/* Search Container - Grows horizontally */}
            <div
                className={`flex items-center bg-gray-100 dark:bg-gray-800 rounded-full transition-all duration-300 ease-in-out ${isExpanded ? 'w-48 sm:w-64 px-3' : 'w-9 px-0'
                    } h-9 overflow-hidden border border-transparent shadow-sm`}
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center justify-center min-w-[36px] h-9 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className={`bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 w-full transition-opacity duration-200 ${isExpanded ? 'opacity-100 ml-1' : 'opacity-0 pointer-events-none'
                        }`}
                />

                {isExpanded && query.length > 0 && (
                    <button
                        onClick={() => setQuery('')}
                        className="text-gray-400 hover:text-gray-600 px-1"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isExpanded && query.trim().length > 0 && (
                <div className="absolute top-full right-0 mt-3 w-72 sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[70] overflow-hidden animate-fade-in">
                    <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500 animate-pulse text-xs">{t('search.searching')}</div>
                        ) : results.products.length === 0 &&
                            results.customers.length === 0 &&
                            results.suppliers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-xs text-balance">
                                {t('search.no_results', { query })}
                            </div>
                        ) : (
                            <>
                                {results.products.length > 0 && (
                                    <section>
                                        <h3 className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('search.products')}</h3>
                                        {results.products.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelect('products', p.id)}
                                                className="w-full h-auto text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 transition-colors"
                                            >
                                                <span className="truncate pr-2">{p.name}</span>
                                                <span className="text-[9px] text-gray-400 font-mono shrink-0">{p.sku}</span>
                                            </button>
                                        ))}
                                    </section>
                                )}

                                {results.customers.length > 0 && (
                                    <section>
                                        <h3 className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('search.customers')}</h3>
                                        {results.customers.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => handleSelect('customers', c.id)}
                                                className="w-full text-left flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 transition-colors"
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </section>
                                )}

                                {results.suppliers.length > 0 && (
                                    <section>
                                        <h3 className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('search.suppliers')}</h3>
                                        {results.suppliers.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => handleSelect('suppliers', s.id)}
                                                className="w-full text-left flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 transition-colors"
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-[9px] text-gray-400 flex justify-between">
                        <span>{t('search.esc_close')}</span>
                        <span>{t('search.ctrl_k_focus')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
