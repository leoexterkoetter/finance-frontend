import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  PlusCircle, TrendingUp, TrendingDown, DollarSign, Filter, Download, Edit2, Trash2, X,
  Home, CreditCard, Car, ShoppingCart, Pill, Zap, Wifi, Smartphone, Music, CheckCircle,
  AlertCircle, BarChart3, LogOut, Wallet, Calendar, Repeat,
  Sun, Moon, Settings, Tag, Palette,
  Coffee, Book, Dumbbell, Plane, Gift, Heart, Briefcase, Gamepad2, Pizza, Film, Shirt, Wrench
} from 'lucide-react';
import ModalCategoria from './components/ModalCategoria';
import ModalConta from './components/ModalConta';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import DateSelector from './components/DateSelector';
import InsightCard from './components/InsightCard';
import LoadingSpinner from './components/LoadingSpinner';
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
// ✅ NOVO: Ícones disponíveis para categorias customizadas
const ICONES_DISPONIVEIS = [
  { nome: 'Home', component: Home },
  { nome: 'Car', component: Car },
  { nome: 'ShoppingCart', component: ShoppingCart },
  { nome: 'Pill', component: Pill },
  { nome: 'Zap', component: Zap },
  { nome: 'Wifi', component: Wifi },
  { nome: 'Smartphone', component: Smartphone },
  { nome: 'Music', component: Music },
  { nome: 'Coffee', component: Coffee },
  { nome: 'Book', component: Book },
  { nome: 'Dumbbell', component: Dumbbell },
  { nome: 'Plane', component: Plane },
  { nome: 'Gift', component: Gift },
  { nome: 'Heart', component: Heart },
  { nome: 'Briefcase', component: Briefcase },
  { nome: 'Gamepad2', component: Gamepad2 },
  { nome: 'Pizza', component: Pizza },
  { nome: 'Film', component: Film },
  { nome: 'Shirt', component: Shirt },
  { nome: 'Wrench', component: Wrench },
  { nome: 'CreditCard', component: CreditCard },
  { nome: 'Wallet', component: Wallet },
  { nome: 'DollarSign', component: DollarSign },
  { nome: 'Tag', component: Tag },
];

// ✅ NOVO: Cores disponíveis
const CORES_DISPONIVEIS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#6B7280',
];

