import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!token ? (
              showRegister ? 
                <Register setToken={setToken} onSwitchToLogin={() => setShowRegister(false)} /> : 
                <Login setToken={setToken} onSwitchToRegister={() => setShowRegister(true)} />
            ) : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!token ? <Register setToken={setToken} onSwitchToLogin={() => setShowRegister(false)} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard token={token} setToken={setToken} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
