import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Download,
  Check,
  Smartphone,
  Users,
  Building2,
  Barcode
} from 'lucide-react';

export const DataImportView: React.FC = () => {
  const { bulkImportData } = useERP();

  const [entityType, setEntityType] = useState<'customers' | 'suppliers' | 'products' | 'imeis'>('customers');
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const sampleTemplates = {
    customers: `shopName,ownerName,mobile,address,area,district,creditLimit,allowedDueDays,openingBalance
Popular Telecom,Md. Hafizur Rahman,01712-334455,Shop 4 Rajuk Market,Uttara,Dhaka,800000,21,120000
Trust Mobile World,Jashim Uddin,01819-223344,Station Road,Agrabad,Chittagong,1000000,15,250000
Smart Point,Kabir Hossain,01912-778899,Alkaram Market,Sadar,Sylhet,500000,14,0`,

    suppliers: `name,companyName,contactPerson,mobile,email,address,district,creditLimit,paymentTermsDays,openingBalance
Excel Technologies Ltd,Excel Group BD,Mr. Faruk Ahmed,01711-889922,sales@excelbd.com,Gulshan 1,Dhaka,20000000,21,1500000
Global Distribution Ltd,Global BD Logistics,Kazi Anis,01819-334411,trade@globaldist.com,Agrabad,Chittagong,10000000,15,0`,

    products: `brandName,model,sku,ram,storage,color,purchasePrice,dealerPrice,retailPrice,tacCode
Xiaomi,Redmi Note 13 Pro,RN13P-8-256-BLK,8GB,256GB,Midnight Black,23500,26500,28999,86491206
Realme,Realme 12 Plus 5G,R12P-8-256-GRN,8GB,256GB,Pioneer Green,24000,27000,29999,86324105
Samsung,Galaxy A55 5G,A55-8-128-NAV,8GB,128GB,Awesome Navy,37000,41000,45999,35892100`,

    imeis: `brandName,model,ram,storage,color,imei1,imei2,serialNumber,purchaseCost
Xiaomi,Redmi Note 13 Pro,8GB,256GB,Midnight Black,864912060000011,864912060000012,SN-RN13-001,23500
Xiaomi,Redmi Note 13 Pro,8GB,256GB,Midnight Black,864912060000029,864912060000037,SN-RN13-002,23500
Realme,Realme 12 Plus 5G,8GB,256GB,Pioneer Green,863241050000014,863241050000022,SN-R12P-001,24000`
  };

  const handleParse = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setMessage({ type: 'error', text: 'CSV must contain at least a header row and one data row.' });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Handle simple CSV splitting
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] !== undefined ? values[idx] : '';
      });
      rows.push(obj);
    }

    setParsedRows(rows);
    setMessage({
      type: 'info',
      text: `Parsed ${rows.length} rows successfully. Please review the table below and confirm import.`
    });
  };

  const handleCommit = () => {
    if (parsedRows.length === 0) return;
    const res = bulkImportData(entityType, parsedRows);
    if (res.success) {
      setMessage({
        type: 'success',
        text: `Successfully imported ${res.count} ${entityType} into the system!`
      });
      setParsedRows([]);
      setCsvText('');
    } else {
      setMessage({
        type: 'error',
        text: 'Failed to import data. Please check CSV column headers.'
      });
    }
  };

  const handleLoadSample = () => {
    setCsvText(sampleTemplates[entityType]);
    setParsedRows([]);
    setMessage({
      type: 'info',
      text: `Loaded sample template for ${entityType}. Click "Parse & Validate CSV" to test.`
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        setMessage({ type: 'info', text: `Loaded file "${file.name}". Click "Parse & Validate CSV".` });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Bulk CSV / Excel Data Import Wizard
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rapidly onboard dealer shops, supplier profiles, handset catalog & bulk IMEI serial numbers
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span>Load {entityType.toUpperCase()} Template</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : message.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : message.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Entity Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setEntityType('customers');
            setCsvText('');
            setParsedRows([]);
          }}
          className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
            entityType === 'customers'
              ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <Users className={`w-4 h-4 ${entityType === 'customers' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="font-bold text-xs">Customers / Dealers</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setEntityType('suppliers');
            setCsvText('');
            setParsedRows([]);
          }}
          className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
            entityType === 'suppliers'
              ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <Building2 className={`w-4 h-4 ${entityType === 'suppliers' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="font-bold text-xs">Suppliers / Vendors</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setEntityType('products');
            setCsvText('');
            setParsedRows([]);
          }}
          className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
            entityType === 'products'
              ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <Smartphone className={`w-4 h-4 ${entityType === 'products' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="font-bold text-xs">Products & Catalog</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setEntityType('imeis');
            setCsvText('');
            setParsedRows([]);
          }}
          className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
            entityType === 'imeis'
              ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <Barcode className={`w-4 h-4 ${entityType === 'imeis' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="font-bold text-xs">IMEI Serial Numbers</span>
        </button>
      </div>

      {/* Import Input Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Choose CSV File</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-slate-400 text-[11px]">or paste CSV text directly below</span>
          </div>

          <button
            type="button"
            onClick={handleParse}
            disabled={!csvText.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-40 transition flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Parse & Validate CSV</span>
          </button>
        </div>

        <div>
          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`Paste CSV data here with header row, e.g.:\n${sampleTemplates[entityType].split('\n').slice(0, 2).join('\n')}`}
            className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Parsed Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Import Preview & Integrity Verification ({parsedRows.length} Records)
              </h3>
              <p className="text-xs text-slate-500">Inspect the extracted fields before committing into system storage.</p>
            </div>

            <button
              onClick={handleCommit}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>Commit & Import All {parsedRows.length} Rows</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-bold">
                <tr>
                  {Object.keys(parsedRows[0]).map(h => (
                    <th key={h} className="p-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    {Object.keys(row).map(h => (
                      <td key={h} className="p-2.5 text-slate-800 font-medium">{row[h] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
