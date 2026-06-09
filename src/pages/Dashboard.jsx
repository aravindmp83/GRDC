import React, { useState } from 'react';
import { LogOut, LayoutGrid, AlertTriangle, Save, Loader2, CheckCircle2, FileText, UserCircle } from 'lucide-react';
import LineItemCard from '../components/LineItemCard';
import { batchUpdateLineItems } from '../services/api';

export default function Dashboard({ storeData, onLogout }) {
  const [items, setItems] = useState(storeData.items || []);
  
  // Try to find existing global data from the first item
  const firstItem = items[0] || {};
  const [globalData, setGlobalData] = useState({
    'Form Filled by': firstItem['Form Filled by'] || '',
    'SM/DM Name': firstItem['SM/DM Name'] || '',
    'Contact Number': firstItem['Contact Number'] || '',
    'Remark': firstItem['Remark'] || '',
  });

  const [status, setStatus] = useState('idle'); // idle, saving, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleGlobalChange = (e) => {
    setGlobalData({ ...globalData, [e.target.name]: e.target.value });
    if (status === 'success' || status === 'error') setStatus('idle');
  };

  const handleItemChange = (material, field, value) => {
    setItems(items.map(it => it['Material'] === material ? { ...it, [field]: value } : it));
    if (status === 'success' || status === 'error') setStatus('idle');
  };

  const handleSaveAll = async () => {
    setStatus('saving');
    setErrorMsg('');

    // Prepare batch update array
    const batch = items.map(item => {
      return {
        storeCode: storeData.storeCode,
        material: item['Material'],
        updates: {
          'Physical Quantity': item['Physical Quantity'] || '',
          'Defective Qty': item['Defective Qty'] || '',
          'GRDC Qty': item['GRDC Qty'] || '',
          'STO Number': item['STO Number'] || '',
          'STO Date': item['STO Date'] || '',
          'STN number': item['STN number'] || '',
          'STN Date': item['STN Date'] || '',
          ...globalData // Attach global data to every item
        }
      };
    });

    const response = await batchUpdateLineItems(batch);
    if (response.success) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMsg(response.error || "Failed to save.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center p-8 glass rounded-3xl max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Data Available</h2>
          <p className="text-slate-500 mb-6">We couldn't find any materials assigned to your store.</p>
          <button onClick={onLogout} className="px-6 py-2 bg-slate-800 text-white rounded-xl">Go Back</button>
        </div>
      </div>
    );
  }

  // Calculate Summary
  let totalSOH = 0;
  let totalPhysical = 0;
  let totalDefective = 0;
  let totalGRDC = 0;
  let countSTO = 0;
  let countSTN = 0;

  items.forEach(item => {
    totalSOH += parseInt(item['SOH']) || 0;
    totalPhysical += parseInt(item['Physical Quantity']) || 0;
    totalDefective += parseInt(item['Defective Qty']) || 0;
    totalGRDC += parseInt(item['GRDC Qty']) || 0;
    if (String(item['STO Number']).trim() !== '') countSTO++;
    if (String(item['STN number']).trim() !== '') countSTN++;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center mr-3">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-tight">GRDC Tracker</h1>
                <p className="text-xs text-slate-500 font-medium">Store: {storeData.storeName} ({storeData.storeCode})</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm font-medium text-slate-500">Items: {items.length}</span>
              <button 
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Unified Store Summary & Global Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-brand-600" />
              Store Summary
            </h2>
          </div>
          
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 border-b border-slate-100">
            <StatBox label="Total SOH" value={totalSOH} />
            <StatBox label="Physical Qty" value={totalPhysical} />
            <StatBox label="Defective Qty" value={totalDefective} />
            <StatBox label="GRDC Qty" value={totalGRDC} />
            <StatBox label="STOs Raised" value={countSTO} />
            <StatBox label="STNs Done" value={countSTN} />
          </div>

          <div className="p-5 bg-white">
            <h3 className="text-sm font-bold text-slate-800 flex items-center mb-4">
              <UserCircle className="w-4 h-4 mr-2 text-slate-500" />
              Manager Details & Consolidated Remarks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Form Filled By</label>
                <select 
                  name="Form Filled by" 
                  value={globalData['Form Filled by']} 
                  onChange={handleGlobalChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                >
                  <option value="">Select Option</option>
                  <option value="SM">Store Manager (SM)</option>
                  <option value="DM">Department Manager (DM)</option>
                </select>
              </div>
              <GlobalInput label="SM/DM Name" name="SM/DM Name" value={globalData['SM/DM Name']} onChange={handleGlobalChange} />
              <GlobalInput label="Contact Number" name="Contact Number" value={globalData['Contact Number']} onChange={handleGlobalChange} type="tel" />
              <GlobalInput label="Consolidated Remark" name="Remark" value={globalData['Remark']} onChange={handleGlobalChange} />
            </div>
          </div>
        </div>

        {/* Action Bar (Sticky bottom mobile, inline desktop) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-brand-100 sticky top-[72px] z-40 lg:relative lg:top-0">
          <div className="text-sm font-medium">
            {status === 'error' && <span className="text-red-500 flex items-center"><AlertTriangle className="w-4 h-4 mr-1.5" /> {errorMsg}</span>}
            {status === 'success' && <span className="text-emerald-600 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5" /> All items saved successfully!</span>}
            {status === 'idle' && <span className="text-slate-500">Don't forget to save your changes.</span>}
          </div>
          <button
            onClick={handleSaveAll}
            disabled={status === 'saving'}
            className="flex items-center px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'saving' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {status === 'saving' ? 'Saving All...' : 'Save All Updates'}
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-4 mt-6">
          {items.map((item, index) => (
            <LineItemCard 
              key={`${item.Material}-${index}`} 
              item={item} 
              onChange={handleItemChange} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function GlobalInput({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm text-slate-700"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
