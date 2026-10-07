/**
 * Keyboard Navigation & Fast Operational Utilities
 * Designed for high-speed mobile dealer workflows.
 */

// Selector for all interactive form fields within a container
export const FORM_FIELD_SELECTOR = [
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'button[type="submit"]:not([disabled]):not([tabindex="-1"])',
  'button[data-form-nav="true"]:not([disabled]):not([tabindex="-1"])'
].join(', ');

/**
 * Finds all visible, focusable fields inside a parent container
 */
export function getFocusableFormFields(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FORM_FIELD_SELECTOR));
  return elements.filter(el => {
    // Check if visible
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    return el.offsetParent !== null || el.getClientRects().length > 0;
  });
}

/**
 * Focuses an element and automatically selects its text if applicable
 */
export function focusAndSelect(el: HTMLElement) {
  try {
    el.focus();
    if (el instanceof HTMLInputElement) {
      // Don't auto-select date, time, color or button inputs
      const nonSelectableTypes = ['button', 'submit', 'checkbox', 'radio', 'file', 'image', 'color'];
      if (!nonSelectableTypes.includes(el.type)) {
        el.select();
      }
    } else if (el instanceof HTMLTextAreaElement) {
      el.select();
    }
  } catch (err) {
    // Ignore focus/select errors in detached elements
  }
}

/**
 * Advances focus to the next relevant form field
 * If at the last field, optionally submits the form if allowed
 */
export function focusNextFormField(currentEl: HTMLElement, options?: { allowSubmitOnLast?: boolean }): boolean {
  const container = currentEl.closest('form') || currentEl.closest('[role="dialog"]') || currentEl.closest('[data-form-container="true"]');
  if (!container) return false;

  const fields = getFocusableFormFields(container as HTMLElement);
  const currentIndex = fields.indexOf(currentEl);
  if (currentIndex === -1) return false;

  if (currentIndex < fields.length - 1) {
    const nextField = fields[currentIndex + 1];
    focusAndSelect(nextField);
    return true;
  } else if (options?.allowSubmitOnLast) {
    // On the last field, trigger submit
    submitActiveForm(container as HTMLElement);
    return true;
  }

  return false;
}

/**
 * Reverses focus to the previous relevant form field
 */
export function focusPrevFormField(currentEl: HTMLElement): boolean {
  const container = currentEl.closest('form') || currentEl.closest('[role="dialog"]') || currentEl.closest('[data-form-container="true"]');
  if (!container) return false;

  const fields = getFocusableFormFields(container as HTMLElement);
  const currentIndex = fields.indexOf(currentEl);
  if (currentIndex > 0) {
    const prevField = fields[currentIndex - 1];
    focusAndSelect(prevField);
    return true;
  }
  return false;
}

/**
 * Submits the nearest form or clicks the primary submit button in the container
 */
export function submitActiveForm(container: HTMLElement): boolean {
  if (container instanceof HTMLFormElement) {
    if (typeof container.requestSubmit === 'function') {
      container.requestSubmit();
      return true;
    } else {
      const submitBtn = container.querySelector<HTMLButtonElement>('button[type="submit"]:not([disabled])');
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
    }
  }

  // Look for any submit button or save button inside container
  const submitBtn = container.querySelector<HTMLButtonElement>('button[type="submit"]:not([disabled]), button[data-action="save"]:not([disabled]), button[data-action="confirm"]:not([disabled])');
  if (submitBtn) {
    submitBtn.click();
    return true;
  }

  return false;
}

/**
 * Handles Form KeyDown events supporting:
 * - Enter -> Next Field
 * - Shift + Enter -> Previous Field
 * - Ctrl + Enter -> Submit/Confirm
 */
