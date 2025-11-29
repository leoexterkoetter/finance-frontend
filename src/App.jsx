import React, { useState, useEffect } from 'react';
import Login from './Login';
import FinanceApp from './FinanceApp';

const App = () => {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (tokenSalvo && tokenSalvo !== 'undefined') {
      setToken(tokenSalvo);

      try {
        if (usuarioSalvo && usuarioSalvo !== 'undefined') {
          setUsuario(JSON.parse(usuarioSalvo));
        }
      } catch {
        localStorage.removeItem('usuario');
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }

    setCarregando(false);
  }, []);

  const handleLogin = ({ token, usuario }) => {
    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
    }

    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setUsuario(usuario);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('financeData');
    setToken(null);
    setUsuario(null);
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Carregando...
      </div>
    );
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return <FinanceApp usuario={usuario} onLogout={handleLogout} />;
};

export default App;