// ✅ NOVO: Cores semânticas
const SEMANTIC_COLORS = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    button: 'bg-green-600 hover:bg-green-700',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    button: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    button: 'bg-yellow-600 hover:bg-yellow-700',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
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
  const [modalEditCaixinha, setModalEditCaixinha] = useState(false);
  const [caixinhaEdit, setCaixinhaEdit] = useState(null);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);
  // ✅ NOVO: Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  // ✅ NOVO: Categorias customizadas
  const [categoriasCustom, setCategoriasCustom] = useState([]);
  const [modalNovaCategoria, setModalNovaCategoria] = useState(false);
  const [modalEditCategoria, setModalEditCategoria] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [formCategoria, setFormCategoria] = useState({
    nome: '',
    icone: 'Tag',
    cor: '#6B7280',
    tipo: 'variavel',
  });

  // ✅ NOVO: Contas/Cartões
  const [contas, setContas] = useState([]);
  const [modalNovaConta, setModalNovaConta] = useState(false);
  const [modalEditConta, setModalEditConta] = useState(false);
  const [contaEdit, setContaEdit] = useState(null);
  const [formConta, setFormConta] = useState({
    nome: '',
    tipo: 'cartao_credito',
    limite: '',
    saldo_atual: '',
    cor: '#3B82F6',
    icone: 'CreditCard',
  });

  // ✅ NOVO: Loading states
  const [loading, setLoading] = useState(false);
  const [loadingContas, setLoadingContas] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [transacoes, setTransacoes] = useState([]);
  const [caixinhas, setCaixinhas] = useState([]);
  const [categorias] = useState(CATEGORIAS_PADRAO);
  const [mesAtual, setMesAtual] = useState(new Date().toISOString().slice(0, 7));
  const [filtros, setFiltros] = useState({ categoria: 'todas', tipo: 'todos' });

  // ✅ NOVO: Form Rápido COMPLETO
  const [formRapido, setFormRapido] = useState({
    valor: '',
    categoria: '',
    tipo: 'gasto',
    data: new Date().toISOString().slice(0, 10),
    parcelas: 1,
    recorrencia: 'nenhuma', // nenhuma, mensal, semanal
    dataFinal: ''
  });

  const [formCaixinha, setFormCaixinha] = useState({
    nome: '',
    valor_total: '',
    parcelas_total: '',
    data_inicio: new Date().toISOString().slice(0, 10)
  });

  // Carregar transações
  useEffect(() => {
    const carregarTransacoes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/transacoes/${usuario.id}`);
        if (response.ok) {
          const dados = await response.json();
          const transacoesFormatadas = dados.map(t => ({
            ...t,
            id: t._id || t.id,
            valor: parseFloat(t.valor),
            fixo: Boolean(t.fixo),
            pago: Boolean(t.pago)
          }));
          setTransacoes(transacoesFormatadas);
        }
      } catch (err) {
        console.error("Erro ao carregar transações:", err);
      }
    };
    carregarTransacoes();
  }, [usuario.id]);

  // Carregar caixinhas
  useEffect(() => {
    const carregarCaixinhas = async () => {
      try {
        const response = await fetch(`${API_URL}/api/caixinhas/${usuario.id}`);
        if (response.ok) {
          const dados = await response.json();
          const caixinhasFormatadas = dados.map(c => ({
            ...c,
            id: c._id || c.id,
            valor_total: parseFloat(c.valor_total),
            valor_pago: parseFloat(c.valor_pago || 0)
          }));
          setCaixinhas(caixinhasFormatadas);
        }
      } catch (err) {
        console.error("Erro ao carregar caixinhas:", err);
      }
    };
    carregarCaixinhas();
  }, [usuario.id]);
  // ✅ NOVO: useEffect para Dark Mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ✅ NOVO: Carregar categorias customizadas
  useEffect(() => {
    const carregarCategorias = async () => {
      setLoadingCategorias(true);
      try {
        const response = await fetch(`${API_URL}/api/categorias/${usuario.id}`);
        if (response.ok) {
          const dados = await response.json();
          setCategoriasCustom(dados);
        }
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      } finally {
        setLoadingCategorias(false);
      }
    };
    carregarCategorias();
  }, [usuario.id]);

  // ✅ NOVO: Carregar contas
  useEffect(() => {
    const carregarContas = async () => {
      setLoadingContas(true);
      try {
        const response = await fetch(`${API_URL}/api/contas/${usuario.id}`);
        if (response.ok) {
          const dados = await response.json();
          setContas(dados);
        }
      } catch (err) {
        console.error("Erro ao carregar contas:", err);
      } finally {
        setLoadingContas(false);
      }
    };
    carregarContas();
  }, [usuario.id]);

  // ✅ MELHORADO: Salvar Rápido com Recorrência
  const salvarRapido = async () => {
    if (!formRapido.valor || !formRapido.categoria) {
      toast.error('Preencha valor e categoria');
      return;
    }

    if (formRapido.recorrencia !== 'nenhuma' && !formRapido.dataFinal) {
      toast.error('Selecione a data final para transações recorrentes');
      return;
    }

    try {
      if (formRapido.recorrencia === 'nenhuma') {
        const endpoint = formRapido.parcelas > 1 
          ? `${API_URL}/api/transacoes/parcelada`
          : `${API_URL}/api/transacoes`;

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: usuario.id,
            valor: parseFloat(formRapido.valor),
            categoria: formRapido.categoria,
            tipo: formRapido.tipo,
            data: formRapido.data,
            descricao: '',
            fixo: false,
            pago: false,
            parcelas: parseInt(formRapido.parcelas) || 1
          })
        });
      } else {
        const dataInicio = new Date(formRapido.data);
        const dataFim = new Date(formRapido.dataFinal);
        const transacoesRecorrentes = [];

        let dataAtual = new Date(dataInicio);
        while (dataAtual <= dataFim) {
          transacoesRecorrentes.push({
            usuario_id: usuario.id,
            valor: parseFloat(formRapido.valor),
            categoria: formRapido.categoria,
            tipo: formRapido.tipo,
            data: dataAtual.toISOString().slice(0, 10),
            descricao: `Recorrente ${formRapido.recorrencia}`,
            fixo: formRapido.recorrencia === 'mensal',
            pago: false
          });

          if (formRapido.recorrencia === 'mensal') {
            dataAtual.setMonth(dataAtual.getMonth() + 1);
          } else if (formRapido.recorrencia === 'semanal') {
            dataAtual.setDate(dataAtual.getDate() + 7);
          }
        }

        for (const trans of transacoesRecorrentes) {
          await fetch(`${API_URL}/api/transacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trans)
          });
        }

        toast.success(`✅ ${transacoesRecorrentes.length} transações recorrentes criadas!`);
      }

      const response = await fetch(`${API_URL}/api/transacoes/${usuario.id}`);
      const dados = await response.json();
      const transacoesFormatadas = dados.map(t => ({
        ...t,
        id: t._id || t.id,
        valor: parseFloat(t.valor),
        fixo: Boolean(t.fixo),
        pago: Boolean(t.pago)
      }));
      setTransacoes(transacoesFormatadas);

      setFormRapido({
        valor: '',
        categoria: '',
        tipo: 'gasto',
        data: new Date().toISOString().slice(0, 10),
        parcelas: 1,
        recorrencia: 'nenhuma',
        dataFinal: ''
      });
      setModalRapido(false);
      toast.success('Transação criada com sucesso!');
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar transação");
    }
  };

  const deletarTransacao = async (id) => {
    const confirmar = window.confirm('Deseja realmente excluir esta transação?');
    if (confirmar) {
      try {
        await fetch(`${API_URL}/api/transacoes/${id}`, {
          method: 'DELETE'
        });
        setTransacoes(prev => prev.filter(t => t.id !== id));
        toast.success('Transação deletada!');
      } catch (err) {
        console.error("Erro ao deletar:", err);
        toast.error("Erro ao deletar transação");
      }
    }
  };

  const togglePago = async (id) => {
            const transacao = transacoes.find(t => t.id === id);
            if (!transacao) return;

            try {
              await fetch(`${API_URL}/api/transacoes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...transacao,
                  pago: !transacao.pago
                })
              });

              setTransacoes(prev => prev.map(t =>
                t.id === id ? { ...t, pago: !t.pago } : t
              ));
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

          const calcularVencimentos = () => {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const em3Dias = new Date(hoje);
            em3Dias.setDate(em3Dias.getDate() + 3);

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

            return {
              vencidas,
              vencem3Dias,
              total: nãoPagas.length,
              totalVencendo: vencidas.length + vencem3Dias.length
            };
          };

          // ✅ OTIMIZADO: Cachear cálculo para evitar recalcular a cada render
          const dadosPorCategoria = useMemo(() => {
            const transacoesMes = transacoes.filter(t => t.data.startsWith(mesAtual) && t.tipo === 'gasto');
            const total = transacoesMes.reduce((sum, t) => sum + t.valor, 0);

            if (total === 0) return [];

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
          }, [transacoes, mesAtual]); // Só recalcula quando transações ou mês mudam

          // Manter função para compatibilidade (apenas retorna o cache)
          const calcularPorCategoria = () => dadosPorCategoria;

          // ✅ MELHORADO: Só exibe meses com dados (6 meses antes e depois)
          const getEvolucaoMeses = () => {
            const mesesComDados = new Set();

            // Identificar meses com transações
            transacoes.forEach(t => {
              const mesTransacao = t.data.slice(0, 7);
              mesesComDados.add(mesTransacao);
            });

            if (mesesComDados.size === 0) {
              return [];
            }

            const mesesOrdenados = Array.from(mesesComDados).sort();
            const mesAtualIndex = mesesOrdenados.indexOf(mesAtual);

            let mesesExibir = [];
            if (mesAtualIndex === -1) {
              // Se mês atual não tem dados, pega últimos 6 meses com dados
              mesesExibir = mesesOrdenados.slice(-6);
            } else {
              // Pega 3 antes e 3 depois do mês atual (se existirem)
              const inicio = Math.max(0, mesAtualIndex - 3);
              const fim = Math.min(mesesOrdenados.length, mesAtualIndex + 4);
              mesesExibir = mesesOrdenados.slice(inicio, fim);
            }

            return mesesExibir.map(mesStr => {
              const totais = calcularTotais(mesStr);
              const data = new Date(mesStr + '-01');
              return {
                mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
                mesCompleto: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
                gastos: totais.gastos,
                receitas: totais.receitas
              };
            });
          };

          // ✅ CORRIGIDO: Previsão do próximo mês
          const calcularPrevisao = () => {
            const hoje = new Date();
            const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
            const proximoMesStr = proximoMes.toISOString().slice(0, 7);

            // Buscar transações do próximo mês
            const transacoesProximoMes = transacoes.filter(t => t.data.startsWith(proximoMesStr));

            // Gastos fixos do próximo mês (ou usar média dos últimos 3 meses de fixos)
            const gastosFixosProximoMes = transacoesProximoMes
              .filter(t => t.tipo === 'gasto' && t.fixo)
              .reduce((sum, t) => sum + t.valor, 0);

            // Se não houver gastos fixos agendados, usar média dos últimos 3 meses
            let gastosFixos = gastosFixosProximoMes;
            if (gastosFixos === 0) {
              const fixosMeses = [];
              for (let i = 1; i <= 3; i++) {
                const data = new Date();
                data.setMonth(data.getMonth() - i);
                const mesStr = data.toISOString().slice(0, 7);
                const totais = calcularTotais(mesStr);
                fixosMeses.push(totais.fixos);
              }
              gastosFixos = fixosMeses.reduce((a, b) => a + b, 0) / fixosMeses.length;
            }

            // Gastos variáveis: média dos últimos 3 meses
            const variaveisMeses = [];
            for (let i = 1; i <= 3; i++) {
              const data = new Date();
              data.setMonth(data.getMonth() - i);
              const mesStr = data.toISOString().slice(0, 7);
              const totais = calcularTotais(mesStr);
              variaveisMeses.push(totais.variaveis);
            }
            const mediaVariaveis = variaveisMeses.reduce((a, b) => a + b, 0) / variaveisMeses.length;

            // Receitas do próximo mês (ou média dos últimos 3 meses)
            const receitasProximoMes = transacoesProximoMes
              .filter(t => t.tipo === 'receita')
              .reduce((sum, t) => sum + t.valor, 0);

            let receitas = receitasProximoMes;
            if (receitas === 0) {
              const receitasMeses = [];
              for (let i = 1; i <= 3; i++) {
                const data = new Date();
                data.setMonth(data.getMonth() - i);
                const mesStr = data.toISOString().slice(0, 7);
                receitasMeses.push(calcularTotais(mesStr).receitas);
              }
              receitas = receitasMeses.reduce((a, b) => a + b, 0) / receitasMeses.length;
            }

            const previsaoGastos = gastosFixos + mediaVariaveis;
            const previsaoSaldo = receitas - previsaoGastos;

            return {
              previsaoGastos,
              previsaoReceitas: receitas,
              previsaoSaldo,
              alerta: previsaoGastos > receitas,
              temDadosAgendados: transacoesProximoMes.length > 0
            };
          };

          const exportarCSV = () => {
            const csv = [
              ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Fixo', 'Pago'],
              ...transacoes.map(t => [
                t.data,
                t.tipo,
                t.categoria,
                t.descricao || '',
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
            URL.revokeObjectURL(url);
          };

          // ✅ NOVO: Editar Caixinha
          const editarCaixinha = async () => {
            if (!formCaixinha.nome || !formCaixinha.valor_total || !formCaixinha.parcelas_total) {
              toast.error('Preencha todos os campos');
              return;
            }

            try {
              await fetch(`${API_URL}/api/caixinhas/${caixinhaEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...formCaixinha,
                  valor_total: parseFloat(formCaixinha.valor_total),
                  parcelas_total: parseInt(formCaixinha.parcelas_total)
                })
              });

              setCaixinhas(prev => prev.map(c => c.id === caixinhaEdit.id ? {
                ...c,
                ...formCaixinha,
                valor_total: parseFloat(formCaixinha.valor_total),
                parcelas_total: parseInt(formCaixinha.parcelas_total)
              } : c));

              setFormCaixinha({
                nome: '',
                valor_total: '',
                parcelas_total: '',
                data_inicio: new Date().toISOString().slice(0, 10)
              });
              setCaixinhaEdit(null);
              setModalEditCaixinha(false);
            } catch (err) {
              console.error("Erro ao editar:", err);
              toast.error('Erro ao editar caixinha');
            }
          };

          // ✅ NOVO: Calcular previsão de conclusão da caixinha
          const calcularPrevisaoCaixinha = (caixinha) => {
            if (caixinha.parcelas_pagas >= caixinha.parcelas_total) {
              return 'Concluída! 🎉';
            }

            const faltam = caixinha.parcelas_total - caixinha.parcelas_pagas;
            const dataInicio = new Date(caixinha.data_inicio || new Date());
            const dataConclusao = new Date(dataInicio);
            dataConclusao.setMonth(dataConclusao.getMonth() + caixinha.parcelas_total);

            return `Prev: ${dataConclusao.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} (${faltam} meses)`;
          };

          const totaisAtual = calcularTotais(mesAtual);
          // ✅ MELHORADO: Ordenação - Pendentes primeiro + Mais recentes no topo
          const transacoesFiltradas = transacoes
            .filter(t => t.data.startsWith(mesAtual))
            .filter(t => filtros.categoria === 'todas' || t.categoria === filtros.categoria)
            .filter(t => filtros.tipo === 'todos' || t.tipo === filtros.tipo)
            .sort((a, b) => {
              // 1º Critério: Pendentes primeiro
              if (a.pago !== b.pago) {
                return a.pago ? 1 : -1; // Não pagas (false) vêm primeiro
              }
              // 2º Critério: Mais recentes primeiro
              return new Date(b.data) - new Date(a.data);
            });

          const IconeCategoria = ({ categoria, tamanho = 18 }) => {
            const Icon = CATEGORIA_CONFIG[categoria]?.icon || DollarSign;
            return <Icon size={tamanho} />;
          };

          return (
            <div
              className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
              style={{
                paddingBottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))'
              }}
            >
              {/* ✅ ADICIONAR Toaster AQUI */}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: darkMode ? '#1F2937' : '#FFFFFF',
                    color: darkMode ? '#F3F4F6' : '#111827',
                  },
                }}
              />
              {/* Header */}
              <div
                className={`border-b sticky top-0 z-20 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                style={{
                  paddingTop: 'max(1rem, env(safe-area-inset-top))',
                }}
              >
                <div className="max-w-6xl mx-auto px-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    {/* Logo e saudação */}
                    <div>
                      <h1 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        💰 Finanças
                      </h1>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Olá, {usuario.nome}
                      </p>
                    </div>

                    {/* Botões (Dark Mode + Logout) */}
                    <div className="flex items-center gap-2">
                      {/* Botão Dark Mode */}
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-lg transition-all active:scale-95 ${darkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
                      >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                      </button>

                      {/* Botão Logout */}
                      <button
                        onClick={onLogout}
                        className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 flex items-center gap-1 text-sm min-h-[44px] transition-all active:scale-95"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <button
                      onClick={() => setTela('dashboard')}
                      className={`px-4 py-2.5 rounded-lg text-sm whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${tela === 'dashboard' ? 'bg-blue-600 scale-105' : 'bg-gray-700'
                        }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => setTela('transacoes')}
                      className={`px-4 py-2.5 rounded-lg text-sm relative whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${tela === 'transacoes' ? 'bg-blue-600 scale-105' : 'bg-gray-700'
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
                      className={`px-4 py-2.5 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${tela === 'caixinhas' ? 'bg-blue-600 scale-105' : 'bg-gray-700'
                        }`}
                    >
                      <Wallet size={16} />
                      Caixinhas
                    </button>
                    <button
                      onClick={() => setTela('relatorios')}
                      className={`px-4 py-2.5 rounded-lg text-sm whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${tela === 'relatorios' ? 'bg-blue-600 scale-105' : 'bg-gray-700'
                        }`}
                    >
                      Relatórios
                    </button>
                  </div>
                </div>
              </div>

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
                {/* Dashboard */}
                {tela === 'dashboard' && (
                  <>
                    {/* ✅ Seletor de Datas ÚNICO */}
                    <div className="mb-6">
                      <DateSelector value={mesAtual} onChange={setMesAtual} />
                    </div>

                    {/* ✅ NOVO: Insights Automáticos */}
                    <InsightCard transacoes={transacoes} mesAtual={mesAtual} />

                    {/* Alert de Vencimentos */}
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

                    {/* Cards de Resumo */}
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
                      <h3 className="text-sm font-semibold mb-4 text-gray-300">Evolução Mensal</h3>
                      {getEvolucaoMeses().length === 0 ? (
                        <p className="text-gray-400 text-center py-8 text-sm">Nenhum dado disponível</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={140}>
                          <LineChart data={getEvolucaoMeses()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="mesCompleto" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
                            <YAxis stroke="#9CA3AF" style={{ fontSize: '11px' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                              formatter={(value) => `R$ ${value.toFixed(2)}`}
                            />
                            <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="receitas" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
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
                      {calcularPorCategoria().length === 0 ? (
                        <p className="text-gray-400 text-center py-4 text-sm">Nenhum gasto registrado neste mês</p>
                      ) : (
                        <div className="space-y-3">
                          {calcularPorCategoria().slice(0, 5).map((item) => (
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
                      )}
                    </div>
                  </>
                )}

                {/* Tela Transações */}
                {tela === 'transacoes' && (
                  <>
                    {/* ✅ Seletor de Datas */}
                    <div className="mb-4">
                      <DateSelector value={mesAtual} onChange={setMesAtual} />
                    </div>

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

                    {/* ✅ NOVO: Cards Informativos Úteis */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Contas Vencidas */}
                      <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertCircle size={14} className="text-red-400" />
                          <div className="text-xs text-red-400 font-medium">Vencidas</div>
                        </div>
                        <div className="text-lg font-bold text-red-300">{calcularVencimentos().vencidas.length}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          R$ {calcularVencimentos().vencidas.reduce((sum, t) => sum + t.valor, 0).toFixed(2)}
                        </div>
                      </div>

                      {/* A Vencer Esta Semana */}
                      <div className="bg-orange-600/20 border border-orange-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertCircle size={14} className="text-orange-400" />
                          <div className="text-xs text-orange-400 font-medium">Vence Esta Semana</div>
                        </div>
                        <div className="text-lg font-bold text-orange-300">{calcularVencimentos().vencem3Dias.length}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          R$ {calcularVencimentos().vencem3Dias.reduce((sum, t) => sum + t.valor, 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Total Pago */}
                      <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle size={14} className="text-green-400" />
                          <div className="text-xs text-green-400 font-medium">Pago</div>
                        </div>
                        <div className="text-lg font-bold text-green-300">
                          {transacoesFiltradas.filter(t => t.pago).length}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          R$ {transacoesFiltradas.filter(t => t.pago).reduce((sum, t) => sum + t.valor, 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Total Pendente */}
                      <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertCircle size={14} className="text-purple-400" />
                          <div className="text-xs text-purple-400 font-medium">Pendente</div>
                        </div>
                        <div className="text-lg font-bold text-purple-300">
                          {transacoesFiltradas.filter(t => !t.pago && t.tipo === 'gasto').length}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          R$ {totaisAtual.naoPagos.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Lista de Transações */}
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
                                <div className="flex items-start gap-3 mb-3">
                                  <div
                                    className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: cor + '30' }}
                                  >
                                    <div style={{ color: cor }}>
                                      <IconeCategoria categoria={t.categoria} tamanho={20} />
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-base truncate mb-1">{t.categoria}</div>

                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                      {t.fixo && <span className="text-xs bg-blue-600/60 px-2 py-0.5 rounded">Fixo</span>}
                                      {t.pago && <span className="text-xs bg-green-600/60 px-2 py-0.5 rounded">✓ Pago</span>}
                                      {isVencida && <span className="text-xs bg-red-600 px-2 py-0.5 rounded font-bold">VENCIDA 🔴</span>}
                                      {vence3Dias && <span className="text-xs bg-orange-600 px-2 py-0.5 rounded font-bold">Vence em breve 🟡</span>}
                                      {t.parcelas > 1 && (
                                        <span className="text-xs bg-purple-600/60 px-2 py-0.5 rounded">
                                          {t.parcela_atual}/{t.parcelas}
                                        </span>
                                      )}
                                    </div>

                                    <div className="text-xs text-gray-400">
                                      {t.descricao && <span className="block truncate mb-0.5">{t.descricao}</span>}
                                      <span>{new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    <div className={`font-bold text-lg ${t.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                                      {t.tipo === 'receita' ? '+' : '-'}R$ {t.valor.toFixed(2)}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-gray-600/50">
                                  <button
                                    onClick={() => togglePago(t.id)}
                                    className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 min-h-[44px] ${t.pago
                                      ? 'bg-gray-600 text-gray-300'
                                      : 'bg-green-600/80 hover:bg-green-600 text-white'
                                      }`}
                                  >
                                    {t.pago ? '✓ Pago' : 'Marcar Pago'}
                                  </button>

                                  <button
                                    onClick={() => deletarTransacao(t.id)}
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
                      )}
                    </div>
                  </>
                )}

                {/* Tela Caixinhas */}
                {tela === 'caixinhas' && (
                  <>
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => setModalCaixinha(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={20} />
                        Nova Caixinha
                      </button>

                      {/* ✅ NOVO: Toggle Concluídas */}
                      <button
                        onClick={() => setMostrarConcluidas(!mostrarConcluidas)}
                        className={`px-4 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${mostrarConcluidas
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                      >
                        {mostrarConcluidas ? '✅ Concluídas' : '📋 Ativas'}
                      </button>
                    </div>

                    {(() => {
                      // ✅ NOVO: Filtrar caixinhas por status
                      const caixinhasFiltradas = caixinhas.filter(c => {
                        const concluida = c.parcelas_pagas >= c.parcelas_total;
                        return mostrarConcluidas ? concluida : !concluida;
                      });

                      if (caixinhasFiltradas.length === 0) {
                        return (
                          <div className="bg-gray-800 rounded-lg p-8 text-center">
                            <Wallet size={48} className="mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400 mb-2">
                              {mostrarConcluidas
                                ? 'Nenhuma caixinha concluída ainda'
                                : 'Nenhuma caixinha ativa'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {mostrarConcluidas
                                ? 'Complete suas caixinhas para vê-las aqui'
                                : 'Crie uma caixinha para organizar seus objetivos financeiros'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {caixinhasFiltradas.map(c => {
                            const progresso = (c.valor_pago / c.valor_total * 100).toFixed(1);
                            const valorParcela = (c.valor_total / c.parcelas_total).toFixed(2);
                            const faltam = c.parcelas_total - c.parcelas_pagas;

                            return (
                              <div key={c.id} className="bg-gray-800 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-bold text-lg">{c.nome}</h3>
                                  <div className="flex gap-2">
                                    {/* ✅ NOVO: Botão Editar */}
                                    <button
                                      onClick={() => {
                                        setCaixinhaEdit(c);
                                        setFormCaixinha({
                                          nome: c.nome,
                                          valor_total: c.valor_total.toString(),
                                          parcelas_total: c.parcelas_total.toString(),
                                          data_inicio: c.data_inicio || new Date().toISOString().slice(0, 10)
                                        });
                                        setModalEditCaixinha(true);
                                      }}
                                      className="text-blue-400 hover:text-blue-300 p-2"
                                    >
                                      <Edit2 size={18} />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('Deseja realmente deletar esta caixinha?')) {
                                          try {
                                            await fetch(`${API_URL}/api/caixinhas/${c.id}`, {
                                              method: 'DELETE'
                                            });
                                            setCaixinhas(prev => prev.filter(cx => cx.id !== c.id));
                                          } catch (err) {
                                            console.error("Erro ao deletar:", err);
                                            alert("Erro ao deletar caixinha");
                                          }
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 p-2"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>

                                {/* ✅ NOVO: Previsão de Conclusão */}
                                <div className="text-sm text-gray-400 mb-3">
                                  {calcularPrevisaoCaixinha(c)}
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
                                        const valorParcelaNum = parseFloat(valorParcela);

                                        await fetch(`${API_URL}/api/caixinhas/${c.id}/pagar`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ valor: valorParcelaNum })
                                        });

                                        // ✅ CORREÇÃO: Garantir que valores são numbers
                                        setCaixinhas(prev => prev.map(cx => cx.id === c.id ? {
                                          ...cx,
                                          valor_pago: parseFloat(cx.valor_pago || 0) + valorParcelaNum,
                                          parcelas_pagas: parseInt(cx.parcelas_pagas || 0) + 1
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
                      );
                    })()}
                  </>
                )}

                {/* Tela Relatórios */}
                {tela === 'relatorios' && (
                  <>
                    {/* Previsão */}
                    <div className={`${calcularPrevisao().alerta ? 'bg-red-600/20 border-red-600/30' : 'bg-green-600/20 border-green-600/30'} border rounded-lg p-4 mb-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        {calcularPrevisao().alerta ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle size={20} className="text-green-400" />}
                        <h3 className="font-bold">Previsão Próximo Mês</h3>
                        {calcularPrevisao().temDadosAgendados && (
                          <span className="text-xs bg-blue-600/30 px-2 py-1 rounded">Com dados agendados</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Receitas Previstas</div>
                          <div className="font-bold text-lg text-green-400">R$ {calcularPrevisao().previsaoReceitas.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Gastos Previstos</div>
                          <div className="font-bold text-lg text-red-400">R$ {calcularPrevisao().previsaoGastos.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Saldo Previsto</div>
                          <div className={`font-bold text-lg ${calcularPrevisao().previsaoSaldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            R$ {calcularPrevisao().previsaoSaldo.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      {calcularPrevisao().alerta && (
                        <div className="text-xs text-red-300 mt-2">⚠️ Gastos previstos excedem receita prevista</div>
                      )}
                    </div>

                    {/* ✅ MELHORADO: Gráfico de Pizza + Ranking LADO A LADO */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      {/* Gráfico de Pizza com Legenda */}
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-bold mb-4">Distribuição de Gastos</h3>
                        {calcularPorCategoria().length === 0 ? (
                          <p className="text-gray-400 text-center py-8 text-sm">Nenhum gasto para exibir</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={300}>
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
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                wrapperStyle={{ fontSize: '12px' }}
                              />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#f8f8f8ff', border: 'none', borderRadius: '8px' }}
                                formatter={(value) => `R$ ${value.toFixed(2)}`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Ranking */}
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          <BarChart3 size={20} />
                          Ranking por Categoria
                        </h3>
                        {calcularPorCategoria().length === 0 ? (
                          <p className="text-gray-400 text-center py-4 text-sm">Nenhum gasto registrado</p>
                        ) : (
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
                        )}
                      </div>
                    </div>

                    {/* Evolução */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <h3 className="font-bold mb-4">Evolução Mensal</h3>
                      {getEvolucaoMeses().length === 0 ? (
                        <p className="text-gray-400 text-center py-8 text-sm">Nenhum dado disponível</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={getEvolucaoMeses()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="mesCompleto" stroke="#9CA3AF" />
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
                      )}
                    </div>

                    {/* Exportar */}
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
              </div>

              {/* Botão Flutuante */}
              <button
                onClick={() => setModalRapido(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-600 to-green-500 rounded-full shadow-2xl flex items-center justify-center z-30 transition-all active:scale-90"
                style={{
                  bottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))'
                }}
              >
                <PlusCircle size={26} strokeWidth={2.5} />
              </button>

              {/* ✅ MODAL RÁPIDO COMPLETO */}
              {modalRapido && (
                <div
                  className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-40"
                  onClick={() => setModalRapido(false)}
                >
                  <div
                    className="bg-gray-800 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
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
                      {/* Tipo */}
                      <div>
                        <label className="block text-sm mb-2 font-medium">Tipo</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setFormRapido({ ...formRapido, tipo: 'gasto', categoria: '' })}
                            className={`py-4 rounded-xl font-semibold transition-all min-h-[52px] ${formRapido.tipo === 'gasto' ? 'bg-red-600 scale-105 shadow-lg' : 'bg-gray-700 active:scale-95'
                              }`}
                          >
                            💸 Gasto
                          </button>
                          <button
                            onClick={() => setFormRapido({ ...formRapido, tipo: 'receita', categoria: '' })}
                            className={`py-4 rounded-xl font-semibold transition-all min-h-[52px] ${formRapido.tipo === 'receita' ? 'bg-green-600 scale-105 shadow-lg' : 'bg-gray-700 active:scale-95'
                              }`}
                          >
                            💰 Receita
                          </button>
                        </div>
                      </div>

                      {/* Valor */}
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

                      {/* Categoria */}
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

                      {/* ✅ CORREÇÃO: Só mostrar vencimento para GASTOS */}
                      {formRapido.tipo === 'gasto' && (
                        <div>
                          <label className="block text-sm mb-2 font-medium">Vencimento</label>
                          <input
                            type="date"
                            value={formRapido.data}
                            onChange={(e) => setFormRapido({ ...formRapido, data: e.target.value })}
                            className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 focus:border-blue-500 focus:outline-none min-h-[52px]"
                          />
                        </div>
                      )}

                      {/* ✅ MELHORADO: Recorrência para GASTOS E RECEITAS */}
                      <div>
                        <label className="block text-sm mb-2 font-medium flex items-center gap-2">
                          <Repeat size={16} />
                          Recorrência
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setFormRapido({ ...formRapido, recorrencia: 'nenhuma', dataFinal: '' })}
                            className={`py-3 rounded-lg font-medium text-sm transition-all min-h-[44px] ${formRapido.recorrencia === 'nenhuma' ? 'bg-blue-600 scale-105' : 'bg-gray-700 active:scale-95'
                              }`}
                          >
                            Única
                          </button>
                          <button
                            onClick={() => setFormRapido({ ...formRapido, recorrencia: 'mensal' })}
                            className={`py-3 rounded-lg font-medium text-sm transition-all min-h-[44px] ${formRapido.recorrencia === 'mensal' ? 'bg-blue-600 scale-105' : 'bg-gray-700 active:scale-95'
                              }`}
                          >
                            Mensal
                          </button>
                          <button
                            onClick={() => setFormRapido({ ...formRapido, recorrencia: 'semanal' })}
                            className={`py-3 rounded-lg font-medium text-sm transition-all min-h-[44px] ${formRapido.recorrencia === 'semanal' ? 'bg-blue-600 scale-105' : 'bg-gray-700 active:scale-95'
                              }`}
                          >
                            Semanal
                          </button>
                        </div>
                      </div>

                      {/* ✅ NOVO: Data Final (se recorrente) */}
                      {formRapido.recorrencia !== 'nenhuma' && (
                        <div>
                          <label className="block text-sm mb-2 font-medium">Data Final da Recorrência</label>
                          <input
                            type="date"
                            value={formRapido.dataFinal}
                            onChange={(e) => setFormRapido({ ...formRapido, dataFinal: e.target.value })}
                            className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 focus:border-blue-500 focus:outline-none min-h-[52px]"
                          />
                          <p className="text-xs text-blue-400 mt-2">
                            ℹ️ Serão criadas transações {formRapido.recorrencia === 'mensal' ? 'mensais' : 'semanais'} até esta data
                          </p>
                        </div>
                      )}

                      {/* ✅ NOVO: Parcelas (se não for recorrente e for GASTO) */}
                      {/* ✅ NOVO: Parcelas (se não for recorrente e for GASTO) */}
                      {formRapido.tipo === 'gasto' && formRapido.recorrencia === 'nenhuma' && (
                        <div>
                          <label className="block text-sm mb-2 font-medium">Parcelas</label>
                          <div className="flex gap-3 items-center">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="1"
                              max="60"
                              value={formRapido.parcelas}
                              onChange={(e) => setFormRapido({ ...formRapido, parcelas: e.target.value })}
                              className="w-24 bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-4 text-center font-semibold focus:border-blue-500 focus:outline-none min-h-[52px]"
                            />
                            <span className="text-sm text-gray-400 flex-1">
                              {formRapido.parcelas > 1 && formRapido.valor
                                ? `${formRapido.parcelas}x de R$ ${(parseFloat(formRapido.valor || 0) / parseInt(formRapido.parcelas || 1)).toFixed(2)}`
                                : 'À vista (1x)'}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={salvarRapido}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 min-h-[52px]"
                      >
                        ✅ Salvar Agora
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Nova Caixinha */}
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
                            toast.error('Preencha todos os campos');
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

                            setCaixinhas(prev => [{
                              id: dados.id,
                              ...formCaixinha,
                              usuario_id: usuario.id,
                              valor_total: parseFloat(formCaixinha.valor_total),
                              valor_pago: 0,
                              parcelas_total: parseInt(formCaixinha.parcelas_total),
                              parcelas_pagas: 0
                            }, ...prev]);

                            setFormCaixinha({
                              nome: '',
                              valor_total: '',
                              parcelas_total: '',
                              data_inicio: new Date().toISOString().slice(0, 10)
                            });
                            setModalCaixinha(false);
                          } catch (err) {
                            console.error("Erro ao criar:", err);
                            toast.error('Erro ao criar caixinha');
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

              {/* ✅ NOVO: Modal Editar Caixinha */}
              {modalEditCaixinha && (
                <div
                  className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-40"
                  onClick={() => setModalEditCaixinha(false)}
                >
                  <div
                    className="bg-gray-800 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl"
                    style={{
                      paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">✏️ Editar Caixinha</h2>
                      <button
                        onClick={() => setModalEditCaixinha(false)}
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
                        />
                      </div>

                      <button
                        onClick={editarCaixinha}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 min-h-[52px]"
                      >
                        ✅ Salvar Alterações
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Modais */}
              <ModalCategoria
                isOpen={modalNovaCategoria}
                onClose={() => {
                  setModalNovaCategoria(false);
                  setCategoriaEdit(null);
                }}
                onSave={(cat) => {
                  setCategoriasCustom(prev => [...prev, cat]);
                }}
                categoriaEdit={categoriaEdit}
                usuario={usuario}
              />

              <ModalConta
                isOpen={modalNovaConta}
                onClose={() => {
                  setModalNovaConta(false);
                  setContaEdit(null);
                }}
                onSave={(conta) => {
                  setContas(prev => [...prev, conta]);
                }}
                contaEdit={contaEdit}
                usuario={usuario}
              />
            </div>
          );
        };
      

        export default FinanceApp;