import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Ban, X, AlertTriangle } from 'lucide-react';
import type { CrudResult } from '../../context/ERPContext';
import { useFormKeyboardNavigation } from '../../hooks/useFormKeyboardNavigation';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'email';
  options?: Array<string | { value: string; label: string }>;
  required?: boolean;
  readOnly?: boolean;
  half?: boolean;
  hint?: string;
}

interface EditModalProps {
  title: string;
  fields: FieldDef[];
  initial: Record<string, any>;
  onSave: (values: Record<string, any>) => CrudResult;
  onClose: () => void;
  saveLabel?: string;
}

/** Generic form modal. Numbers are converted back to numbers on save. */
export const EditModal: React.FC<EditModalProps> = ({ title, fields, initial, onSave, onClose, saveLabel = 'Save Changes' }) => {
  const [values, setValues] = useState<Record<string, any>>({ ...initial });
  const [error, setError] = useState<string | null>(null);

  const { containerRef, onKeyDown } = useFormKeyboardNavigation({
    autoFocusFirst: true,
    onCancel: onClose
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const out: Record<string, any> = {};
    for (const f of fields) {
      if (f.readOnly) continue;
      const raw = values[f.key];
      if (f.type === 'number') {
        const n = Number(raw);
        if (raw === '' || raw === undefined || Number.isNaN(n)) {
          if (f.required) {
            setError(`${f.label} must be a valid number.`);
            return;
          }
          out[f.key] = 0;
        } else {
          out[f.key] = n;
        }
      } else {
        const s = typeof raw === 'string' ? raw.trim() : raw;
        if (f.required && (s === '' || s === undefined || s === null)) {
          setError(`${f.label} is required.`);
          return;
        }
        out[f.key] = s ?? '';
      }
    }
    const res = onSave(out);
    if (res.success) onClose();
    else setError(res.error || 'Update failed.');
  };

  const inputCls = 'w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs disabled:opacity-60';

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form ref={containerRef as any} onKeyDown={onKeyDown} onSubmit={submit} className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className={f.half === false || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {f.label}
                  {f.required && ' *'}
                </label>
                {f.type === 'select' ? (
                  <select
                    className={inputCls}
                    value={values[f.key] ?? ''}
                    disabled={f.readOnly}
                    onChange={ev => setValues(v => ({ ...v, [f.key]: ev.target.value }))}
                  >
                    {(f.options || []).map(o => {
                      const val = typeof o === 'string' ? o : o.value;
                      const lab = typeof o === 'string' ? o : o.label;
                      return (
                        <option key={val} value={val}>
                          {lab}
                        </option>
                      );
                    })}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={values[f.key] ?? ''}
                    disabled={f.readOnly}
                    onChange={ev => setValues(v => ({ ...v, [f.key]: ev.target.value }))}
                  />
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : f.type || 'text'}
                    step={f.type === 'number' ? 'any' : undefined}
                    className={inputCls}
                    value={values[f.key] ?? ''}
                    disabled={f.readOnly}
                    onChange={ev => setValues(v => ({ ...v, [f.key]: ev.target.value }))}
                  />
                )}
                {f.hint && <p className="text-[10px] text-slate-400 mt-0.5">{f.hint}</p>}
              </div>
            ))}
          </div>
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel <kbd className="ml-1 text-[10px] opacity-60">Esc</kbd>
            </button>
            <button type="submit" data-action="save" className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs">
              {saveLabel} <kbd className="ml-1 text-[10px] opacity-70">Ctrl+Enter</kbd>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConfirmActionProps {
  title: string;
  message: string;
  confirmLabel: string;
  askReason?: boolean;
  onConfirm: (reason?: string) => CrudResult;
  onClose: () => void;
}

export const ConfirmAction: React.FC<ConfirmActionProps> = ({ title, message, confirmLabel, askReason, onConfirm, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const run = () => {
    const res = onConfirm(askReason ? reason.trim() || undefined : undefined);
    if (res.success) onClose();
    else setError(res.error || 'Action failed.');
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !askReason) {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, askReason, run]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-rose-50 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        </div>
        <div className="p-5 space-y-3 text-xs">
          <p className="text-slate-700 leading-relaxed">{message}</p>
          {askReason && (
            <input
              type="text"
              placeholder="Reason (optional - press Enter to submit)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  run();
                }
              }}
              autoFocus
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          )}
          {error && <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              Keep <kbd className="ml-1 text-[10px] opacity-60">Esc</kbd>
            </button>
            <button onClick={run} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs">
              {confirmLabel} <kbd className="ml-1 text-[10px] opacity-80">Enter</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RowActionsProps {
  onEdit?: () => void;
  /** Performs the delete/void; returns the result so errors can be shown. */
  onDelete?: (reason?: string) => CrudResult;
  deleteTitle?: string;
  deleteMessage?: string;
  /** "void" shows a Ban icon & wording instead of Trash. */
  mode?: 'delete' | 'void';
  askReason?: boolean;
  editLabel?: string;
}

export const RowActions: React.FC<RowActionsProps> = ({
  onEdit,
  onDelete,
  deleteTitle,
  deleteMessage,
  mode = 'delete',
  askReason,
  editLabel = 'Edit'
}) => {
  const [confirming, setConfirming] = useState(false);
  const isVoid = mode === 'void';
  return (
    <>
      <div className="inline-flex items-center gap-1">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            title={editLabel}
            aria-label={editLabel}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            title={isVoid ? 'Cancel / Void' : 'Delete'}
            aria-label={isVoid ? 'Cancel / Void' : 'Delete'}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
          >
            {isVoid ? <Ban className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {confirming && onDelete && (
        <ConfirmAction
          title={deleteTitle || (isVoid ? 'Cancel this document?' : 'Delete this record?')}
          message={
            deleteMessage ||
            (isVoid
              ? 'This reverses stock, balances and ledger postings. The record is kept as Cancelled for audit.'
              : 'This action cannot be undone.')
          }
          confirmLabel={isVoid ? 'Yes, Cancel' : 'Yes, Delete'}
          askReason={askReason ?? isVoid}
          onConfirm={onDelete}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  );
};
