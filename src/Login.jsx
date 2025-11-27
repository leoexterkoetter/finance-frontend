import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState({ email: '', senha: '', nome: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
  const endpoint = modo === 'login' ? '/api/login' : '/api/cadastro';

  const response = await fetch(`http://localhost:3307${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  });

  const data = await response.json();

  if (response.ok) {
    if (modo === 'cadastro') {
      setModo('login');
      setForm({ email: form.email, senha: '', nome: '' });
      alert('Cadastro realizado! Faça login.');
    } else {
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      onLogin(data.usuario);
    }
  } else {
    setErro(data.erro || 'Erro ao processar requisição');
  }
} catch (error) {
  setErro('Erro ao conectar com servidor');
} finally {
  setCarregando(false);
}

  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">💰 Finanças</h1>
          <p className="text-gray-400">Gerencie seu dinheiro com inteligência</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setModo('login');
              setErro('');
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              modo === 'login' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <LogIn className="inline mr-2" size={18} />
            Login
          </button>
          <button
            onClick={() => {
              setModo('cadastro');
              setErro('');
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              modo === 'cadastro' ? 'bg-green-600' : 'bg-gray-700'
            }`}
          >
            <UserPlus className="inline mr-2" size={18} />
            Cadastro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === 'cadastro' && (
            <div>
              <label className="block text-sm mb-2 text-gray-300">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="Seu nome"
                required={modo === 'cadastro'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-2 text-gray-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-300">Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              modo === 'login'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            } ${carregando ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {carregando ? 'Processando...' : modo === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;