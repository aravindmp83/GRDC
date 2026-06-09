import React, { useState } from 'react';
import { PackageOpen, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { login } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [storeCode, setStoreCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (storeCode.trim() !== password.trim()) {
      setError("User ID and Password must match the 4-character Store Code.");
      return;
    }

    if (storeCode.length < 3) {
      setError("Invalid Store Code.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await login(storeCode.trim());
      if (response.success) {
        onLoginSuccess({
          storeCode: storeCode.trim(),
          storeName: response.storeName,
          items: response.items
        });
      } else {
        setError(response.error || "Login failed. Store Code not found.");
      }
    } catch (err) {
      setError("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-50 to-slate-100 p-4">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="glass w-full max-w-md p-8 rounded-3xl z-10 relative">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-brand-200">
            <PackageOpen className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">GRDC Tracker</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage your store's materials</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start">
            <ShieldCheck className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="userId">
              User ID (Store Code)
            </label>
            <input
              id="userId"
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="e.g. 8109"
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="Enter Store Code again"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !storeCode || !password}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Access Portal
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
