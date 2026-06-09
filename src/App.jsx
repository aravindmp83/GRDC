import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CMDashboard from './pages/CMDashboard';

function App() {
  const [storeData, setStoreData] = useState(null);
  const [isCM, setIsCM] = useState(false);
  const [cmName, setCmName] = useState('');

  useEffect(() => {
    const savedSession = localStorage.getItem('grdc_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.isCM) {
          setIsCM(true);
          setCmName(parsed.cmName || '');
        } else {
          setStoreData(parsed);
        }
      } catch (e) {
        localStorage.removeItem('grdc_session');
      }
    }
  }, []);

  const handleLoginSuccess = (data) => {
    if (data.isCM) {
      setIsCM(true);
      setCmName(data.cmName || '');
      localStorage.setItem('grdc_session', JSON.stringify({ isCM: true, cmName: data.cmName || '' }));
    } else {
      setStoreData(data);
      localStorage.setItem('grdc_session', JSON.stringify(data));
    }
  };

  const handleAccessStore = (data) => {
    setIsCM(false);
    setStoreData(data);
    localStorage.setItem('grdc_session', JSON.stringify(data));
  };

  const handleLogout = () => {
    setStoreData(null);
    setIsCM(false);
    setCmName('');
    localStorage.removeItem('grdc_session');
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-brand-500 selection:text-white">
        <Routes>
          <Route 
            path="/login" 
            element={
              isCM ? <Navigate to="/cm-dashboard" /> : storeData ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              storeData ? <Dashboard storeData={storeData} onLogout={handleLogout} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/cm-dashboard" 
            element={
              isCM ? <CMDashboard cmName={cmName} onLogout={handleLogout} onAccessStore={handleAccessStore} /> : <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to={isCM ? "/cm-dashboard" : storeData ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
