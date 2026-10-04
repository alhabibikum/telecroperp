import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Building,
  ShieldAlert,
  Globe,
  CheckCircle,
  FileJson,
  Database,
  History,
  Trash2,
  AlertTriangle,
  HardDrive,
  FileCheck,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Users,
  Key,
  Plus,
  Lock,
  UserCheck,
  UserX,
  ShieldCheck,
  Mail,
  Phone,
  Edit2,
  KeyRound,
  Cloud,
  Server,
  Copy,
  ExternalLink,
  Check,
  Zap
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';
import { UserRole, AuthUser } from '../../types/erp';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    exportJSON,
    importJSON,
    products,
    imeis,
    customers,
    suppliers,
    salesInvoices,
    purchaseInvoices,
    backupSnapshots,
    createBackupSnapshot,
    restoreFromSnapshot,
    deleteSnapshot,
    purgeTransactionalData,
    factoryResetFullWipe,
    users,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    currentUserRole,
    currentUser
  } = useERP();

  const [activeTab, setActiveTab] = useState<'users' | 'supabase' | 'backup' | 'reset' | 'profile'>('users');

  // Company Profile State
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress);
  const [companyPhone, setCompanyPhone] = useState(settings.companyPhone);
  const [companyEmail, setCompanyEmail] = useState(settings.companyEmail);
  const [vatTaxNumber, setVatTaxNumber] = useState(settings.vatTaxNumber);
  const [valuationMethod, setValuationMethod] = useState(settings.valuationMethod);
  const [creditLimitHardBlock, setCreditLimitHardBlock] = useState(settings.creditLimitHardBlock);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Snapshot creation state
  const [snapshotName, setSnapshotName] = useState('');
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  // Factory reset modal state
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState('');

  // Restore verification modal state
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);
  const [restoreSummary, setRestoreSummary] = useState<any | null>(null);

  // User Management State (RBAC)
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [userPasswordReset, setUserPasswordReset] = useState('');

  // Supabase Cloud Configuration State
  const initialSb = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialSb.url);
  const [supabaseKey, setSupabaseKey] = useState(initialSb.anonKey);
  const [supabaseEnabled, setSupabaseEnabled] = useState(initialSb.enabled);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
      setSupabaseTestResult(res);
      if (res.success) {
        saveSupabaseConfig(supabaseUrl, supabaseKey, supabaseEnabled);
      }
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey, supabaseEnabled);
    setMessage(supabaseEnabled ? 'Supabase ক্লাউড ডাটাবেজ কনফিগারেশন সফলভাবে সেভ হয়েছে!' : 'Supabase সিঙ্ক নিষ্ক্রিয় (লোকাল অফলাইন মোড চালু)');
    setTimeout(() => setMessage(null), 3500);
  };

  const handleCopySchemaNotice = async () => {
    try {
      const resp = await fetch('/supabase_schema.sql');
      if (resp.ok) {
        const text = await resp.text();
        await navigator.clipboard.writeText(text);
        setCopiedSchema(true);
        setMessage('সম্পূর্ণ supabase_schema.sql কোড ক্লিপবোর্ডে কপি হয়েছে! Supabase SQL Editor-এ পেস্ট করে Run করুন।');
        setTimeout(() => setCopiedSchema(false), 3000);
        setTimeout(() => setMessage(null), 5000);
        return;
      }
    } catch (e) {
      console.error('Failed to fetch schema sql for clipboard', e);
    }
    navigator.clipboard.writeText('supabase_schema.sql');
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  const [newUserForm, setNewUserForm] = useState<{
    name: string;
    email: string;
    role: UserRole;
    password: string;
    department: string;
    branchName: string;
    phone: string;
    avatar: string;
    status: 'Active' | 'Suspended';
  }>({
    name: '',
    email: '',
    role: 'Salesman',
    password: '',
    department: 'Sales & Field Distribution',
    branchName: 'Headquarters (Motijheel, Dhaka)',
    phone: '',
    avatar: '👨‍💼',
    status: 'Active'
  });

  const [editUserForm, setEditUserForm] = useState<{
    name: string;
    email: string;
    role: UserRole;
    department: string;
    branchName: string;
    phone: string;
    avatar: string;
    status: 'Active' | 'Suspended';
  }>({
    name: '',
    email: '',
    role: 'Salesman',
    department: '',
    branchName: '',
    phone: '',
    avatar: '👨‍💼',
    status: 'Active'
  });

  const handleOpenAddUser = () => {
    setNewUserForm({
      name: '',
      email: '',
      role: 'Salesman',
      password: '',
      department: 'Sales & Field Distribution',
      branchName: 'Headquarters (Motijheel, Dhaka)',
      phone: '',
      avatar: '👨‍💼',
      status: 'Active'
    });
    setShowAddUserModal(true);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
      setErrorMsg('নাম, ইমেইল ও পাসওয়ার্ড প্রদান করা আবশ্যক।');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }
    const res = createUser(newUserForm);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create user');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    setShowAddUserModal(false);
    setMessage(`ইউজার একাউন্ট তৈরি সম্পন্ন (${newUserForm.name} - ${newUserForm.role})`);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleOpenEditUser = (user: AuthUser) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
      branchName: user.branchName || '',
      phone: user.phone || '',
      avatar: user.avatar || '👨‍💼',
      status: user.status
    });
    setShowEditUserModal(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const res = updateUser(selectedUser.id, editUserForm);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update user');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    setShowEditUserModal(false);
    setSelectedUser(null);
    setMessage(`ইউজার তথ্য আপডেট সম্পন্ন (${editUserForm.name})`);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleOpenResetPassword = (user: AuthUser) => {
    setSelectedUser(user);
    setUserPasswordReset('');
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const res = resetUserPassword(selectedUser.id, userPasswordReset);
    if (!res.success) {
      setErrorMsg(res.error || 'Password reset failed');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    setShowResetPasswordModal(false);
    setSelectedUser(null);
    setMessage(`পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে (${selectedUser.name})`);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleToggleStatus = (user: AuthUser) => {
    const res = toggleUserStatus(user.id);
    if (!res.success) {
      setErrorMsg(res.error || 'Status change failed');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    setMessage(`ইউজার স্ট্যাটাস পরিবর্তন হয়েছে: ${user.name}`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteUser = (user: AuthUser) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${user.name} (${user.role})" এর অ্যাকাউন্টটি মুছে ফেলতে চান?`)) {
      const res = deleteUser(user.id);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete user');
        setTimeout(() => setErrorMsg(null), 4000);
        return;
      }
      setMessage(`ইউজার অ্যাকাউন্ট মুছে ফেলা হয়েছে: ${user.name}`);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      vatTaxNumber,
      valuationMethod,
      creditLimitHardBlock
    });
    setMessage('System configuration saved successfully!');
    setTimeout(() => setMessage(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (parsed.products && parsed.customers) {
              setRestoreSummary({
                products: parsed.products?.length || 0,
                imeis: parsed.imeis?.length || 0,
                customers: parsed.customers?.length || 0,
                invoices: parsed.salesInvoices?.length || 0,
                purchases: parsed.purchaseInvoices?.length || 0,
                exportedAt: parsed.exportedAt || 'Unknown'
              });
              setPendingRestoreJson(content);
            } else {
              setErrorMsg('Invalid backup file schema: Missing essential ERP tables.');
            }
          } catch (err) {
            setErrorMsg('Failed to parse JSON file. Please ensure it is a valid TeleCorp backup file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const confirmFileRestore = () => {
    if (pendingRestoreJson) {
      const success = importJSON(pendingRestoreJson);
      if (success) {
        setMessage('System successfully restored from uploaded JSON backup!');
      } else {
        setErrorMsg('Failed to restore from backup file.');
      }
      setPendingRestoreJson(null);
      setRestoreSummary(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const snap = createBackupSnapshot(snapshotName.trim() || undefined);
    setSnapshotName('');
    setShowSnapshotModal(false);
    setMessage(`Snapshot created: "${snap.name}"`);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleExecutePurge = () => {
    purgeTransactionalData();
    setShowPurgeModal(false);
    setMessage('All sales and purchases purged! Master product catalog and party accounts preserved.');
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExecuteWipe = () => {
    if (wipeConfirmText !== 'CONFIRM WIPE') {
      setErrorMsg('Please type "CONFIRM WIPE" exactly to authorize full reset.');
      return;
    }
    factoryResetFullWipe();
    setShowWipeModal(false);
    setWipeConfirmText('');
    setMessage('Complete factory reset executed. Restored to clean standard seed state.');
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Enterprise Backup, Snapshot & System Reset Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            পূর্ণাঙ্গ ব্যাকআপ ডাউনলোড, ইনস্ট্যান্ট স্ন্যাপশট রিস্টোরেশন এবং গ্র্যানুলার সিস্টেম রিসেট সেন্টার
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            title="Download portable JSON backup file"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 px-4 flex items-center gap-1.5 border-b-2 transition ${activeTab === 'backup'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup & Snapshots (ব্যাকআপ ও স্ন্যাপশট)</span>
        </button>

        <button
          onClick={() => setActiveTab('reset')}
          className={`pb-3 px-4 flex items-center gap-1.5 border-b-2 transition ${activeTab === 'reset'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>System Reset & Year-End Purge (সিস্টেম রিসেট)</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 flex items-center gap-1.5 border-b-2 transition ${activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Building className="w-4 h-4" />
          <span>Company Profile & Policies (প্রতিষ্ঠান সেটিংস)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & RBAC (ইউজার ও রোল পারমিশন)</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-3 px-4 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${activeTab === 'supabase'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Cloud className="w-4 h-4 text-emerald-600" />
          <span>Supabase Cloud (ক্লাউড ডাটাবেজ)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 0: USER ACCOUNTS & RBAC MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Header & Quick Add */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  কর্মকর্তা ইউজার অ্যাকাউন্ট ও এক্সেস পারমিশন কন্ট্রোল
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                সকল রোল অনুযায়ী রিয়েলটাইম লগইন অথেনটিকেশন, পাসওয়ার্ড রিসেট ও পদবী ভিত্তিক পারমিশন নিয়ন্ত্রণ
              </p>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন ইউজার যোগ করুন</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">মোট কর্মকর্তা / ইউজার</div>
              <div className="text-xl font-black text-slate-900 mt-1">{users.length} জন</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-emerald-600">সক্রিয় অ্যাকাউন্ট (Active)</div>
              <div className="text-xl font-black text-emerald-600 mt-1">
                {users.filter(u => u.status === 'Active').length} জন
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-rose-600">স্থগিত অ্যাকাউন্ট (Suspended)</div>
              <div className="text-xl font-black text-rose-600 mt-1">
                {users.filter(u => u.status === 'Suspended').length} জন
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-blue-600">নির্ধারিত পদবী ও রোল</div>
              <div className="text-xl font-black text-blue-700 mt-1">৯ টি এন্টারপ্রাইজ রোল</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="নাম, ইমেইল বা ব্রাঞ্চ দিয়ে খুঁজুন..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">পদবী ফিল্টার:</span>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="All">সকল রোল (All Roles)</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Owner">Owner</option>
                <option value="General Manager">General Manager</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Warehouse Manager">Warehouse Manager</option>
                <option value="Accounts Manager">Accounts Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Salesman">Salesman</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">কর্মকর্তা / ইউজার</th>
                    <th className="p-3.5">সিস্টেম রোল (Role)</th>
                    <th className="p-3.5">ডিপার্টমেন্ট ও শাখা</th>
                    <th className="p-3.5">মোবাইল</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5">পাসওয়ার্ড</th>
                    <th className="p-3.5">সর্বশেষ লগইন</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users
                    .filter(u => {
                      const matchesSearch =
                        !userSearch ||
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                        (u.branchName && u.branchName.toLowerCase().includes(userSearch.toLowerCase()));
                      const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map(u => {
                      const isSelf = currentUser?.id === u.id;
                      const roleBadgeColor =
                        u.role === 'Super Admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : u.role === 'Owner'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : u.role === 'General Manager'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : u.role === 'Sales Manager'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : u.role === 'Warehouse Manager'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : u.role === 'Accounts Manager' || u.role === 'Accountant'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : u.role === 'Cashier'
                                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                                      : 'bg-violet-50 text-violet-700 border-violet-200';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl p-1 bg-slate-100 rounded-xl shadow-2xs border border-slate-200 shrink-0">
                                {u.avatar || '👨‍💼'}
                              </span>
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-700">
                                      আপনি (You)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${roleBadgeColor}`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-slate-800 text-[11px]">{u.department || 'N/A'}</div>
                            <div className="text-[10px] text-slate-500">{u.branchName || 'Headquarters'}</div>
                          </td>

                          <td className="p-3.5 font-mono text-[11px] text-slate-600">
                            {u.phone || 'N/A'}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${u.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                              />
                              <span>{u.status === 'Active' ? 'সক্রিয় (Active)' : 'স্থগিত (Suspended)'}</span>
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-400 text-xs">••••••</span>
                              <button
                                type="button"
                                onClick={() => handleOpenResetPassword(u)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                title="পাসওয়ার্ড রিসেট করুন"
                              >
                                রিসেট
                              </button>
                            </div>
                          </td>

                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {u.lastLogin || 'Never logged in'}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="ইউজার তথ্য এডিট করুন"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                disabled={isSelf}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${u.status === 'Active'
                                    ? 'text-amber-600 hover:bg-amber-50 disabled:opacity-40'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                title={u.status === 'Active' ? 'অ্যাকাউন্ট স্থগিত করুন' : 'অ্যাকাউন্ট সক্রিয় করুন'}
                              >
                                {u.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                disabled={isSelf}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40 rounded-lg transition cursor-pointer"
                                title="ইউজার অ্যাকাউন্ট মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Life RBAC Matrix Explanatory Guide */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-sm text-slate-900">
                পদবী অনুযায়ী সিস্টেম এক্সেস অধিকার নির্দেশিকা (RBAC Matrix)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              টেলিকর্প ইআরপিতে প্রতিটি রোলের জন্য আলাদা প্রিভিলেজ ও মডিউল পারমিশন রিয়েলটাইমে কনফিগার করা হয়েছে:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="font-black text-purple-700">👑 Super Admin / Owner / GM</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  সকল মডিউল, সেটিংস, সিস্টেম ওয়াইপ, ব্যাকআপ, অডিট ও ফাইন্যান্সিয়াল কন্ট্রোলে শতভাগ পূর্ণ প্রবেশাধিকার।
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="font-black text-blue-700">💼 Sales Manager</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  পাইকারি সেলস, রিটেইল পিওএস, চালান, বকেয়া কালেকশন, ডিলার লিমিট, সেলসম্যান কমিশন ও সেলস রিপোর্ট।
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="font-black text-orange-700">📦 Warehouse Manager</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  স্টক ব্যালেন্স, আইএমইআই ট্র্যাকার, বারকোড স্টিকার, ব্রাঞ্চ ট্রান্সফার, পারচেজ ইনওয়ার্ড ও ওয়ারেন্টি কেয়ার।
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="font-black text-emerald-700">📊 Accounts Manager / Accountant</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  জেনারেল লেজার, চার্ট অফ অ্যাকাউন্টস, ক্যাশ বুক, ব্যাংক রিকনসিলিয়েশন, ভাউচার, ট্রায়াল ব্যালেন্স ও অডিট।
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="font-black text-violet-700">🛵 Salesman (Field Officer)</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  মোবাইল ফিল্ড অ্যাপ, ডিলার ভিজিট লগ, পাইকারি অর্ডার বুকিং, বকেয়া সংগ্রহ ও ইনস্ট্যান্ট রসিদ তৈরি।
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="font-black text-teal-700">💵 Cashier</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  এক্সপ্রেস রিটেইল পিওএস কাউন্টার, ক্যাশ গ্রহণ, মানি রিসিপ্ট, ফোন এক্সচেঞ্জ ও দৈনিক ডে-ক্লোজিং।
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 0.5: SUPABASE CLOUD DATABASE INTEGRATION */}
      {/* ============================================================== */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Supabase ক্লাউড ডাটাবেজ ও PostgreSQL সিঙ্ক হাব
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                একাধিক শাখা ও ডিভাইসে লাইভ রিয়েলটাইম সিঙ্ক, ক্লাউড ডাটাবেজ ব্যাকআপ ও সেন্ট্রাল একাউন্টিং
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${supabaseEnabled && supabaseUrl
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
                }`}>
                <span className={`w-2 h-2 rounded-full ${supabaseEnabled && supabaseUrl ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                <span>{supabaseEnabled && supabaseUrl ? 'Cloud Sync Configured' : 'Offline Local Storage'}</span>
              </span>
            </div>
          </div>

          {/* Configuration Form Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>Supabase API ক্রেডেনশিয়াল ও সংযোগ সেটিংস</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  আপনার Supabase প্রজেক্ট সেটিংস (Project Settings $\rightarrow$ API) থেকে URL ও Anon Key ইনপুট দিন
                </p>
              </div>

              {/* Enable Toggle Switch */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {supabaseEnabled ? 'ক্লাউড সিঙ্ক চালু (Enabled)' : 'ক্লাউড সিঙ্ক বন্ধ (Disabled)'}
                </span>
                <input
                  type="checkbox"
                  checked={supabaseEnabled}
                  onChange={(e) => setSupabaseEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <form onSubmit={handleSaveSupabase} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Project URL (প্রজেক্ট এপিআই লিঙ্ক) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzprojectid.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    উদাঃ https://abcdefghijklm.supabase.co
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Anon Public API Key (পাবলিক ক্লায়েন্ট কি) *
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Supabase Dashboard $\rightarrow$ Project Settings $\rightarrow$ API $\rightarrow$ Project API keys
                  </span>
                </div>
              </div>

              {/* Test Connection Feedback */}
              {supabaseTestResult && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${supabaseTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                  {supabaseTestResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {supabaseTestResult.success ? 'সংযোগ সফল (Connection Verified)' : 'সংযোগ ব্যর্থ হয়েছে'}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed">
                      {supabaseTestResult.message}
                    </p>
                    {supabaseTestResult.latencyMs !== undefined && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-200/60 rounded text-[10px] font-mono font-bold">
                        ⚡ Response Latency: {supabaseTestResult.latencyMs} ms
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={testingSupabase || !supabaseUrl.trim() || !supabaseKey.trim()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className={`w-4 h-4 text-amber-500 ${testingSupabase ? 'animate-spin' : ''}`} />
                  <span>{testingSupabase ? 'সংযোগ টেস্ট করা হচ্ছে...' : 'Ping & Test Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    সেভ ও সিঙ্ক কনফিগারেশন নিশ্চিত করুন
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Database Schema & Migration Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Schema Download & Info */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">PostgreSQL Schema & Stored Functions</h4>
                    <p className="text-[11px] text-slate-500">সম্পূর্ণ ডাটাবেজ স্কিমা ও ট্রানজেকশন ফাংশন</p>
                  </div>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed mt-3">
                  আমরা আপনার প্রজেক্টের জন্য একটি সম্পূর্ণ রেডি-টু-ইউজ SQL ফাইল <strong className="font-mono text-slate-900">supabase_schema.sql</strong> তৈরি করেছি। এতে ২৪টি টেবিল, ফরেন কি, ডুয়াল-IMEI ইনডেক্স এবং স্টোর্ড প্রসিডিউর (<strong className="font-mono">process_wholesale_sale</strong>, <strong className="font-mono">void_wholesale_sale</strong>) যুক্ত রয়েছে।
                </p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
                  <div>✓ app_users, brands, warehouses, products, imeis</div>
                  <div>✓ sales_invoices, purchase_invoices, stock_transfers</div>
                  <div>✓ journal_entries, chart_of_accounts, cash_transactions</div>
                  <div>✓ Row Level Security (RLS) & Atomic Stored Procedures</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                <a
                  href="/supabase_schema.sql"
                  download="supabase_schema.sql"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download supabase_schema.sql</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopySchemaNotice}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedSchema ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSchema ? 'সম্পূর্ণ SQL কপি হয়েছে!' : 'Copy Full SQL Script'}</span>
                </button>
              </div>
            </div>

            {/* Quick 4-Step Setup Guide */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>৪টি সহজ ধাপে ক্লাউড ডাটাবেজ চালু করার নিয়ম:</span>
              </h4>

              <div className="space-y-3 text-[11px] text-slate-600">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900">Supabase এ বিনামূল্যে প্রজেক্ট খুলুন:</strong>{' '}
                    <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>-এ লগইন করে একটি নতুন প্রজেক্ট তৈরি করুন।
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900">SQL Editor-এ স্কিমা চালান:</strong> বাম পাশের মেনু থেকে <strong>SQL Editor</strong>-এ গিয়ে বামের ডাউনলোড করা <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">supabase_schema.sql</code> ফাইলের সব কোড পেস্ট করে <strong>Run</strong> করুন।
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900">API Credentials কপি করুন:</strong> প্রজেক্টের <strong>Project Settings $\rightarrow$ Data API</strong>-তে গিয়ে <strong>Project URL</strong> এবং <strong>anon public key</strong> কপি করুন।
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                  <div>
                    <strong className="text-slate-900">কানেকশন টেস্ট ও উপভোগ করুন:</strong> ওপরের ফর্মে পেস্ট করে <strong>Ping & Test Connection</strong> দিয়ে কানেক্ট করুন। আপনার ইআরপি এখন সম্পূর্ণ ক্লাউডে চলবে!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: BACKUP & LOCAL SNAPSHOTS */}
      {/* ============================================================== */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Live System Data Volume Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Current Database Volume & Active Entities</span>
              <span className="text-xs font-normal text-slate-400">Local Cache: Healthy</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Products & Models</div>
                <div className="text-lg font-black text-slate-900 mt-1">{products.length} Models</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Tracked IMEIs</div>
                <div className="text-lg font-black text-blue-700 mt-1">{imeis.length} Devices</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Dealers & Clients</div>
                <div className="text-lg font-black text-emerald-700 mt-1">{customers.length} Shops</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Sales Invoices</div>
                <div className="text-lg font-black text-purple-700 mt-1">{salesInvoices.length} Bills</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Suppliers</div>
                <div className="text-lg font-black text-slate-900 mt-1">{suppliers.length} Vendors</div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Download & Upload) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Download Full JSON */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Download Complete JSON Backup</h4>
                    <p className="text-slate-500 text-[11px]">Portable complete snapshot for offline safety</p>
                  </div>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Generates an immutable JSON archive containing every registered phone IMEI, customer due matrix, sales bills, ledger journals, and settings.
                </p>
              </div>

              <button
                onClick={exportJSON}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export & Download Database (.json)</span>
              </button>
            </div>

            {/* Upload & Restore */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Restore Database from JSON File</h4>
                    <p className="text-slate-500 text-[11px]">Import previous backup snapshot to overwrite data</p>
                  </div>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Select a previous `.json` backup file. The system will inspect and display a verification summary before applying the changes safely.
                </p>
              </div>

              <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center cursor-pointer transition flex items-center justify-center gap-2 shadow-xs">
                <Upload className="w-4 h-4" />
                <span>Select Backup File to Restore</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Local Snapshot Rollback Hub */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  Local System Snapshots & Instant Rollback Points ({backupSnapshots.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Instant recovery checkpoints stored directly in browser storage
                </p>
              </div>

              <button
                onClick={() => setShowSnapshotModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <span>+ Create Snapshot Now</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="p-3">Snapshot Name & Reference</th>
                    <th className="p-3">Created Timestamp</th>
                    <th className="p-3 text-center">Entity Counts</th>
                    <th className="p-3 text-right">Size</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {backupSnapshots.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No manual snapshots created yet. Click "+ Create Snapshot Now" to record one.
                      </td>
                    </tr>
                  ) : (
                    backupSnapshots.map(snap => (
                      <tr key={snap.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{snap.name}</div>
                          <div className="font-mono text-[10px] text-slate-400">{snap.id}</div>
                        </td>

                        <td className="p-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {snap.timestamp}
                        </td>

                        <td className="p-3 text-center">
                          <div className="text-[11px] text-slate-600">
                            <strong>{snap.recordCounts?.products || 0}</strong> Prods • <strong>{snap.recordCounts?.imeis || 0}</strong> IMEIs • <strong>{snap.recordCounts?.invoices || 0}</strong> Invoices
                          </div>
                        </td>

                        <td className="p-3 text-right font-mono text-slate-500">
                          {(snap.sizeBytes / 1024).toFixed(1)} KB
                        </td>

                        <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                          {snap.dataJson && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Revert system to "${snap.name}"? Current unsaved changes will be overwritten.`)) {
                                  const ok = restoreFromSnapshot(snap.id);
                                  if (ok) setMessage(`Restored to snapshot: ${snap.name}`);
                                }
                              }}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition"
                            >
                              Rollback
                            </button>
                          )}

                          {snap.dataJson && (
                            <button
                              onClick={() => {
                                const blob = new Blob([snap.dataJson], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${snap.name.replace(/\s+/g, '_')}.json`;
                                link.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition"
                              title="Download snapshot JSON"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete snapshot "${snap.name}"?`)) {
                                deleteSnapshot(snap.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                            title="Delete snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SYSTEM RESET & YEAR-END PURGE */}
      {/* ============================================================== */}
      {activeTab === 'reset' && (
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>সিস্টেম রিসেট নির্দেশিকা (Data Reset Policies)</span>
            </div>
            <p className="leading-relaxed">
              সিস্টেম রিসেট করার পূর্বে একটি অটোমেটিক সেফটি ব্যাকআপ স্ন্যাপশট সংরক্ষিত হয়। আপনার ব্যবসার প্রয়োজন অনুযায়ী নিচের উপযুক্ত রিসেট অপশনটি সিলেক্ট করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Mode 1: Purge Transactions Only */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Year-End Transaction Purge</span>
                </div>
                <div className="text-[10px] text-blue-700 font-bold uppercase">নতুন অর্থবছর সাইকেল রিসেট</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  সব সেলস ইনভয়েস, পারচেজ বিল, রিটার্ন, ক্যাশ ট্রানজ্যাকশন ও বকেয়া মুছে ফেলবে। <strong>কিন্তু মাস্টার ক্যাটালগ (ফোন মডেল, ব্র্যান্ড, কাস্টমার শপ ও সাপ্লায়ার) সুরক্ষিত থাকবে।</strong>
                </p>
              </div>

              <button
                onClick={() => setShowPurgeModal(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-2xs"
              >
                Purge Transactions Only
              </button>
            </div>

            {/* Mode 2: Reset to Standard Demo Data */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Standard Demo Dataset</span>
                </div>
                <div className="text-[10px] text-amber-700 font-bold uppercase">আদর্শ ডেমো ডাটা রিসেট</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  বর্তমান ডাটাবেস পরিবর্তন মুছে ফেলে ৮টি ব্র্যান্ড, ফ্ল্যাগশিপ স্যামসাং/শাওমি ফোন ও আদর্শ বাংলাদেশি ডিস্ট্রিবিউশন ডেমো ডাটাবেসে ফিরিয়ে নিবে।
                </p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Reset all databases back to default Bangladesh mobile distribution demo state?')) {
                    resetToDemoData();
                    setMessage('System restored to standard demo dataset.');
                  }
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shadow-2xs"
              >
                Reset to Demo Seed Data
              </button>
            </div>

            {/* Mode 3: Complete Factory Wipe */}
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Full Factory Wipe</span>
                </div>
                <div className="text-[10px] text-rose-700 font-bold uppercase">সম্পূর্ণ ফ্যাক্টরি রিসেট</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  সম্পূর্ণ সিস্টেম পরিষ্কার করে ফ্যাক্টরি স্টেট এ নিয়ে যাবে। নিরাপত্তা নিশ্চিত করতে টাইপিং অথরাইজেশন প্রয়োজন।
                </p>
              </div>

              <button
                onClick={() => setShowWipeModal(true)}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-2xs"
              >
                Execute Factory Wipe...
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: COMPANY PROFILE & POLICIES */}
      {/* ============================================================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
            Enterprise Profile & Bangladesh Tax Registration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Trade Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NBR VAT Registration / BIN *</label>
              <input
                type="text"
                value={vatTaxNumber}
                onChange={(e) => setVatTaxNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Head Office Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Hotline & Mobile</label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 pt-4">
            Business Rule Engine & Inventory Valuation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inventory Valuation Model</label>
              <select
                value={valuationMethod}
                onChange={(e) => setValuationMethod(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="FIFO">FIFO (First In First Out) — Mobile Standard</option>
                <option value="Weighted Average">Weighted Average Costing</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dealer Credit Limit Enforcement</label>
              <select
                value={creditLimitHardBlock ? 'block' : 'warn'}
                onChange={(e) => setCreditLimitHardBlock(e.target.value === 'block')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="warn">Soft Warning (Allows Sale, Triggers Manager Approval)</option>
                <option value="block">Hard Block (Strictly Disallows Dispatch on Overdue)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
            >
              Save Configuration Changes
            </button>
          </div>
        </form>
      )}

      {/* Snapshot Create Modal */}
      {showSnapshotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900">Create System Snapshot</h3>
              <button onClick={() => setShowSnapshotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Snapshot Label / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Pre-Audit Backup Oct 2026"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Takes a full instant picture of all IMEIs, customers, suppliers, and ledger entries for quick 1-click rollback.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSnapshotModal(false)} className="px-4 py-2 border rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-xs">
                  Create Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore Verification Preview Modal */}
      {restoreSummary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900">Verify Backup File Before Restoring</h3>
              <button onClick={() => { setRestoreSummary(null); setPendingRestoreJson(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-900">Detected Backup Entities:</div>
                <div>• Products: <strong>{restoreSummary.products} Models</strong></div>
                <div>• Serialized IMEIs: <strong>{restoreSummary.imeis} Devices</strong></div>
                <div>• Dealers / Customers: <strong>{restoreSummary.customers} Shops</strong></div>
                <div>• Sales Invoices: <strong>{restoreSummary.invoices} Records</strong></div>
                <div>• Exported At: <span className="font-mono text-[11px]">{restoreSummary.exportedAt}</span></div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px]">
                ⚠️ Warning: Restoring this file will overwrite your active local storage database.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setRestoreSummary(null); setPendingRestoreJson(null); }}
                className="px-4 py-2 border rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmFileRestore}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Confirm & Overwrite Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Purge Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Layers className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Confirm Year-End Transaction Purge</h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                This action will wipe all historical sales bills, purchases, courier challans, cash vouchers and customer due balances.
              </p>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px]">
                ✓ All Products, Variants, IMEI items, Dealers & Suppliers <strong>WILL BE PRESERVED</strong>.
              </div>
              <p className="text-[11px] text-slate-500">
                An automated safety backup snapshot will be recorded before executing the purge.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowPurgeModal(false)} className="px-4 py-2 border rounded-xl font-semibold text-xs">
                Cancel
              </button>
              <button onClick={handleExecutePurge} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs">
                Yes, Purge Transactions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Factory Wipe Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Complete Factory Reset Authorization</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 leading-relaxed text-[11px]">
                🚨 Danger: This operation will perform a complete wipe and restore the system to factory seed state.
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Type <span className="font-mono text-rose-600 font-bold">CONFIRM WIPE</span> below to authorize:
                </label>
                <input
                  type="text"
                  placeholder="CONFIRM WIPE"
                  value={wipeConfirmText}
                  onChange={(e) => setWipeConfirmText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-rose-300 rounded-xl font-mono text-center font-bold text-rose-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowWipeModal(false)} className="px-4 py-2 border rounded-xl font-semibold text-xs">
                Cancel
              </button>
              <button
                onClick={handleExecuteWipe}
                disabled={wipeConfirmText !== 'CONFIRM WIPE'}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Authorize Full Wipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* USER MANAGEMENT MODALS (Create, Edit, Reset Password) */}
      {/* ============================================================== */}

      {/* 1. Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Users className="w-5 h-5" />
                <h3 className="font-black text-slate-900 text-base">নতুন কর্মকর্তা / ইউজার অ্যাকাউন্ট তৈরি</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম (Full Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. আবরার রহমান"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">লগইন ইমেইল (Official Email) *</label>
                  <input
                    type="email"
                    required
                    placeholder="abrar@telecorp.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সিস্টেম রোল (Role) *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="Salesman">Salesman (Field Officer)</option>
                    <option value="Cashier">Cashier (Retail POS)</option>
                    <option value="Warehouse Manager">Warehouse Manager</option>
                    <option value="Accounts Manager">Accounts Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Owner">Owner</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">লগইন পাসওয়ার্ড (Password) *</label>
                  <input
                    type="text"
                    required
                    placeholder="পাসওয়ার্ড লিখুন..."
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (Phone)</label>
                  <input
                    type="text"
                    placeholder="+880 1711-xxxxxx"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডিপার্টমেন্ট / বিভাগ</label>
                  <input
                    type="text"
                    placeholder="e.g. Field Sales / Finance"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">শাখা বা আউটলেট (Branch / Warehouse Hub)</label>
                <input
                  type="text"
                  placeholder="e.g. Central Warehouse / Dhaka Hub / Gulshan POS"
                  value={newUserForm.branchName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, branchName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  ইউজার অ্যাকাউন্ট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-black text-slate-900 text-base">ইউজার তথ্য ও পদবী এডিট</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ইমেইল (লগইন আইডি)</label>
                  <input
                    type="email"
                    disabled
                    value={editUserForm.email}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পদবী ও রোল (Role) *</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Owner">Owner</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Warehouse Manager">Warehouse Manager</option>
                    <option value="Accounts Manager">Accounts Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Salesman">Salesman</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্ট স্ট্যাটাস *</label>
                  <select
                    value={editUserForm.status}
                    onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value as 'Active' | 'Suspended' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="Active">সক্রিয় (Active)</option>
                    <option value="Suspended">স্থগিত (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডিপার্টমেন্ট / বিভাগ</label>
                  <input
                    type="text"
                    value={editUserForm.department}
                    onChange={(e) => setEditUserForm({ ...editUserForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">শাখা / ব্রাঞ্চের নাম</label>
                <input
                  type="text"
                  value={editUserForm.branchName}
                  onChange={(e) => setEditUserForm({ ...editUserForm, branchName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  আপডেট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-black text-slate-900 text-base">পাসওয়ার্ড রিসেট করুন</h3>
              </div>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="text-slate-500">ইউজার: <strong className="text-slate-900">{selectedUser.name}</strong></div>
              <div className="text-slate-500 font-mono text-[11px] mt-0.5">{selectedUser.email}</div>
              <div className="text-blue-600 font-bold text-[10px] mt-1">{selectedUser.role}</div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড (New Password) *</label>
                <input
                  type="text"
                  required
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড..."
                  value={userPasswordReset}
                  onChange={(e) => setUserPasswordReset(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  পাসওয়ার্ড আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
