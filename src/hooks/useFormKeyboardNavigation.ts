import { useEffect, useRef, useCallback } from 'react';
import {
  handleFormKeyboardNavigation,
  focusNextFormField,
  focusPrevFormField,
  submitActiveForm,
  focusAndSelect,
  getFocusableFormFields
} from '../utils/keyboardNavigationUtils';

interface UseFormKeyboardNavigationOptions {
  isOpen?: boolean;
  autoFocusFirst?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  allowEnterSubmitOnLast?: boolean;
}

export function useFormKeyboardNavigation(options: UseFormKeyboardNavigationOptions = {}) {
  const containerRef = useRef<HTMLDivElement | HTMLFormElement | null>(null);

  // Auto focus first interactive field on open
  useEffect(() => {
    if (options.isOpen !== false && options.autoFocusFirst !== false) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const fields = getFocusableFormFields(containerRef.current);
          if (fields.length > 0) {
            focusAndSelect(fields[0]);
          }
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [options.isOpen, options.autoFocusFirst]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      handleFormKeyboardNavigation(e, {
        allowEnterSubmitOnLast: options.allowEnterSubmitOnLast ?? true,
        onSubmit: options.onSubmit,
        onCancel: options.onCancel
      });
    },
    [options.allowEnterSubmitOnLast, options.onSubmit, options.onCancel]
  );

  return {
    containerRef,
    onKeyDown
  };
}
