import React, { useState } from 'react';
import { Package, Save, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { updateLineItem } from '../services/api';

export default function LineItemCard({ item, storeCode }) {
  // Initialize form state with existing values from the item if they exist
  const [formData, setFormData] = useState({
    'Physical Quantity': item['Physical Quantity'] || '',
    'Defective Qty': item['Defective Qty'] || '',
    'GRDC Qty': item['GRDC Qty'] || '',
    'STO Number': item['STO Number'] || '',
    'STO Date': item['STO Date'] || '',
    'STN number': item['STN number'] || '',
    'STN Date': item['STN Date'] || '',
    'Remark': item['Remark'] || '',
    'Form Filled by': item['Form Filled by'] || '',
    'SM/DM Name': item['SM/DM Name'] || '',
    'Contact Number': item['Contact Number'] || '',
  });

  const [status, setStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (status === 'success' || status === 'error') {
      setStatus('idle');
    }
  };

  const handleSave = async () => {
    setStatus('saving');
    setErrorMessage('');
    
    const response = await updateLineItem(storeCode, item['Material'], formData);
    
    if (response.success) {
      setStatus('success');
      // Revert back to idle after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMessage(response.error || 'Failed to save');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header Info */}
      <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{item['Material description']}</h3>
            <div className="flex items-center text-sm text-slate-500 mt-1 gap-3 flex-wrap">
              <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">Material: <span className="font-medium text-slate-700">{item['Material']}</span></span>
              <span>Category: {item['Category']}</span>
              <span>Slab: {item['Slab'] || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right bg-white p-3 rounded-xl border border-slate-200 min-w-[100px]">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">SOH</p>
          <p className="text-2xl font-bold text-slate-800">{item['SOH']}</p>
        </div>
      </div>

      {/* Form Area */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        <InputField label="Physical Quantity" name="Physical Quantity" value={formData['Physical Quantity']} onChange={handleChange} type="number" />
        <InputField label="Defective Qty" name="Defective Qty" value={formData['Defective Qty']} onChange={handleChange} type="number" />
        <InputField label="GRDC Qty" name="GRDC Qty" value={formData['GRDC Qty']} onChange={handleChange} type="number" />
        
        <div className="h-px bg-slate-100 col-span-full my-2"></div>
        
        <InputField label="STO Number" name="STO Number" value={formData['STO Number']} onChange={handleChange} />
        <InputField label="STO Date" name="STO Date" value={formData['STO Date']} onChange={handleChange} type="date" />
        <InputField label="STN Number" name="STN number" value={formData['STN number']} onChange={handleChange} />
        <InputField label="STN Date" name="STN Date" value={formData['STN Date']} onChange={handleChange} type="date" />
        
        <div className="h-px bg-slate-100 col-span-full my-2"></div>

        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Form Filled By</label>
          <select 
            name="Form Filled by" 
            value={formData['Form Filled by']} 
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all sm:text-sm text-slate-700"
          >
            <option value="">Select Option</option>
            <option value="SM">Store Manager (SM)</option>
            <option value="DM">Department Manager (DM)</option>
          </select>
        </div>
        
        <InputField label="SM/DM Name" name="SM/DM Name" value={formData['SM/DM Name']} onChange={handleChange} />
        <InputField label="Contact Number" name="Contact Number" value={formData['Contact Number']} onChange={handleChange} type="tel" />
        <InputField label="Remark" name="Remark" value={formData['Remark']} onChange={handleChange} />
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <div className="text-sm">
          {status === 'error' && (
            <span className="text-red-500 flex items-center"><AlertCircle className="w-4 h-4 mr-1.5" /> {errorMessage}</span>
          )}
          {status === 'success' && (
            <span className="text-emerald-600 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Saved successfully</span>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="flex items-center px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === 'saving' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {status === 'saving' ? 'Saving...' : 'Save Updates'}
        </button>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all sm:text-sm text-slate-700"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
