import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Edit2, Copy, Trash2, Save, X, Home, CreditCard, Car, ShoppingCart, Utensils, Pill, Zap, Wifi, Smartphone, Music, CheckCircle, AlertCircle, BarChart3, LogOut, Wallet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import PeriodSelector from './components/PeriodSelector';
import { exportarPDF } from './services/pdfExport';

const API_URL = 'https://finance-backend-production-8578.up.railway.app';


// Cores e ícones por categoria
const CATEGORIA_CONFIG = {
  'Empréstimos': { cor: '#60A5FA', icon: DollarSign },
  'Aluguel/Condomínio': { cor: '#34D399', icon: Home },
  'Internet': { cor: '#A78BFA', icon: Wifi },
  'Celular': { cor: '#F472B6', icon: Smartphone },
  'Carro': { cor: '#FB923C', icon: Car },
  'Assinaturas': { cor: '#FBBF24', icon: Music },
  'Cartões de Crédito': { cor: '#EF4444', icon: CreditCard },
  'Mercado': { cor: '#10B981', icon: ShoppingCart },
  'Farmácia': { cor: '#06B6D4', icon: Pill },
  'Gasolina': { cor: '#F97316', icon: Zap },
  'Lazer': { cor: '#EC4899', icon: Music },
  'Compras': { cor: '#8B5CF6', icon: ShoppingCart },
  'Salário': { cor: '#22C55E', icon: TrendingUp },
  'Freelance': { cor: '#3B82F6', icon: DollarSign },
  'Investimentos': { cor: '#14B8A6', icon: TrendingUp },
  'Outros': { cor: '#6B7280', icon: DollarSign }
};

const CATEGORIAS_PADRAO = {
  fixos: ['Empréstimos', 'Aluguel/Condomínio', 'Internet', 'Celular', 'Carro', 'Assinaturas'],
  variaveis: ['Cartões de Crédito', 'Mercado', 'Farmácia', 'Gasolina', 'Lazer', 'Compras'],
  receitas: ['Salário', 'Freelance', 'Investimentos', 'Outros']
};