export function handleFormKeyboardNavigation(
  e: React.KeyboardEvent<HTMLElement>,
  options?: {
    allowEnterSubmitOnLast?: boolean;
    onSubmit?: () => void;
    onCancel?: () => void;
  }
) {
  const target = e.target as HTMLElement;
  const isInput = target instanceof HTMLInputElement;
  const isSelect = target instanceof HTMLSelectElement;
  const isTextarea = target instanceof HTMLTextAreaElement;
  const isButton = target instanceof HTMLButtonElement;

  // 1. Ctrl + Enter: Submit Form from anywhere inside
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (options?.onSubmit) {
      options.onSubmit();
      return;
    }
    const container = target.closest('form') || target.closest('[role="dialog"]') || target.closest('[data-form-container="true"]');
    if (container) {
      submitActiveForm(container as HTMLElement);
    }
    return;
  }

  // 2. Escape: Close / Cancel
  if (e.key === 'Escape') {
    if (options?.onCancel) {
      e.preventDefault();
      options.onCancel();
    }
    return;
  }

  // 3. Shift + Enter: Previous Field
  if (e.shiftKey && e.key === 'Enter') {
    // In multi-line textarea, Shift+Enter usually enters newline, let it pass if user wants multiline
    if (isTextarea && !target.hasAttribute('data-single-line')) {
      return;
    }
    e.preventDefault();
    focusPrevFormField(target);
    return;
  }

  // 4. Enter -> Next Field (or Submit if on last or submit button)
  if (!e.shiftKey && e.key === 'Enter') {
    // If inside textarea and not configured for single-line nav, allow normal Enter
    if (isTextarea && !target.hasAttribute('data-enter-nav')) {
      return;
    }

    // If target is already a submit button, allow default click
    if (isButton && (target.type === 'submit' || target.getAttribute('data-action') === 'save')) {
      return;
    }

    // If input is a radio or checkbox, let Enter trigger or move next
    if (isInput || isSelect || (isTextarea && target.hasAttribute('data-enter-nav'))) {
      e.preventDefault();
      const moved = focusNextFormField(target, { allowSubmitOnLast: options?.allowEnterSubmitOnLast ?? true });
      if (!moved && options?.onSubmit) {
        options.onSubmit();
      }
    }
  }
}

/**
 * Initializes global Auto-Select on Focus listener
 * When user focuses an input or textarea, all its text is highlighted for instant overwrite.
 */
let autoSelectInitialized = false;
export function setupGlobalAutoSelect() {
  if (typeof window === 'undefined' || autoSelectInitialized) return;
  autoSelectInitialized = true;

  document.addEventListener(
    'focusin',
    (e: FocusEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement) {
        if (target.hasAttribute('data-no-autoselect')) return;
        const nonSelectable = ['button', 'submit', 'checkbox', 'radio', 'file', 'image', 'color', 'date', 'datetime-local'];
        if (!nonSelectable.includes(target.type)) {
          // Slight delay ensures browser caret positioning doesn't unselect immediately
          setTimeout(() => {
            if (document.activeElement === target) {
              target.select();
            }
          }, 20);
        }
      } else if (target instanceof HTMLTextAreaElement) {
        if (target.hasAttribute('data-no-autoselect')) return;
        setTimeout(() => {
          if (document.activeElement === target) {
            target.select();
          }
        }, 20);
      }
    },
    true
  );
}

/**
 * Keyboard Shortcuts Definition for Help modal, Command palette and Tooltips
 */
export interface ShortcutItem {
  keyCombo: string;
  keys: string[];
  labelEn: string;
  labelBn: string;
  category: 'Global' | 'Navigation' | 'Forms & Modals' | 'POS & Sales' | 'Inventory & Audit';
  actionId: string;
}

