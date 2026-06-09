import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [storeData, setStoreData] = useState(null);

  useEffect(() => {
    // Basic persistent session
    const savedSession = localStorage.getItem('grdc_session');
    if (savedSession) {
      try {
        setStoreData(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem('grdc_session');
      }
    }
  }, []);

  const handleLoginSuccess = (data) => {
    setStoreData(data);
    localStorage.setItem('grdc_session', JSON.stringify(data));
  };

  const handleLogout = () => {
    setStoreData(null);
    localStorage.removeItem('grdc_session');
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-brand-500 selection:text-white">
        <Routes>
          <Route 
            path="/login" 
            element={
              storeData ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              storeData ? <Dashboard storeData={storeData} onLogout={handleLogout} /> : <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to={storeData ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
