import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';

export interface ExcelImportResult {
  success: boolean;
  count: number;
  error?: string;
}

interface ExcelImportExportActionsProps {
  entityName: string;
  fileName: string;
  sheetName: string;
  columns: string[];
  records: object[];
  onImport: (rows: Record<string, unknown>[]) => ExcelImportResult;
  helpText?: string;
}

export const ExcelImportExportActions: React.FC<ExcelImportExportActionsProps> = ({
  entityName,
  fileName,
  sheetName,
  columns,
  records,
  onImport,
  helpText = 'Code/mobile দিয়ে profile মেলানো হয়; existing ledger balance import-এ পরিবর্তন হয় না।'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(records, { header: columns });
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, fileName);
      setMessage({ type: 'success', text: `${records.length}টি ${entityName} Excel-এ export হয়েছে।` });
    } catch (error) {
      console.error(`Failed to export ${entityName}:`, error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : `${entityName} export করা যায়নি।`
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsImporting(true);
    setMessage(null);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
      if (!worksheet) {
        setMessage({ type: 'error', text: 'Excel ফাইলে কোনো worksheet পাওয়া যায়নি।' });
        return;
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
      if (rows.length === 0) {
        setMessage({ type: 'error', text: 'Excel worksheet-এ import করার মতো কোনো row নেই।' });
        return;
      }

      const result = onImport(rows);
      setMessage(result.success
        ? { type: 'success', text: `${result.count}টি ${entityName} import/update হয়েছে।` }
        : { type: 'error', text: result.error || `${entityName} import করা যায়নি।` });
    } catch (error) {
      console.error(`Failed to import ${entityName}:`, error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Excel ফাইল পড়া বা import করা যায়নি।'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
      >
        <Download className="h-4 w-4" />
        Excel Export
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60"
      >
        {isImporting ? <FileSpreadsheet className="h-4 w-4 animate-pulse" /> : <Upload className="h-4 w-4" />}
        {isImporting ? 'Import হচ্ছে...' : 'Excel Import'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
        aria-label={`${entityName} Excel file`}
      />
      {message && (
        <p role={message.type === 'error' ? 'alert' : 'status'} className={`w-full text-[11px] ${message.type === 'error' ? 'text-rose-700' : 'text-emerald-700'}`}>
          {message.text}
        </p>
      )}
      {helpText && <p className="w-full text-[10px] text-slate-500">{helpText}</p>}
    </div>
  );
};
