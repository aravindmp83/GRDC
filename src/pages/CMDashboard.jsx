import React, { useState, useEffect } from 'react';
import { LogOut, Activity, Users, MapPin, Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { fetchCMData } from '../services/api';

export default function CMDashboard({ cmName, onLogout, onAccessStore }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [cmName]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    const response = await fetchCMData();
    if (response.success) {
      let fetchedItems = response.items || [];
      if (cmName && cmName !== 'All CMs') {
        fetchedItems = fetchedItems.filter(item => item['CM'] === cmName);
      }
      setData(fetchedItems);
    } else {
      setError(response.error || "Failed to load data.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 glass rounded-3xl max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={loadData} className="px-6 py-2 bg-brand-600 text-white rounded-xl">Retry</button>
            <button onClick={onLogout} className="px-6 py-2 bg-slate-800 text-white rounded-xl">Logout</button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Aggregates
  const uniqueStores = new Set(data.map(item => item['Store_Code']));
  const totalStores = uniqueStores.size;
  
  let totalSOH = 0;
  let totalGRDC = 0;
  let totalDefective = 0;
  let noOfSTO = 0;
  let noOfSTN = 0;

  const stateData = {};
  const storeSummaryData = {};
  const cmSummaryData = {};

  data.forEach(item => {
    const soh = parseInt(item['SOH']) || 0;
    const grdc = parseInt(item['GRDC Qty']) || 0;
    const def = parseInt(item['Defective Qty']) || 0;
    const hasSTO = item['STO Number'] && String(item['STO Number']).trim() !== '';
    const hasSTN = item['STN number'] && String(item['STN number']).trim() !== '';

    totalSOH += soh;
    totalGRDC += grdc;
    totalDefective += def;
    if (hasSTO) noOfSTO++;
    if (hasSTN) noOfSTN++;

    // CM Summary
    const cm = item['CM'] || 'Unassigned';
    if (!cmSummaryData[cm]) {
      cmSummaryData[cm] = { stores: new Set(), soh: 0, grdc: 0, defective: 0, sto: 0, stn: 0 };
    }
    cmSummaryData[cm].stores.add(item['Store_Code']);
    cmSummaryData[cm].soh += soh;
    cmSummaryData[cm].grdc += grdc;
    cmSummaryData[cm].defective += def;
    if (hasSTO) cmSummaryData[cm].sto++;
    if (hasSTN) cmSummaryData[cm].stn++;

    // State aggregation
    const state = item['State'] || 'Unknown';
    if (!stateData[state]) {
      stateData[state] = { stores: new Set(), soh: 0, grdc: 0, defective: 0, sto: 0, stn: 0 };
    }
    stateData[state].stores.add(item['Store_Code']);
    stateData[state].soh += soh;
    stateData[state].grdc += grdc;
    stateData[state].defective += def;
    if (hasSTO) stateData[state].sto++;
    if (hasSTN) stateData[state].stn++;

    // Store aggregation
    const storeCode = item['Store_Code'];
    if (!storeSummaryData[storeCode]) {
      storeSummaryData[storeCode] = { name: item['Store_Name'] || 'Unknown', soh: 0, grdc: 0, defective: 0, sto: 0, stn: 0 };
    }
    storeSummaryData[storeCode].soh += soh;
    storeSummaryData[storeCode].grdc += grdc;
    storeSummaryData[storeCode].defective += def;
    if (hasSTO) storeSummaryData[storeCode].sto++;
    if (hasSTN) storeSummaryData[storeCode].stn++;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-tight">CM Dashboard</h1>
                <p className="text-xs text-slate-500 font-medium">Cluster Manager View {cmName && cmName !== 'All CMs' ? `- ${cmName}` : ''}</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Global Summary Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-brand-600" />
            Global Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SummaryCard title="Total Stores" value={totalStores} />
            <SummaryCard title="Total SOH" value={totalSOH} />
            <SummaryCard title="Total Qty GRDC" value={totalGRDC} />
            <SummaryCard title="Total Defective" value={totalDefective} />
            <SummaryCard title="STO Raised" value={noOfSTO} />
            <SummaryCard title="STN Done" value={noOfSTN} />
          </div>
        </div>

        {/* CM View (Only for All CMs) */}
        {cmName === 'All CMs' && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-brand-600" />
            Cluster Manager View
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Cluster Manager</th>
                    <th className="px-6 py-4">Stores</th>
                    <th className="px-6 py-4">SOH</th>
                    <th className="px-6 py-4">GRDC Qty</th>
                    <th className="px-6 py-4">Defective</th>
                    <th className="px-6 py-4">STO Raised</th>
                    <th className="px-6 py-4">STN Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.keys(cmSummaryData).sort().map(cm => {
                    const sd = cmSummaryData[cm];
                    return (
                      <tr key={cm} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{cm}</td>
                        <td className="px-6 py-4">{sd.stores.size}</td>
                        <td className="px-6 py-4">{sd.soh}</td>
                        <td className="px-6 py-4">{sd.grdc}</td>
                        <td className="px-6 py-4">{sd.defective}</td>
                        <td className="px-6 py-4">{sd.sto}</td>
                        <td className="px-6 py-4">{sd.stn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        {/* State View */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-brand-600" />
            State View
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">State</th>
                    <th className="px-6 py-4">Stores</th>
                    <th className="px-6 py-4">SOH</th>
                    <th className="px-6 py-4">GRDC Qty</th>
                    <th className="px-6 py-4">Defective</th>
                    <th className="px-6 py-4">STO Raised</th>
                    <th className="px-6 py-4">STN Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.keys(stateData).sort().map(state => {
                    const sd = stateData[state];
                    return (
                      <tr key={state} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{state}</td>
                        <td className="px-6 py-4">{sd.stores.size}</td>
                        <td className="px-6 py-4">{sd.soh}</td>
                        <td className="px-6 py-4">{sd.grdc}</td>
                        <td className="px-6 py-4">{sd.defective}</td>
                        <td className="px-6 py-4">{sd.sto}</td>
                        <td className="px-6 py-4">{sd.stn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Store View */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-brand-600" />
            Store View <span className="text-sm font-normal text-slate-500 ml-2">(Click a store to open it)</span>
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Store Code</th>
                    <th className="px-6 py-4">Store Name</th>
                    <th className="px-6 py-4">SOH</th>
                    <th className="px-6 py-4">GRDC Qty</th>
                    <th className="px-6 py-4">Defective</th>
                    <th className="px-6 py-4">STO Raised</th>
                    <th className="px-6 py-4">STN Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.keys(storeSummaryData).sort().map(code => {
                    const sd = storeSummaryData[code];
                    return (
                      <tr 
                         key={code} 
                         className="hover:bg-brand-50 transition-colors cursor-pointer group"
                         onClick={() => {
                            const storeItems = data.filter(it => it['Store_Code'] == code);
                            onAccessStore({
                               storeCode: code,
                               storeName: sd.name,
                               items: storeItems
                            });
                         }}
                      >
                        <td className="px-6 py-4 font-medium text-brand-600 group-hover:text-brand-700 underline decoration-brand-200 underline-offset-2">{code}</td>
                        <td className="px-6 py-4 font-medium text-slate-800 group-hover:text-brand-800">{sd.name}</td>
                        <td className="px-6 py-4">{sd.soh}</td>
                        <td className="px-6 py-4">{sd.grdc}</td>
                        <td className="px-6 py-4">{sd.defective}</td>
                        <td className="px-6 py-4">{sd.sto}</td>
                        <td className="px-6 py-4">{sd.stn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{title}</span>
      <span className="text-3xl font-bold text-slate-800">{value}</span>
    </div>
  );
}
