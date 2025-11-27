import jsPDF from 'jspdf';

export const exportarPDF = (transacoes, totais, mesAtual, usuario, porCategoria) => {
  const doc = new jsPDF();
  
  let y = 20; // Posição vertical inicial
  const lineHeight = 7;
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('Relatorio Financeiro', 14, y);
  
  y += 15;
  
  // Informações do usuário
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Usuario: ${usuario.nome}`, 14, y);
  y += lineHeight;
  
  const [year, month] = mesAtual.split('-');
  const mesFormatado = new Date(year, month - 1).toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });
  doc.text(`Periodo: ${mesFormatado}`, 14, y);
  y += lineHeight;
  
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, y);
  y += 15;
  
  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);
  y += 10;
  
  // Resumo Financeiro
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumo Financeiro', 14, y);
  y += 10;
  
  doc.setFontSize(12);
  
  // Receitas (verde)
  doc.setTextColor(34, 197, 94);
  doc.text(`Receitas: R$ ${totais.receitas.toFixed(2)}`, 14, y);
  y += lineHeight;
  
  // Gastos (vermelho)
  doc.setTextColor(239, 68, 68);
  doc.text(`Gastos: R$ ${totais.gastos.toFixed(2)}`, 14, y);
  y += lineHeight;
  
  // Saldo
  const saldoCor = totais.saldo >= 0 ? [34, 197, 94] : [239, 68, 68];
  doc.setTextColor(...saldoCor);
  doc.text(`Saldo: R$ ${totais.saldo.toFixed(2)}`, 14, y);
  y += 10;
  
  // Detalhamento
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gastos Fixos: R$ ${totais.fixos.toFixed(2)}`, 14, y);
  y += lineHeight;
  doc.text(`Gastos Variaveis: R$ ${totais.variaveis.toFixed(2)}`, 14, y);
  y += lineHeight;
  doc.text(`A Pagar: R$ ${totais.naoPagos.toFixed(2)}`, 14, y);
  y += lineHeight;
  doc.text(`Fixos Pagos: ${totais.fixosPagos}/${totais.fixosTotal}`, 14, y);
  y += 15;
  
  // Top 5 Categorias
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Top 5 Categorias', 14, y);
  y += 10;
  
  doc.setFontSize(10);
  const top5 = porCategoria.slice(0, 5);
  
  top5.forEach((item, index) => {
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${item.categoria}`, 14, y);
    doc.text(`R$ ${item.valor.toFixed(2)}`, 120, y);
    doc.text(`${item.porcentagem}%`, 170, y);
    y += lineHeight;
  });
  
  y += 10;
  
  // Transações
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Transacoes Detalhadas', 14, y);
  y += 10;
  
  const transacoesMes = transacoes
    .filter(t => t.data.startsWith(mesAtual))
    .sort((a, b) => new Date(b.data) - new Date(a.data));
  
  doc.setFontSize(9);
  
  if (transacoesMes.length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.text('Nenhuma transacao encontrada', 14, y);
  } else {
    // Cabeçalho
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('Data', 14, y);
    doc.text('Tipo', 40, y);
    doc.text('Categoria', 70, y);
    doc.text('Valor', 130, y);
    doc.text('Status', 170, y);
    y += 7;
    
    // Linha
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);
    y += 5;
    
    doc.setFontSize(9);
    
    transacoesMes.forEach(t => {
      // Verificar se precisa de nova página
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const dataFormatada = new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR');
      
      doc.setTextColor(0, 0, 0);
      doc.text(dataFormatada, 14, y);
      doc.text(t.tipo === 'receita' ? 'Receita' : 'Gasto', 40, y);
      
      // Categoria (truncar se muito longa)
      const catText = t.categoria.length > 15 ? t.categoria.substring(0, 15) + '...' : t.categoria;
      doc.text(catText, 70, y);
      
      // Valor
      const valorText = `R$ ${t.valor.toFixed(2)}`;
      doc.text(valorText, 130, y);
      
      // Status
      doc.text(t.pago ? 'Pago' : 'Pendente', 170, y);
      
      y += 6;
    });
  }
  
  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Pagina ${i} de ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
  }
  
  // Salvar
  const nomeArquivo = `relatorio_financeiro_${mesAtual.replace('-', '_')}.pdf`;
  doc.save(nomeArquivo);
};