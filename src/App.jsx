import React, { useState, useEffect } from 'react';
import Login from './Login';
import FinanceApp from './FinanceApp';

const App = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');

    try {
      // evita JSON.parse("undefined") ou JSON.parse("null")
      if (
        usuarioSalvo &&
        usuarioSalvo !== "undefined" &&
        usuarioSalvo !== "null"
      ) {
        setUsuario(JSON.parse(usuarioSalvo));
      } else {
        // caso esteja corrompido, remove
        localStorage.removeItem('usuario');
      }
    } catch (e) {
      console.error("Erro ao carregar usuário:", e);
      localStorage.removeItem('usuario');
    }
  }, []);

  const handleLogin = (user) => {
    // Evita salvar "undefined" no localStorage
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
    }
    setUsuario(user || null);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('financeData');
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return <FinanceApp usuario={usuario} onLogout={handleLogout} />;
};

export default App;
