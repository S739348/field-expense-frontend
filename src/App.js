import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import './styles/global.css';

function AppContent() {
  const { user } = useAuth();
  
  return (
    <div className="App">
      {user ? <Navbar /> : <Login />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;