const FinanceApp = ({ usuario, onLogout }) => {
  const [tela, setTela] = useState('dashboard');
  const [modalRapido, setModalRapido] = useState(false);
  const [modalCaixinha, setModalCaixinha] = useState(false);
  const [transacoes, setTransacoes] = useState([]);
  const [caixinhas, setCaixinhas] = useState([]);
  const [categorias, setCategorias] = useState(CATEGORIAS_PADRAO);
  const [mesAtual, setMesAtual] = useState(new Date().toISOString().slice(0, 7));
  const [notas, setNotas] = useState({});
  const [filtros, setFiltros] = useState({ categoria: 'todas', tipo: 'todos' });
  const [transacaoEdit, setTransacaoEdit] = useState(null);

  const [form, setForm] = useState({
    valor: '',
    categoria: '',
    tipo: 'gasto',
    data: new Date().toISOString().slice(0, 10),
    descricao: '',
    fixo: false,
    pago: false,
    parcelas: 1
  });

  const [formRapido, setFormRapido] = useState({
    valor: '',
    categoria: '',
    tipo: 'gasto'
  });

  const [formCaixinha, setFormCaixinha] = useState({
    nome: '',
    valor_total: '',
    parcelas_total: '',
    data_inicio: new Date().toISOString().slice(0, 10)
  });

  // Carregar transações do backend
  useEffect(() => {
  const carregarTransacoes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/transacoes/${usuario.id}`);
      if (response.ok) {
        const dados = await response.json();
        
        const transacoesFormatadas = dados.map(t => ({
          ...t,
          id: t._id || t.id, // ✅ ADICIONE ESTA LINHA - usar _id do MongoDB
          valor: parseFloat(t.valor),
          fixo: Boolean(t.fixo),
          pago: Boolean(t.pago)
        }));
        
        setTransacoes(transacoesFormatadas);
      }
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
      alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
  };
  carregarTransacoes();
  gerarGastosFixosAutomaticos();
}, [usuario.id]);

  // Carregar caixinhas do backend
  useEffect(() => {
    const carregarCaixinhas = async () => {
      try {
        const response = await fetch(`${API_URL}/api/caixinhas/${usuario.id}`);

if (response.ok) {
  const dados = await response.json();
          const caixinhasFormatadas = dados.map(c => ({
            ...c,
            valor_total: parseFloat(c.valor_total),
            valor_pago: parseFloat(c.valor_pago)
          }));
          setCaixinhas(caixinhasFormatadas);
        }
      } catch (err) {
        console.error("Erro ao carregar caixinhas:", err);
      }
    };
    carregarCaixinhas();
  }, [usuario.id]);

  // Gerar gastos fixos automaticamente
  const gerarGastosFixosAutomaticos = () => {
    const dados = JSON.parse(localStorage.getItem('financeData') || '{}');
    const trans = dados.transacoes || [];
    const mesAtualDate = new Date();
    const mesAtualStr = mesAtualDate.toISOString().slice(0, 7);
    
    const fixosDoMes = trans.filter(t => 
      t.fixo && 
      t.tipo === 'gasto' && 
      t.data.startsWith(mesAtualStr)
    );

    if (fixosDoMes.length === 0) {
      const mesAnterior = new Date(mesAtualDate.getFullYear(), mesAtualDate.getMonth() - 1, 1);
      const mesAnteriorStr = mesAnterior.toISOString().slice(0, 7);
      
      const fixosAnteriores = trans.filter(t => 
        t.fixo && 
        t.tipo === 'gasto' && 
        t.data.startsWith(mesAnteriorStr)
      );

      const novosFixos = fixosAnteriores.map(t => ({
        ...t,
        id: Date.now() + Math.random(),
        data: `${mesAtualStr}-${t.data.slice(8)}`,
        pago: false
      }));

      if (novosFixos.length > 0) {
        setTransacoes([...trans, ...novosFixos]);
      }
    }
  };

  // Lançamento rápido (modal)
  const salvarRapido = async () => {
    if (!formRapido.valor || !formRapido.categoria) {
      alert('Preencha valor e categoria');
      return;
    }

    const novaTransacao = {
      usuario_id: usuario.id,
      valor: parseFloat(formRapido.valor),
      categoria: formRapido.categoria,
      tipo: formRapido.tipo,
      data: new Date().toISOString().slice(0, 10),
      descricao: '',
      fixo: false,
      pago: false
    };
    
    try {
      const response = await fetch(`${API_URL}/api/transacoes`, {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaTransacao)
      });

      const dados = await response.json();
      setTransacoes([...transacoes, { ...novaTransacao, id: dados.id }]);
      setFormRapido({ valor: '', categoria: '', tipo: 'gasto' });
      setModalRapido(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar transação");
    }
  };

  const adicionarTransacao = async () => {
    if (!form.valor || !form.categoria) {
      alert('Preencha valor e categoria');
      return;
    }

    const novaTransacao = {
      usuario_id: usuario.id,
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      tipo: form.tipo,
      data: form.data,
      descricao: form.descricao,
      fixo: form.fixo,
      pago: form.pago,
      parcelas: parseInt(form.parcelas) || 1
    };

    try {
      if (transacaoEdit) {
        // ATUALIZAR (sem parcelas)
        await fetch(`${API_URL}/api/transacoes/${transacaoEdit.id}`, {
  method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaTransacao)
        });
        
        setTransacoes(transacoes.map(t => 
          t.id === transacaoEdit.id ? { ...novaTransacao, id: transacaoEdit.id } : t
        ));
      } else {
        // CRIAR (com ou sem parcelas)
        const endpoint = novaTransacao.parcelas > 1 
  ? `${API_URL}/api/transacoes/parcelada`
  : `${API_URL}/api/transacoes`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaTransacao)
        });
        
        const dados = await response.json();
        
        // Recarrega as transações do banco
        const responseTransacoes = await fetch(`${API_URL}/api/transacoes/${usuario.id}`);
        const todasTransacoes = await responseTransacoes.json();
        const transacoesFormatadas = todasTransacoes.map(t => ({
          ...t,
          valor: parseFloat(t.valor),
          fixo: Boolean(t.fixo),
          pago: Boolean(t.pago)
        }));
        setTransacoes(transacoesFormatadas);
        
        if (novaTransacao.parcelas > 1) {
          alert(`✅ ${novaTransacao.parcelas} parcelas criadas com sucesso!`);
        }
      }

      setForm({
        valor: '',
        categoria: '',
        tipo: 'gasto',
        data: new Date().toISOString().slice(0, 10),
        descricao: '',
        fixo: false,
        pago: false,
        parcelas: 1
      });
      setTransacaoEdit(null);
      setTela('dashboard');
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar transação");
    }
  };

  const duplicarTransacao = async (t) => {
    const novaTransacao = {
      usuario_id: usuario.id,
      valor: t.valor,
      categoria: t.categoria,
      tipo: t.tipo,
      data: new Date().toISOString().slice(0, 10),
      descricao: t.descricao,
      fixo: t.fixo,
      pago: false
    };

    try {
      const response = await fetch(`${API_URL}/api/transacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaTransacao)
      });

      const dados = await response.json();
      setTransacoes([...transacoes, { ...novaTransacao, id: dados.id }]);
    } catch (err) {
      console.error("Erro ao duplicar:", err);
      alert("Erro ao duplicar transação");
    }
  };

  const deletarTransacao = async (id) => {
    const confirmar = window.confirm('Deseja realmente excluir esta transação?');
    if (confirmar) {
      try {
        await fetch(`${API_URL}/api/transacoes/${id}`, {
          method: 'DELETE'
        });
        setTransacoes(transacoes.filter(t => t.id !== id));
      } catch (err) {
        console.error("Erro ao deletar:", err);
        alert("Erro ao deletar transação");
      }
    }
  };

  const editarTransacao = (t) => {
    setTransacaoEdit(t);
    setForm({
      valor: t.valor.toString(),
      categoria: t.categoria,
      tipo: t.tipo,
      data: t.data,
      descricao: t.descricao,
      fixo: t.fixo,
      pago: t.pago,
      parcelas: 1
    });
    setTela('adicionar');
  };

  const togglePago = async (id) => {
    const transacao = transacoes.find(t => t.id === id);
    
    try {
      await fetch(`${API_URL}/api/transacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transacao,
          pago: !transacao.pago
        })
      });
      
      setTransacoes(transacoes.map(t => t.id === id ? { ...t, pago: !t.pago } : t));
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      alert("Erro ao atualizar status");
    }
  };

  const calcularTotais = (mes) => {
    const transacoesMes = transacoes.filter(t => t.data.startsWith(mes));
    const gastos = transacoesMes.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.valor, 0);
    const receitas = transacoesMes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0);
    const fixos = transacoesMes.filter(t => t.tipo === 'gasto' && t.fixo).reduce((sum, t) => sum + t.valor, 0);
    const variaveis = transacoesMes.filter(t => t.tipo === 'gasto' && !t.fixo).reduce((sum, t) => sum + t.valor, 0);
    const naoPagos = transacoesMes.filter(t => t.tipo === 'gasto' && !t.pago).reduce((sum, t) => sum + t.valor, 0);
    const fixosPagos = transacoesMes.filter(t => t.tipo === 'gasto' && t.fixo && t.pago).length;
    const fixosTotal = transacoesMes.filter(t => t.tipo === 'gasto' && t.fixo).length;
    
    return { gastos, receitas, saldo: receitas - gastos, fixos, variaveis, naoPagos, fixosPagos, fixosTotal };
  };
// ✅ ADICIONE AQUI (linha ~359):
const calcularVencimentos = () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const em3Dias = new Date(hoje);
  em3Dias.setDate(em3Dias.getDate() + 3);
  
  const em7Dias = new Date(hoje);
  em7Dias.setDate(em7Dias.getDate() + 7);

  const nãoPagas = transacoes.filter(t => 
    t.tipo === 'gasto' && 
    !t.pago && 
    t.data.startsWith(mesAtual)
  );

  const vencidas = nãoPagas.filter(t => {
    const dataTransacao = new Date(t.data + 'T00:00:00');
    return dataTransacao < hoje;
  });

  const vencem3Dias = nãoPagas.filter(t => {
    const dataTransacao = new Date(t.data + 'T00:00:00');
    return dataTransacao >= hoje && dataTransacao <= em3Dias;
  });

  const vencem7Dias = nãoPagas.filter(t => {
    const dataTransacao = new Date(t.data + 'T00:00:00');
    return dataTransacao > em3Dias && dataTransacao <= em7Dias;
  });

  return {
    vencidas,
    vencem3Dias,
    vencem7Dias,
    total: nãoPagas.length,
    totalVencendo: vencidas.length + vencem3Dias.length
  };
};

  const calcularPorCategoria = () => {
    const transacoesMes = transacoes.filter(t => t.data.startsWith(mesAtual) && t.tipo === 'gasto');
    const total = transacoesMes.reduce((sum, t) => sum + t.valor, 0);
    const porCategoria = {};

    transacoesMes.forEach(t => {
      if (!porCategoria[t.categoria]) {
        porCategoria[t.categoria] = 0;
      }
      porCategoria[t.categoria] += t.valor;
    });

    return Object.entries(porCategoria)
      .map(([cat, val]) => ({ 
        categoria: cat, 
        valor: val, 
        porcentagem: (val / total * 100).toFixed(1),
        cor: CATEGORIA_CONFIG[cat]?.cor || '#6B7280'
      }))
      .sort((a, b) => b.valor - a.valor);
  };

  // Dados para gráfico de evolução (6 meses)
  const getEvolucaoMeses = () => {
    const meses = [];
    for (let i = 5; i >= -5; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mesStr = data.toISOString().slice(0, 7);
      const totais = calcularTotais(mesStr);
      meses.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
        gastos: totais.gastos,
        receitas: totais.receitas
      });
    }
    return meses;
  };

  // Previsão do próximo mês
  const calcularPrevisao = () => {
    const gastosMes = [];
    for (let i = 1; i <= 3; i++) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mesStr = data.toISOString().slice(0, 7);
      const totais = calcularTotais(mesStr);
      gastosMes.push(totais.variaveis);
    }
    
    const mediaVariaveis = gastosMes.reduce((a, b) => a + b, 0) / gastosMes.length;
    const mesAtualTotais = calcularTotais(mesAtual);
    const previsaoTotal = mesAtualTotais.fixos + mediaVariaveis;
    
    const receitasMedia = (() => {
      const receitas = [];
      for (let i = 1; i <= 3; i++) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const mesStr = data.toISOString().slice(0, 7);
        receitas.push(calcularTotais(mesStr).receitas);
      }
      return receitas.reduce((a, b) => a + b, 0) / receitas.length;
    })();

    return {
      previsaoGastos: previsaoTotal,
      previsaoSaldo: receitasMedia - previsaoTotal,
      alerta: previsaoTotal > receitasMedia
    };
  };

  const exportarCSV = () => {
    const csv = [
      ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Fixo', 'Pago'],
      ...transacoes.map(t => [
        t.data,
        t.tipo,
        t.categoria,
        t.descricao,
        t.valor,
        t.fixo ? 'Sim' : 'Não',
        t.pago ? 'Sim' : 'Não'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const totaisAtual = calcularTotais(mesAtual);
  const transacoesFiltradas = transacoes
    .filter(t => t.data.startsWith(mesAtual))
    .filter(t => filtros.categoria === 'todas' || t.categoria === filtros.categoria)
    .filter(t => filtros.tipo === 'todos' || t.tipo === filtros.tipo)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const IconeCategoria = ({ categoria, tamanho = 18 }) => {
    const Icon = CATEGORIA_CONFIG[categoria]?.icon || DollarSign;
    return <Icon size={tamanho} />;
  };

  return (
  <div 
    className="min-h-screen bg-gray-900 text-gray-100"
    style={{
      paddingBottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))'
    }}
  >

      {/* Header */}
     
<div 
  className="bg-gray-800 border-b border-gray-700 sticky top-0 z-20"
  style={{ 
    paddingTop: 'max(1rem, env(safe-area-inset-top))',
  }}
>
  <div className="max-w-6xl mx-auto px-4 pb-4">
    <div className="flex items-center justify-between mb-3">
      <div>
        <h1 className="text-xl font-bold">💰 Finanças</h1>
        <p className="text-xs text-gray-400">Olá, {usuario.nome}</p>
      </div>
      <button 
        onClick={onLogout} 
        className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 flex items-center gap-1 text-sm min-h-[44px]"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
    
    {/* Tabs com scroll horizontal para mobile */}
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <button 
        onClick={() => setTela('dashboard')} 
        className={`px-4 py-2.5 rounded-lg text-sm whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${
          tela === 'dashboard' ? 'bg-blue-600 scale-105' : 'bg-gray-700'
        }`}
      >
        Dashboard
      </button>
      <button 
        onClick={() => setTela('transacoes')} 
        className={`px-4 py-2.5 rounded-lg text-sm relative whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${
          tela === 'transacoes' ? 'bg-blue-600 scale-105' : 'bg-gray-700'
        }`}
      >
        Transações
        {calcularVencimentos().totalVencendo > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {calcularVencimentos().totalVencendo}
          </span>
        )}
      </button>
      <button 
        onClick={() => setTela('caixinhas')} 
        className={`px-4 py-2.5 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${
          tela === 'caixinhas' ? 'bg-blue-600 scale-105' : 'bg-gray-700'
        }`}
      >
        <Wallet size={16} />
        Caixinhas
      </button>
      <button 
        onClick={() => setTela('relatorios')} 
        className={`px-4 py-2.5 rounded-lg text-sm whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${
          tela === 'relatorios' ? 'bg-blue-600 scale-105' : 'bg-gray-700'
        }`}
      >
        Relatórios
      </button>
    </div>
  </div>
</div>

{/* Adicionar CSS para esconder scrollbar */}
<style jsx>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Dashboard - Versão Clean */}
       {tela === 'dashboard' && (
  <>
    {/* Seletor de Mês */}
<div className="mb-6">
  <PeriodSelector value={mesAtual} onChange={setMesAtual} />
</div>

{/* ✅ ADICIONE ESTE BLOCO: Alert de Vencimentos */}
{calcularVencimentos().totalVencendo > 0 && (
  <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-l-4 border-red-500 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={24} />
      <div className="flex-1">
        <h3 className="font-bold text-red-300 mb-2">⚠️ Atenção: Contas Pendentes!</h3>
        <div className="space-y-1 text-sm">
          {calcularVencimentos().vencidas.length > 0 && (
            <p className="text-red-200">
              • <strong>{calcularVencimentos().vencidas.length}</strong> conta(s) <strong>VENCIDA(S)</strong> 🔴
            </p>
          )}
          {calcularVencimentos().vencem3Dias.length > 0 && (
            <p className="text-orange-200">
              • <strong>{calcularVencimentos().vencem3Dias.length}</strong> conta(s) vencem nos próximos 3 dias 🟡
            </p>
          )}
          {calcularVencimentos().vencem7Dias.length > 0 && (
            <p className="text-yellow-200">
              • <strong>{calcularVencimentos().vencem7Dias.length}</strong> conta(s) vencem esta semana
            </p>
          )}
        </div>
        <button
          onClick={() => setTela('transacoes')}
          className="mt-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
        >
          Ver Pendências →
        </button>
      </div>
    </div>
  </div>
)}

           {/* Cards de Resumo - Tamanho Balanceado */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
  <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-1.5 text-red-400">
      <TrendingDown size={18} />
      <span className="text-xs font-medium">Gastos</span>
    </div>
    <div className="text-2xl font-bold">R$ {totaisAtual.gastos.toFixed(2)}</div>
  </div>

  <div className="bg-green-600/20 border border-green-600/30 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-1.5 text-green-400">
      <TrendingUp size={18} />
      <span className="text-xs font-medium">Receitas</span>
    </div>
    <div className="text-2xl font-bold">R$ {totaisAtual.receitas.toFixed(2)}</div>
  </div>

  <div className={`${totaisAtual.saldo >= 0 ? 'bg-green-500/30 border-green-500/50' : 'bg-red-500/30 border-red-500/50'} border rounded-xl p-4`}>
    <div className={`flex items-center gap-2 mb-1.5 ${totaisAtual.saldo >= 0 ? 'text-green-300' : 'text-red-300'}`}>
      <DollarSign size={18} />
      <span className="text-xs font-medium">Saldo</span>
    </div>
    <div className={`text-2xl font-bold ${totaisAtual.saldo >= 0 ? 'text-green-200' : 'text-red-200'}`}>
      R$ {totaisAtual.saldo.toFixed(2)}
    </div>
  </div>
</div>

            {/* Mini Gráfico de Evolução */}
            <div className="bg-gray-800 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold mb-4 text-gray-300">Evolução dos últimos 6 meses</h3>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={getEvolucaoMeses()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                  />
                  <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Categorias */}
            <div className="bg-gray-800 rounded-xl p-5">
              <h3 className="font-bold mb-4 flex items-center justify-between">
                <span>Top 5 Categorias</span>
                <button 
                  onClick={() => setTela('relatorios')} 
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Ver todos →
                </button>
              </h3>
              <div className="space-y-3">
                {calcularPorCategoria().slice(0, 5).map((item, idx) => (
                  <div key={item.categoria}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: item.cor + '40' }}>
                          <div style={{ color: item.cor }}>
                            <IconeCategoria categoria={item.categoria} tamanho={14} />
                          </div>
                        </div>
                        <span className="font-medium text-sm">{item.categoria}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">R$ {item.valor.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${item.porcentagem}%`, backgroundColor: item.cor }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tela Transações - Lista Completa */}
        {tela === 'transacoes' && (
          <>
            {/* Filtros */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Filter size={18} />
                Filtros
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-gray-400">Categoria</label>
                  <select
                    value={filtros.categoria}
                    onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="todas">Todas</option>
                    {[...categorias.fixos, ...categorias.variaveis, ...categorias.receitas].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-400">Tipo</label>
                  <select
                    value={filtros.tipo}
                    onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="todos">Todos</option>
                    <option value="gasto">Gastos</option>
                    <option value="receita">Receitas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cards Informativos Adicionais */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3">
                <div className="text-xs text-blue-400 mb-1">Gastos Fixos</div>
                <div className="text-base font-bold">R$ {totaisAtual.fixos.toFixed(2)}</div>
                <div className="text-xs text-gray-400 mt-1">{totaisAtual.fixosPagos}/{totaisAtual.fixosTotal} pagos</div>
              </div>

              <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-3">
                <div className="text-xs text-purple-400 mb-1">Gastos Variáveis</div>
                <div className="text-base font-bold">R$ {totaisAtual.variaveis.toFixed(2)}</div>
              </div>

              <div className="bg-orange-600/20 border border-orange-600/30 rounded-lg p-3">
                <div className="text-xs text-orange-400 mb-1">A Pagar</div>
                <div className="text-base font-bold">R$ {totaisAtual.naoPagos.toFixed(2)}</div>
              </div>

              <div className="bg-teal-600/20 border border-teal-600/30 rounded-lg p-3">
                <div className="text-xs text-teal-400 mb-1">Fixos Pagos</div>
                <div className="text-base font-bold">{totaisAtual.fixosPagos} de {totaisAtual.fixosTotal}</div>
              </div>
            </div>

           {/* Lista Completa de Transações */}
<div className="bg-gray-800 rounded-lg p-4">
  <h3 className="font-bold mb-3 flex items-center justify-between">
    <span>Transações</span>
    <span className="text-sm text-gray-400">({transacoesFiltradas.length})</span>
  </h3>
  {transacoesFiltradas.length === 0 ? (
    <p className="text-gray-400 text-center py-8 text-sm">Nenhuma transação encontrada</p>
  ) : (
    <div className="space-y-2">
     {transacoesFiltradas.map(t => {
  const cor = CATEGORIA_CONFIG[t.categoria]?.cor || '#6B7280';
  
  // Verificar status de vencimento
  const dataTransacao = new Date(t.data + 'T00:00:00');
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const em3Dias = new Date(hoje);
  em3Dias.setDate(em3Dias.getDate() + 3);
  
  const isVencida = !t.pago && t.tipo === 'gasto' && dataTransacao < hoje;
  const vence3Dias = !t.pago && t.tipo === 'gasto' && dataTransacao >= hoje && dataTransacao <= em3Dias;
  
  return (
    <div 
      key={t.id} 
      className={`bg-gray-700/50 rounded-xl p-4 transition-all active:bg-gray-700
        ${isVencida ? 'border-l-4 border-red-500 bg-red-900/20' : ''}
        ${vence3Dias ? 'border-l-4 border-orange-500 bg-orange-900/20' : ''}
      `}
    >
      {/* Linha Superior: Ícone + Info + Valor */}
      <div className="flex items-start gap-3 mb-3">
        {/* Ícone */}
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" 
          style={{ backgroundColor: cor + '30' }}
        >
          <div style={{ color: cor }}>
            <IconeCategoria categoria={t.categoria} tamanho={20} />
          </div>
        </div>
        
        {/* Info Central */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base truncate mb-1">{t.categoria}</div>
          
          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {t.fixo && <span className="text-xs bg-blue-600/60 px-2 py-0.5 rounded">Fixo</span>}
            {t.pago && <span className="text-xs bg-green-600/60 px-2 py-0.5 rounded">✓ Pago</span>}
            {isVencida && <span className="text-xs bg-red-600 px-2 py-0.5 rounded font-bold">VENCIDA</span>}
            {vence3Dias && <span className="text-xs bg-orange-600 px-2 py-0.5 rounded font-bold">Vence em breve</span>}
            {t.parcelas > 1 && (
              <span className="text-xs bg-purple-600/60 px-2 py-0.5 rounded">
                {t.parcela_atual}/{t.parcelas}
              </span>
            )}
          </div>
          
          {/* Descrição + Data */}
          <div className="text-xs text-gray-400">
            {t.descricao && <span className="block truncate mb-0.5">{t.descricao}</span>}
            <span>{new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Valor - Destaque */}
        <div className="text-right flex-shrink-0">
          <div className={`font-bold text-lg ${t.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
            {t.tipo === 'receita' ? '+' : '-'}R$ {t.valor.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Linha Inferior: Botões de Ação (Menos e Maiores) */}
      <div className="flex gap-2 pt-3 border-t border-gray-600/50">
        <button 
          onClick={() => togglePago(t.id)} 
          className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 min-h-[44px] ${
            t.pago 
              ? 'bg-gray-600 text-gray-300' 
              : 'bg-green-600/80 hover:bg-green-600 text-white'
          }`}
        >
          {t.pago ? '✓ Pago' : 'Marcar Pago'}
        </button>
        
        <button 
          onClick={() => editarTransacao(t)} 
          className="p-2.5 bg-gray-600 hover:bg-gray-500 rounded-lg transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Editar"
        >
          <Edit2 size={18} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Excluir esta transação?')) {
              deletarTransacao(t.id);
            }
          }} 
          className="p-2.5 bg-red-600/80 hover:bg-red-600 rounded-lg transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
})}

</div>
          </>
        )}
        {/* Tela Caixinhas */}
        {tela === 'caixinhas' && (
          <>
            <button
              onClick={() => setModalCaixinha(true)}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold mb-4 flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              Nova Caixinha
            </button>

            {caixinhas.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <Wallet size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">Nenhuma caixinha criada ainda</p>
                <p className="text-sm text-gray-500">Crie uma caixinha para organizar seus objetivos financeiros</p>
              </div>
            ) : (
              <div className="space-y-4">
                {caixinhas.map(c => {
                  const progresso = (c.valor_pago / c.valor_total * 100).toFixed(1);
                  const valorParcela = (c.valor_total / c.parcelas_total).toFixed(2);
                  const faltam = c.parcelas_total - c.parcelas_pagas;
                  
                  return (
                    <div key={c.id} className="bg-gray-800 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{c.nome}</h3>
                        <button
                          onClick={async () => {
                            if (window.confirm('Deseja realmente deletar esta caixinha?')) {
                              try {
                                await fetch(`${API_URL}/api/caixinhas/${c.id}`, {
  method: 'DELETE'
});
                                setCaixinhas(caixinhas.filter(cx => cx.id !== c.id));
                              } catch (err) {
                                console.error("Erro ao deletar:", err);
                                alert("Erro ao deletar caixinha");
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-400">Total:</span>
                          <div className="font-bold">R$ {c.valor_total.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Pago:</span>
                          <div className="font-bold text-green-400">R$ {c.valor_pago.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Parcela:</span>
                          <div className="font-bold">R$ {valorParcela}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Faltam:</span>
                          <div className="font-bold text-orange-400">{faltam} de {c.parcelas_total}</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span className="font-bold">{progresso}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all"
                            style={{ width: `${progresso}%` }}
                          ></div>
                        </div>
                      </div>

                      {c.parcelas_pagas < c.parcelas_total && (
                        <button
                          onClick={async () => {
                            try {
                              await fetch(`${API_URL}/api/caixinhas/${c.id}/pagar`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ valor: valorParcela })
                              });
                              
                              setCaixinhas(caixinhas.map(cx => cx.id === c.id ? {
                                ...cx,
                                valor_pago: cx.valor_pago + parseFloat(valorParcela),
                                parcelas_pagas: cx.parcelas_pagas + 1
                              } : cx));
                            } catch (err) {
                              console.error("Erro ao pagar:", err);
                              alert("Erro ao registrar pagamento");
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Pagar Parcela (R$ {valorParcela})
                        </button>
                      )}

                      {c.parcelas_pagas >= c.parcelas_total && (
                        <div className="w-full bg-green-600/20 border border-green-600/30 py-2 rounded-lg flex items-center justify-center gap-2 text-green-400">
                          <CheckCircle size={18} />
                          Objetivo Concluído! 🎉
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Tela Relatórios */}
        {tela === 'relatorios' && (
          <>
            {/* Previsão do Próximo Mês */}
            <div className={`${calcularPrevisao().alerta ? 'bg-red-600/20 border-red-600/30' : 'bg-green-600/20 border-green-600/30'} border rounded-lg p-4 mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                {calcularPrevisao().alerta ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle size={20} className="text-green-400" />}
                <h3 className="font-bold">Previsão Próximo Mês</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Gastos Previstos</div>
                  <div className="font-bold text-lg">R$ {calcularPrevisao().previsaoGastos.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Saldo Previsto</div>
                  <div className={`font-bold text-lg ${calcularPrevisao().previsaoSaldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {calcularPrevisao().previsaoSaldo.toFixed(2)}
                  </div>
                </div>
              </div>
              {calcularPrevisao().alerta && (
                <div className="text-xs text-red-300 mt-2">⚠️ Gastos previstos excedem receita média</div>
              )}
            </div>

            {/* Ranking de Categorias */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Ranking de Gastos por Categoria
              </h3>
              <div className="space-y-3">
                {calcularPorCategoria().map((item, idx) => (
                  <div key={item.categoria}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-500">#{idx + 1}</span>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: item.cor + '40' }}>
                          <div style={{ color: item.cor }}>
                            <IconeCategoria categoria={item.categoria} tamanho={14} />
                          </div>
                        </div>
                        <span className="font-medium text-sm">{item.categoria}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">R$ {item.valor.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">{item.porcentagem}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${item.porcentagem}%`, backgroundColor: item.cor }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Pizza */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-4">Distribuição de Gastos</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={calcularPorCategoria()}
                    dataKey="valor"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ porcentagem }) => `${porcentagem}%`}
                  >
                    {calcularPorCategoria().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffffff', border: 'none', borderRadius: '8px' }}
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Evolução 6 Meses - Detalhado */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-4">Evolução dos Últimos 6 Meses</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getEvolucaoMeses()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Bar dataKey="gastos" fill="#EF4444" name="Gastos" />
                  <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Exportar Dados */}
            <button
      onClick={() => exportarPDF(transacoes, totaisAtual, mesAtual, usuario, calcularPorCategoria())}
      className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 mb-4"
    >
      <Download size={20} />
      Exportar PDF
    </button>
            <button
              onClick={exportarCSV}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Exportar CSV
            </button>
          </>
        )}

        {/* Tela Adicionar Completa - Otimizado iPhone */}
{tela === 'adicionar' && (
  <div className="bg-gray-800 rounded-xl p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold">{transacaoEdit ? 'Editar Transação' : 'Nova Transação'}</h2>
      <button 
        onClick={() => { setTela('dashboard'); setTransacaoEdit(null); }} 
        className="text-gray-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <X size={24} />
      </button>
    </div>

    <div className="space-y-5">
      <div>
        <label className="block text-sm mb-2 font-medium">Tipo</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setForm({ ...form, tipo: 'gasto', categoria: '' })}
            className={`py-4 rounded-xl font-semibold transition-all min-h-[52px] ${
              form.tipo === 'gasto' ? 'bg-red-600 scale-105 shadow-lg' : 'bg-gray-700 active:scale-95'
            }`}
          >
            💸 Gasto
          </button>
          <button
            onClick={() => setForm({ ...form, tipo: 'receita', categoria: '' })}
            className={`py-4 rounded-xl font-semibold transition-all min-h-[52px] ${
              form.tipo === 'receita' ? 'bg-green-600 scale-105 shadow-lg' : 'bg-gray-700 active:scale-95'
            }`}
          >
            💰 Receita
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-2 font-medium">Valor (R$)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-lg focus:border-blue-500 focus:outline-none min-h-[52px]"
          placeholder="0,00"
        />
      </div>

      <div>
        <label className="block text-sm mb-2 font-medium">Categoria</label>
        <select
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 focus:border-blue-500 focus:outline-none min-h-[52px]"
        >
          <option value="">Selecione...</option>
          {form.tipo === 'receita' ? (
            categorias.receitas.map(cat => <option key={cat} value={cat}>{cat}</option>)
          ) : (
            <>
              <optgroup label="⚡ Fixos">
                {categorias.fixos.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </optgroup>
              <optgroup label="🔄 Variáveis">
                {categorias.variaveis.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </optgroup>
            </>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-2 font-medium">Data</label>
        <input
          type="date"
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
          className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 focus:border-blue-500 focus:outline-none min-h-[52px]"
        />
      </div>

      <div>
        <label className="block text-sm mb-2 font-medium">Descrição (opcional)</label>
        <input
          type="text"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 focus:border-blue-500 focus:outline-none min-h-[52px]"
          placeholder="Ex: Fatura Bradesco"
        />
      </div>

      <div>
        <label className="block text-sm mb-2 font-medium">Parcelas</label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="60"
            value={form.parcelas}
            onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
            className="w-24 bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-center font-semibold focus:border-blue-500 focus:outline-none min-h-[52px]"
          />
          <span className="text-sm text-gray-400 flex-1">
            {form.parcelas > 1 && form.valor 
              ? `${form.parcelas}x de R$ ${(parseFloat(form.valor || 0) / parseInt(form.parcelas || 1)).toFixed(2)}`
              : 'À vista (1x)'}
          </span>
        </div>
        {form.parcelas > 1 && (
          <p className="text-xs text-blue-400 mt-2 p-3 bg-blue-600/10 rounded-lg">
            💡 Serão criadas {form.parcelas} transações mensais automaticamente
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex items-center gap-3 bg-gray-700/50 p-4 rounded-xl cursor-pointer min-h-[52px]">
          <input
            type="checkbox"
            checked={form.fixo}
            onChange={(e) => setForm({ ...form, fixo: e.target.checked })}
            className="w-6 h-6 rounded"
          />
          <span className="font-medium">Gasto Fixo</span>
        </label>
        <label className="flex items-center gap-3 bg-gray-700/50 p-4 rounded-xl cursor-pointer min-h-[52px]">
          <input
            type="checkbox"
            checked={form.pago}
            onChange={(e) => setForm({ ...form, pago: e.target.checked })}
            className="w-6 h-6 rounded"
          />
          <span className="font-medium">Já Pago</span>
        </label>
      </div>

      <button
        onClick={adicionarTransacao}
        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 min-h-[52px]"
      >
        {transacaoEdit ? '✅ Atualizar' : '✅ Adicionar'}
      </button>
    </div>
  </div>
)}

   {/* Botão Flutuante - Tamanho Ideal */}
<button
  onClick={() => setModalRapido(true)}
  className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-600 to-green-500 rounded-full shadow-2xl flex items-center justify-center z-30 transition-all active:scale-90"
  style={{
    bottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))'
  }}
>
  <PlusCircle size={26} strokeWidth={2.5} />
</button>

    {/* Modal de Lançamento Rápido - Otimizado iPhone */}
{modalRapido && (
  <div 
    className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-40"
    onClick={() => setModalRapido(false)}
  >
    <div 
      className="bg-gray-800 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl transform transition-transform"
      style={{
        paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">⚡ Lançamento Rápido</h2>
        <button 
          onClick={() => setModalRapido(false)} 
          className="text-gray-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm mb-2 font-medium">Tipo</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormRapido({ ...formRapido, tipo: 'gasto', categoria: '' })}
              className={`py-4 rounded-xl font-semibold transition-all min-h-[52px] ${
                formRapido.tipo === 'gasto' ? 'bg-red-600 scale-105 shadow-lg' : 'bg-gray-700 active:scale-95'
              }`}
            >
              💸 Gasto
            </button>
            <button
              onClick={() => setFormRapido({ ...formRapido, tipo: 'receita', categoria: '' })}
              className={`py-4 rounded-xl font-semibold transition-all min-h-[52px] ${
                formRapido.tipo === 'receita' ? 'bg-green-600 scale-105 shadow-lg' : 'bg-gray-700 active:scale-95'
              }`}
            >
              💰 Receita
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2 font-medium">Valor (R$)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={formRapido.valor}
            onChange={(e) => setFormRapido({ ...formRapido, valor: e.target.value })}
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-lg focus:border-blue-500 focus:outline-none min-h-[52px]"
            placeholder="0,00"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm mb-2 font-medium">Categoria</label>
          <select
            value={formRapido.categoria}
            onChange={(e) => setFormRapido({ ...formRapido, categoria: e.target.value })}
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-base focus:border-blue-500 focus:outline-none min-h-[52px]"
          >
            <option value="">Selecione...</option>
            {formRapido.tipo === 'receita' ? (
              categorias.receitas.map(cat => <option key={cat} value={cat}>{cat}</option>)
            ) : (
              <>
                <optgroup label="⚡ Fixos">
                  {categorias.fixos.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </optgroup>
                <optgroup label="🔄 Variáveis">
                  {categorias.variaveis.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </optgroup>
              </>
            )}
          </select>
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={salvarRapido}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 min-h-[52px]"
          >
            ✅ Salvar Agora
          </button>

          <button
            onClick={() => {
              setForm({
                ...form,
                valor: formRapido.valor,
                categoria: formRapido.categoria,
                tipo: formRapido.tipo
              });
              setModalRapido(false);
              setTela('adicionar');
            }}
            className="w-full text-sm text-blue-400 hover:text-blue-300 py-3 min-h-[44px]"
          >
            Ou adicionar mais detalhes →
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      

    {/* Modal Nova Caixinha - Otimizado iPhone */}
{modalCaixinha && (
  <div 
    className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-40"
    onClick={() => setModalCaixinha(false)}
  >
    <div 
      className="bg-gray-800 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl"
      style={{
        paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">🏦 Nova Caixinha</h2>
        <button 
          onClick={() => setModalCaixinha(false)} 
          className="text-gray-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm mb-2 font-medium">Nome</label>
          <input
            type="text"
            value={formCaixinha.nome}
            onChange={(e) => setFormCaixinha({ ...formCaixinha, nome: e.target.value })}
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 focus:border-blue-500 focus:outline-none min-h-[52px]"
            placeholder="Ex: Carro novo"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 font-medium">Valor Total (R$)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={formCaixinha.valor_total}
            onChange={(e) => setFormCaixinha({ ...formCaixinha, valor_total: e.target.value })}
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-lg focus:border-blue-500 focus:outline-none min-h-[52px]"
            placeholder="0,00"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 font-medium">Quantidade de Parcelas</label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={formCaixinha.parcelas_total}
            onChange={(e) => setFormCaixinha({ ...formCaixinha, parcelas_total: e.target.value })}
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-lg focus:border-blue-500 focus:outline-none min-h-[52px]"
            placeholder="12"
          />
          {formCaixinha.valor_total && formCaixinha.parcelas_total && (
            <div className="text-sm text-gray-400 mt-2 p-3 bg-gray-700/50 rounded-lg">
              💡 Parcela: R$ {(parseFloat(formCaixinha.valor_total) / parseInt(formCaixinha.parcelas_total)).toFixed(2)}
            </div>
          )}
        </div>

        <button
          onClick={async () => {
            if (!formCaixinha.nome || !formCaixinha.valor_total || !formCaixinha.parcelas_total) {
              alert('Preencha todos os campos');
              return;
            }

            try {
              const response = await fetch(`${API_URL}/api/caixinhas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  usuario_id: usuario.id,
                  ...formCaixinha,
                  valor_total: parseFloat(formCaixinha.valor_total),
                  parcelas_total: parseInt(formCaixinha.parcelas_total)
                })
              });

              const dados = await response.json();
              
              setCaixinhas([{
                id: dados.id,
                ...formCaixinha,
                usuario_id: usuario.id,
                valor_total: parseFloat(formCaixinha.valor_total),
                valor_pago: 0,
                parcelas_total: parseInt(formCaixinha.parcelas_total),
                parcelas_pagas: 0
              }, ...caixinhas]);

              setFormCaixinha({
                nome: '',
                valor_total: '',
                parcelas_total: '',
                data_inicio: new Date().toISOString().slice(0, 10)
              });
              setModalCaixinha(false);
            } catch (err) {
              console.error("Erro ao criar:", err);
              alert('Erro ao criar caixinha');
            }
          }}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 min-h-[52px]"
        >
          Criar Caixinha
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default FinanceApp;