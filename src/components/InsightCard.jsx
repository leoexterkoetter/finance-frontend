import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const InsightCard = ({ transacoes, mesAtual }) => {
  const calcularInsights = () => {
    const mesAtualDate = new Date(mesAtual + '-01');
    const mesPassadoDate = new Date(mesAtualDate.getFullYear(), mesAtualDate.getMonth() - 1, 1);
    const mesPassado = mesPassadoDate.toISOString().slice(0, 7);

    // Dados do mês atual
    const transacoesAtual = transacoes.filter(t => t.data.startsWith(mesAtual));
    const gastosAtual = transacoes.filter(t => t.data.startsWith(mesAtual) && t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.valor, 0);
    const receitasAtual = transacoes.filter(t => t.data.startsWith(mesAtual) && t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);

    // Dados do mês passado
    const gastosPassado = transacoes.filter(t => t.data.startsWith(mesPassado) && t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.valor, 0);
    const receitasPassado = transacoes.filter(t => t.data.startsWith(mesPassado) && t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);

    // Análise por categoria
    const categoriasAtual = {};
    const categoriasPassado = {};

    transacoes.filter(t => t.data.startsWith(mesAtual) && t.tipo === 'gasto')
      .forEach(t => {
        categoriasAtual[t.categoria] = (categoriasAtual[t.categoria] || 0) + t.valor;
      });

    transacoes.filter(t => t.data.startsWith(mesPassado) && t.tipo === 'gasto')
      .forEach(t => {
        categoriasPassado[t.categoria] = (categoriasPassado[t.categoria] || 0) + t.valor;
      });

    const insights = [];

    // Insight 1: Comparação de gastos total
    if (gastosPassado > 0) {
      const variacaoGastos = ((gastosAtual - gastosPassado) / gastosPassado) * 100;
      if (Math.abs(variacaoGastos) >= 10) {
        insights.push({
          tipo: variacaoGastos > 0 ? 'alerta' : 'sucesso',
          icone: variacaoGastos > 0 ? TrendingUp : TrendingDown,
          mensagem: variacaoGastos > 0
            ? `📉 Você gastou ${Math.abs(variacaoGastos).toFixed(0)}% a mais que no mês passado`
            : `🎉 Você economizou ${Math.abs(variacaoGastos).toFixed(0)}% comparado ao mês passado`
        });
      }
    }

    // Insight 2: Categoria mais crítica
    let categoriaMaiorCrescimento = null;
    let maiorCrescimento = 0;

    Object.keys(categoriasAtual).forEach(cat => {
      const atual = categoriasAtual[cat];
      const passado = categoriasPassado[cat] || 0;
      
      if (passado > 0) {
        const crescimento = ((atual - passado) / passado) * 100;
        if (crescimento > maiorCrescimento && crescimento >= 30) {
          maiorCrescimento = crescimento;
          categoriaMaiorCrescimento = cat;
        }
      }
    });

    if (categoriaMaiorCrescimento) {
      insights.push({
        tipo: 'alerta',
        icone: AlertTriangle,
        mensagem: `⚠️ Categoria "${categoriaMaiorCrescimento}" cresceu ${maiorCrescimento.toFixed(0)}% este mês`
      });
    }

    // Insight 3: Saldo positivo
    const saldoAtual = receitasAtual - gastosAtual;
    const saldoPassado = receitasPassado - gastosPassado;
    
    if (saldoAtual > saldoPassado && saldoAtual > 0) {
      const diferenca = saldoAtual - saldoPassado;
      insights.push({
        tipo: 'sucesso',
        icone: CheckCircle,
        mensagem: `💰 Saldo positivo de R$ ${diferenca.toFixed(2)} a mais que no mês passado`
      });
    }

    // Insight 4: Categoria com maior gasto
    const categoriaTop = Object.entries(categoriasAtual)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (categoriaTop) {
      const [nome, valor] = categoriaTop;
      const porcentagem = (valor / gastosAtual) * 100;
      if (porcentagem >= 30) {
        insights.push({
          tipo: 'info',
          icone: Zap,
          mensagem: `📊 "${nome}" representa ${porcentagem.toFixed(0)}% dos seus gastos`
        });
      }
    }

    // Insight 5: Transações não pagas
    const naoPagas = transacoesAtual.filter(t => t.tipo === 'gasto' && !t.pago);
    if (naoPagas.length > 0) {
      const valorTotal = naoPagas.reduce((sum, t) => sum + t.valor, 0);
      insights.push({
        tipo: 'alerta',
        icone: AlertTriangle,
        mensagem: `⏰ Você tem ${naoPagas.length} conta(s) pendente(s) totalizando R$ ${valorTotal.toFixed(2)}`
      });
    }

    return insights.slice(0, 2); // Retorna no máximo 2 insights principais
  };

  const insights = calcularInsights();

  if (insights.length === 0) {
    return null;
  }

  const getCorFundo = (tipo) => {
    switch (tipo) {
      case 'sucesso': return 'bg-green-600/20 border-green-600/30';
      case 'alerta': return 'bg-orange-600/20 border-orange-600/30';
      case 'info': return 'bg-blue-600/20 border-blue-600/30';
      default: return 'bg-gray-600/20 border-gray-600/30';
    }
  };

  const getCorTexto = (tipo) => {
    switch (tipo) {
      case 'sucesso': return 'text-green-300';
      case 'alerta': return 'text-orange-300';
      case 'info': return 'text-blue-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {insights.map((insight, index) => {
        const Icon = insight.icone;
        return (
          <div
            key={index}
            className={`${getCorFundo(insight.tipo)} border rounded-xl p-4 flex items-start gap-3`}
          >
            <div className={`flex-shrink-0 ${getCorTexto(insight.tipo)}`}>
              <Icon size={22} />
            </div>
            <p className={`text-sm font-medium ${getCorTexto(insight.tipo)} leading-relaxed`}>
              {insight.mensagem}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default InsightCard;