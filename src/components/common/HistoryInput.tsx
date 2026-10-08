import React, { useState, useEffect, useRef, useId } from 'react';
import { History, X, Sparkles } from 'lucide-react';
import {
  getFieldHistory,
  recordFieldHistory,
  removeFieldHistoryItem
} from '../../services/formHistoryService';

export interface HistoryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  historyKey: string;
  additionalSuggestions?: string[];
  onSelectSuggestion?: (val: string) => void;
}

export const HistoryInput: React.FC<HistoryInputProps> = ({
  historyKey,
  additionalSuggestions = [],
  value,
  onChange,
  onSelectSuggestion,
  onFocus,
  onBlur,
  onKeyDown,
  className = '',
  placeholder,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const datalistId = useId();

  const strValue = typeof value === 'number' || typeof value === 'string' ? String(value) : '';

  // Retrieve matching suggestions
  const historyList = getFieldHistory(historyKey, strValue);
  const extraFiltered = additionalSuggestions.filter(
    item =>
      Boolean(item) &&
      item.toLowerCase().includes(strValue.toLowerCase()) &&
      !historyList.some(h => h.toLowerCase() === item.toLowerCase())
  );
  const allSuggestions = [...historyList, ...extraFiltered].slice(0, 10);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handlePick = (val: string) => {
    if (inputRef.current) {
      // Trigger standard React change event
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(inputRef.current, val);
      const ev = new Event('input', { bubbles: true });
      inputRef.current.dispatchEvent(ev);
    }

    if (onChange) {
      const syntheticEvent = {
        target: { value: val },
        currentTarget: { value: val }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }

    if (onSelectSuggestion) {
      onSelectSuggestion(val);
    }

    recordFieldHistory(historyKey, val);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && allSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allSuggestions.length) % allSuggestions.length);
        return;
      }
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handlePick(allSuggestions[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
    }

    // Record on blur / submit if Enter pressed
    if (e.key === 'Enter' && strValue.trim()) {
      recordFieldHistory(historyKey, strValue);
    }

    if (onKeyDown) onKeyDown(e);
  };

  const handleDeleteItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    removeFieldHistoryItem(historyKey, item);
    // Force re-render if needed
    setSelectedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        value={value}
        onChange={e => {
          if (onChange) onChange(e);
          setIsOpen(true);
        }}
        onFocus={e => {
          setIsOpen(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={e => {
          if (strValue.trim()) {
            recordFieldHistory(historyKey, strValue);
          }
          if (onBlur) onBlur(e);
        }}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        list={datalistId}
        autoComplete="off"
        className={className}
        {...rest}
      />

      {/* Native datalist fallback */}
      <datalist id={datalistId}>
        {allSuggestions.map((s, idx) => (
          <option key={idx} value={s} />
        ))}
      </datalist>

      {/* Floating History Dropdown List */}
      {isOpen && allSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[90] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-56 overflow-y-auto">
          <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-bold select-none">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <History className="w-3 h-3" />
              <span>হিস্টোরী সাজেশন (History Suggestions)</span>
            </span>
            <span className="text-[9px] opacity-70">ক্লিক করে নির্বাচন করুন</span>
          </div>

          <div className="py-1">
            {allSuggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onMouseDown={e => {
                    e.preventDefault();
                    handlePick(item);
                  }}
                  className={`px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer transition select-none group ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0 opacity-60 group-hover:opacity-100" />
                    <span className="truncate">{item}</span>
                  </div>

                  <button
                    type="button"
                    title="Remove from history"
                    onClick={e => handleDeleteItem(e, item)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 rounded transition shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export interface HistoryTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  historyKey: string;
  additionalSuggestions?: string[];
  onSelectSuggestion?: (val: string) => void;
}

export const HistoryTextarea: React.FC<HistoryTextareaProps> = ({
  historyKey,
  additionalSuggestions = [],
  value,
  onChange,
  onSelectSuggestion,
  onFocus,
  onBlur,
  onKeyDown,
  className = '',
  placeholder,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const strValue = typeof value === 'number' || typeof value === 'string' ? String(value) : '';
  const historyList = getFieldHistory(historyKey, strValue);
  const allSuggestions = historyList.slice(0, 8);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handlePick = (val: string) => {
    if (textareaRef.current) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(textareaRef.current, val);
      const ev = new Event('input', { bubbles: true });
      textareaRef.current.dispatchEvent(ev);
    }

    if (onChange) {
      const syntheticEvent = {
        target: { value: val },
        currentTarget: { value: val }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(syntheticEvent);
    }

    if (onSelectSuggestion) onSelectSuggestion(val);
    recordFieldHistory(historyKey, val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => {
          if (onChange) onChange(e);
          setIsOpen(true);
        }}
        onFocus={e => {
          setIsOpen(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={e => {
          if (strValue.trim()) {
            recordFieldHistory(historyKey, strValue);
          }
          if (onBlur) onBlur(e);
        }}
        placeholder={placeholder}
        className={className}
        {...rest}
      />

      {isOpen && allSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[90] overflow-hidden max-h-48 overflow-y-auto">
          <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-bold select-none">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <History className="w-3 h-3" />
              <span>পূর্বের মন্তব্য/বিবরণ সাজেশন (History Suggestions)</span>
            </span>
          </div>
          <div className="py-1">
            {allSuggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={e => {
                  e.preventDefault();
                  handlePick(item);
                }}
                className="px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition select-none flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
