import React from 'react';
import { Package } from 'lucide-react';

export default function LineItemCard({ item, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(item['Material'], name, value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">{item['Material description']}</h3>
            <div className="flex items-center text-xs text-slate-500 mt-1 gap-2 flex-wrap">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Mat: <span className="font-medium text-slate-700">{item['Material']}</span></span>
              <span>Cat: {item['Category']}</span>
              <span>Slab: {item['Slab'] || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right bg-white px-4 py-2 rounded-xl border border-slate-200 min-w-[80px]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">SOH</p>
          <p className="text-xl font-bold text-slate-800 leading-none">{item['SOH']}</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <InputField label="Physical Qty" name="Physical Quantity" value={item['Physical Quantity'] || ''} onChange={handleChange} type="number" />
        <InputField label="Defective Qty" name="Defective Qty" value={item['Defective Qty'] || ''} onChange={handleChange} type="number" />
        <InputField label="GRDC Qty" name="GRDC Qty" value={item['GRDC Qty'] || ''} onChange={handleChange} type="number" />
        
        <div className="h-px bg-slate-100 col-span-full my-1"></div>
        
        <InputField label="STO Number" name="STO Number" value={item['STO Number'] || ''} onChange={handleChange} />
        <InputField label="STO Date" name="STO Date" value={item['STO Date'] || ''} onChange={handleChange} type="date" />
        <InputField label="STN Number" name="STN number" value={item['STN number'] || ''} onChange={handleChange} />
        <InputField label="STN Date" name="STN Date" value={item['STN Date'] || ''} onChange={handleChange} type="date" />
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm text-slate-700"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
