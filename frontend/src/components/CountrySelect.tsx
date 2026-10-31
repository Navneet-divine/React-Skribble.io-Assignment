import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Globe, X } from 'lucide-react';
import { ALL_COUNTRIES, type CountryItem } from '../data/countries';
import { usePlayerStore } from '../store/playerStore';

export const CountrySelect: React.FC = () => {
  const { language, setLanguage } = usePlayerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected language or default to en
  const cleanLang = (language || 'en').toLowerCase();
  const selectedCountry =
    ALL_COUNTRIES.find((c) => c.code.toLowerCase() === cleanLang) ||
    (['us', 'gb', 'uk', 'au', 'ca'].includes(cleanLang) ? ALL_COUNTRIES.find((c) => c.code === 'en') : undefined) ||
    ALL_COUNTRIES[0];

  // Filter languages: prefix match priority
  const query = searchQuery.trim().toLowerCase();
  const filteredCountries = React.useMemo(() => {
    if (!query) {
      return ALL_COUNTRIES;
    }

    const startsWithName = ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().startsWith(query) ||
        c.nativeName.toLowerCase().startsWith(query)
    );

    if (startsWithName.length > 0) {
      return startsWithName;
    }

    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.nativeName.toLowerCase().includes(query) ||
        c.language.toLowerCase().includes(query) ||
        c.code.toLowerCase() === query
    );
  }, [query]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (country: CountryItem) => {
    setLanguage(country.code.toLowerCase());
    handleClose();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button - Shadcn Select Trigger Style */}
      <button
        type="button"
        id="country-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-xl border border-slate-700/80 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-lg leading-none shrink-0">{selectedCountry.flag}</span>
          <span className="truncate text-slate-100 font-semibold">{selectedCountry.name}</span>
          <span className="text-xs text-slate-400 font-normal shrink-0">
            ({selectedCountry.nativeName})
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Popover Content - Shadcn Combobox / Command Style */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900/90">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language..."
              className="w-full py-1.5 px-2 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Info bar */}
          <div className="px-3 py-1.5 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-indigo-400" />
              <span>Select Word Language</span>
            </span>
            <span>{filteredCountries.length} languages</span>
          </div>

          {/* Language List - Scrollable */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected =
                  selectedCountry.code.toLowerCase() === country.code.toLowerCase();

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base leading-none">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                      <span
                        className={`text-xs ml-1 ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        • {country.nativeName}
                      </span>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No languages found matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
