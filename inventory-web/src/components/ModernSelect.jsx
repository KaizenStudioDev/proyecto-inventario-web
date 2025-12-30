import { useState, useRef, useEffect } from 'react';

export default function ModernSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  disabled = false,
  label = '',
  icon = '📋',
  error = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Filtrar opciones basado en búsqueda
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar dropdown cuando hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}

      {/* Botón Principal */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
          isOpen
            ? 'border-primary-500 bg-primary-50 shadow-lg'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200 bg-white hover:border-primary-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xl">{icon}</span>
          <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-primary-200 rounded-xl shadow-2xl z-50 animate-scale-in">
          {/* Search */}
          {options.length > 5 && (
            <div className="p-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
              <input
                type="text"
                placeholder="🔍 Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          {/* Opciones */}
          <ul className="max-h-72 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500 text-sm">
                <p className="text-2xl mb-2">🔍</p>
                No results found
              </li>
            ) : (
              filteredOptions.map((option, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-4 py-3 transition-colors duration-150 flex items-center gap-3 border-b border-gray-50 last:border-b-0 ${
                      value === option.value
                        ? 'bg-primary-100 text-primary-700 font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{option.icon || '•'}</span>
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      {option.description && <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>}
                    </div>
                    {value === option.value && (
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
