import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { formatDateInputValue, parseDateInput } from '../../utils/dateInputUtils';

type DateInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export const DateInput: React.FC<DateInputProps> = ({
  value = '',
  onChange,
  onBlur,
  className = '',
  ...rest
}) => {
  const [draft, setDraft] = useState(() => formatDateInputValue(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEmittedValue = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (lastEmittedValue.current === value) {
      lastEmittedValue.current = undefined;
      return;
    }
    inputRef.current?.setCustomValidity('');
    setDraft(formatDateInputValue(value));
  }, [value]);

  const emitDate = (nextValue: string, event?: React.ChangeEvent<HTMLInputElement>) => {
    lastEmittedValue.current = nextValue;
    if (!onChange) return;
    const target = event?.target || inputRef.current;
    const currentTarget = event?.currentTarget || inputRef.current;
    if (target && currentTarget) {
      onChange({
        target: { ...target, value: nextValue },
        currentTarget: { ...currentTarget, value: nextValue }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextDraft = event.target.value;
    const parsed = parseDateInput(nextDraft);
    setDraft(nextDraft);
    inputRef.current?.setCustomValidity(
      nextDraft && !parsed ? 'তারিখ DDMMYY বা DDMMYYYY ফরম্যাটে লিখুন।' : ''
    );
    emitDate(parsed || '', event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseDateInput(draft);
    if (draft && parsed) {
      inputRef.current?.setCustomValidity('');
      setDraft(formatDateInputValue(parsed));
      emitDate(parsed);
    } else if (!draft) {
      emitDate('');
    }
    onBlur?.(event);
  };

  const handleCalendarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseDateInput(event.target.value);
    if (!parsed) return;
    inputRef.current?.setCustomValidity('');
    setDraft(formatDateInputValue(parsed));
    emitDate(parsed);
  };

  return (
    <div className="relative flex items-center">
      <input
        {...rest}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={rest.placeholder || 'DDMMYY / DDMMYYYY'}
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${className} pr-9`}
        aria-label={rest['aria-label'] || 'তারিখ (দিন-মাস-বছর)'}
      />
      <CalendarDays className="absolute right-2 w-4 h-4 text-slate-500 pointer-events-none" />
      <input
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={parseDateInput(draft) || ''}
        onChange={handleCalendarChange}
        className="absolute right-0 top-0 h-full w-9 opacity-0 cursor-pointer"
      />
    </div>
  );
};
