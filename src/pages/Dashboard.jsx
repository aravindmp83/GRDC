import React from 'react';
import { LogOut, LayoutGrid, AlertTriangle } from 'lucide-react';
import LineItemCard from '../components/LineItemCard';

export default function Dashboard({ storeData, onLogout }) {
  
  if (!storeData || !storeData.items) {
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

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
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
            <div className="flex items-center">
              <button 
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Assigned Materials</h2>
            <p className="text-slate-500 mt-1">Review and update details for your assigned line items.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
            Total Items: <span className="text-brand-600 ml-1">{storeData.items.length}</span>
          </div>
        </div>

        <div className="space-y-6">
          {storeData.items.map((item, index) => (
            <LineItemCard 
              key={`${item.Material}-${index}`} 
              item={item} 
              storeCode={storeData.storeCode} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}