export const ERP_SHORTCUTS: ShortcutItem[] = [
  // Global
  {
    keyCombo: 'Ctrl + K',
    keys: ['Ctrl', 'K'],
    labelEn: 'Global Menu + Command Palette & Search',
    labelBn: 'গ্লোবাল কমান্ড প্যালেট ও দ্রুত সার্চ',
    category: 'Global',
    actionId: 'command-palette'
  },
  {
    keyCombo: 'Ctrl + F',
    keys: ['Ctrl', 'F'],
    labelEn: 'Search in active view / table',
    labelBn: 'বর্তমান পেজ বা টেবিলে সার্চ করুন',
    category: 'Global',
    actionId: 'view-search'
  },
  {
    keyCombo: 'Ctrl + N',
    keys: ['Ctrl', 'N'],
    labelEn: 'Context-Aware New Entry (Sale / Purchase / Product)',
    labelBn: 'নতুন এন্ট্রি তৈরি করুন (সেল / পারচেজ / প্রোডাক্ট)',
    category: 'Global',
    actionId: 'new-entry'
  },
  {
    keyCombo: 'Ctrl + S',
    keys: ['Ctrl', 'S'],
    labelEn: 'Quick Save / Submit active modal or form',
    labelBn: 'বর্তমান ফর্ম বা মডাল দ্রুত সেভ করুন',
    category: 'Global',
    actionId: 'save-active'
  },
  {
    keyCombo: 'Ctrl + P',
    keys: ['Ctrl', 'P'],
    labelEn: 'Print active invoice / report / receipt',
    labelBn: 'চালান / রিপোর্ট / রসিদ প্রিন্ট করুন',
    category: 'Global',
    actionId: 'print-active'
  },
  {
    keyCombo: 'Ctrl + B',
    keys: ['Ctrl', 'B'],
    labelEn: 'Universal Multi-Barcode / Multi-IMEI Scanner',
    labelBn: 'মাল্টি-বারকোড ও আইএমইআই স্ক্যানার',
    category: 'Global',
    actionId: 'multi-scanner'
  },
  {
    keyCombo: 'Ctrl + R',
    keys: ['Ctrl', 'R'],
    labelEn: 'Safe Data Refresh & Cloud Sync',
    labelBn: 'নিরাপদ ডাটাবেজ রিফ্রেশ ও ক্লাউড সিঙ্ক',
    category: 'Global',
    actionId: 'refresh-data'
  },
  {
    keyCombo: 'Ctrl + /',
    keys: ['Ctrl', '/'],
    labelEn: 'Keyboard Shortcuts Help & Operational Guide',
    labelBn: 'কীবোর্ড শর্টকাট সহায়িকা ও গাইড',
    category: 'Global',
    actionId: 'shortcut-help'
  },

  // Navigation
  {
    keyCombo: 'Alt + ←',
    keys: ['Alt', '←'],
    labelEn: 'Navigate Back (Previous view)',
    labelBn: 'পূর্ববর্তী ভিউতে ফিরে যান',
    category: 'Navigation',
    actionId: 'history-back'
  },
  {
    keyCombo: 'Alt + →',
    keys: ['Alt', '→'],
    labelEn: 'Navigate Forward (Next view)',
    labelBn: 'পরবর্তী ভিউতে যান',
    category: 'Navigation',
    actionId: 'history-forward'
  },
  {
    keyCombo: 'Esc',
    keys: ['Esc'],
    labelEn: 'Close Modal / Cancel / Clear Search',
    labelBn: 'মডাল বন্ধ বা বাতিল করুন',
    category: 'Navigation',
    actionId: 'close-modal'
  },
  {
    keyCombo: 'Ctrl + [',
    keys: ['Ctrl', '['],
    labelEn: 'Toggle Desktop Sidebar (Expand / Collapse)',
    labelBn: 'সাইডবার লুকান বা খুলুন (ফুল-স্ক্রিন মোড)',
    category: 'Navigation',
    actionId: 'toggle-sidebar'
  },

  // Forms & Modals
  {
    keyCombo: 'Enter',
    keys: ['Enter'],
    labelEn: 'Advance to Next Form Field automatically',
    labelBn: 'স্বয়ংক্রিয়ভাবে পরবর্তী ফিল্ডে যান',
    category: 'Forms & Modals',
    actionId: 'next-field'
  },
  {
    keyCombo: 'Shift + Enter',
    keys: ['Shift', 'Enter'],
    labelEn: 'Go Back to Previous Form Field',
    labelBn: 'পূর্ববর্তী ফিল্ডে ফিরে যান',
    category: 'Forms & Modals',
    actionId: 'prev-field'
  },
  {
    keyCombo: 'Ctrl + Enter',
    keys: ['Ctrl', 'Enter'],
    labelEn: 'Direct Submit / Confirm Form from any field',
    labelBn: 'যেকোনো ফিল্ড থেকে সরাসরি ফর্ম সাবমিট/কনফার্ম',
    category: 'Forms & Modals',
    actionId: 'submit-form'
  },
  {
    keyCombo: 'Tab / Shift + Tab',
    keys: ['Tab'],
    labelEn: 'Standard accessible sequential field navigation',
    labelBn: 'পরবর্তী / পূর্ববর্তী ফিল্ডে অ্যাক্সেসিবল ট্রাভার্সাল',
    category: 'Forms & Modals',
    actionId: 'tab-nav'
  },

  // POS & Sales
  {
    keyCombo: 'Scan + Enter',
    keys: ['Gun / Enter'],
    labelEn: 'Rapid Barcode Gun / Keyboard IMEI addition',
    labelBn: 'বারকোড গান দিয়ে তাৎক্ষণিক কার্টে আইটেম যুক্ত',
    category: 'POS & Sales',
    actionId: 'pos-rapid-scan'
  },
  {
    keyCombo: 'Auto-Select',
    keys: ['Focus'],
    labelEn: 'Auto text selection on field focus for instant overwrite',
    labelBn: 'ফিল্ডে ফোকাস হওয়ামাত্র লেখা সিলেক্ট হয়ে যায়',
    category: 'Forms & Modals',
    actionId: 'auto-select-field'
  }
];
