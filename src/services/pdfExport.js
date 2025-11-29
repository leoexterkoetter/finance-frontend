import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '../utils/formatters';

// ✅ MELHORADO: PDF com design moderno e bonito
export const exportarPDF = (transacoes, totais, mesAtual, usuario, porCategoria) => {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 20;

  // === HEADER COM GRADIENTE ===
  // Fundo gradiente (simulado com retângulos)
  doc.setFillColor(17, 24, 39); // gray-900
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setFillColor(31, 41, 55); // gray-800
  doc.rect(0, 50, pageWidth, 10, 'F');

  // Título
  doc.setFontSize(26);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('💰 Finance App', margin, 20);
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(209, 213, 219); // gray-300
  doc.text('Relatório Financeiro', margin, 32);
  
  // Info do usuário e período
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text(`👤 ${usuario.nome}`, margin, 43);
  
  const [year, month] = mesAtual.split('-');
  const mesFormatado = new Date(year, month - 1).toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });
  doc.text(`📅 ${mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1)}`, margin + 60, 43);
  doc.text(`🕒 ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, margin + 120, 43);

  yPos = 70;

  // === CARDS DE RESUMO (3 colunas) ===
  const cardWidth = (pageWidth - margin * 2 - 10) / 3;
  const cardHeight = 30;
  
  // Card Receitas (Verde)
  doc.setFillColor(220, 252, 231); // green-100
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(34, 197, 94); // green-500
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'S');
  
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61); // green-700
  doc.text('💚 RECEITAS', margin + 3, yPos + 7);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(22, 163, 74); // green-600
  doc.text(formatCurrency(totais.receitas), margin + 3, yPos + 18);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(21, 128, 61);
  doc.text(`${transacoes.filter(t => t.data.startsWith(mesAtual) && t.tipo === 'receita').length} lançamentos`, margin + 3, yPos + 25);

  // Card Gastos (Vermelho)
  const xGastos = margin + cardWidth + 5;
  doc.setFillColor(254, 226, 226); // red-100
  doc.roundedRect(xGastos, yPos, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(239, 68, 68); // red-500
  doc.roundedRect(xGastos, yPos, cardWidth, cardHeight, 3, 3, 'S');
  
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text('💸 GASTOS', xGastos + 3, yPos + 7);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(220, 38, 38); // red-600
  doc.text(formatCurrency(totais.gastos), xGastos + 3, yPos + 18);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(185, 28, 28);
  doc.text(`${transacoes.filter(t => t.data.startsWith(mesAtual) && t.tipo === 'gasto').length} lançamentos`, xGastos + 3, yPos + 25);

  // Card Saldo (Azul ou Vermelho)
  const xSaldo = xGastos + cardWidth + 5;
  const saldoPositivo = totais.saldo >= 0;
  if (saldoPositivo) {
    doc.setFillColor(219, 234, 254); // blue-100
  } else {
    doc.setFillColor(254, 226, 226); // red-100
  }
  doc.roundedRect(xSaldo, yPos, cardWidth, cardHeight, 3, 3, 'F');
  
  if (saldoPositivo) {
    doc.setDrawColor(59, 130, 246); // blue-500
  } else {
    doc.setDrawColor(239, 68, 68); // red-500
  }
  doc.roundedRect(xSaldo, yPos, cardWidth, cardHeight, 3, 3, 'S');
  
  doc.setFontSize(9);
  if (saldoPositivo) {
    doc.setTextColor(29, 78, 216); // blue-700
  } else {
    doc.setTextColor(185, 28, 28); // red-700
  }
  doc.text(saldoPositivo ? '💰 SALDO' : '⚠️ DÉFICIT', xSaldo + 3, yPos + 7);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  if (saldoPositivo) {
    doc.setTextColor(37, 99, 235); // blue-600
  } else {
    doc.setTextColor(220, 38, 38); // red-600
  }
  doc.text(formatCurrency(Math.abs(totais.saldo)), xSaldo + 3, yPos + 18);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  const percentual = totais.receitas > 0 ? ((totais.saldo / totais.receitas) * 100).toFixed(1) : 0;
  doc.text(`${saldoPositivo ? '+' : '-'}${percentual}% da receita`, xSaldo + 3, yPos + 25);

  yPos += cardHeight + 15;

  // === MINI CARDS (Fixos/Variáveis/Pendentes) ===
  const miniCardWidth = (pageWidth - margin * 2 - 10) / 3;
  const miniCardHeight = 18;
  
  // Fixos
  doc.setFillColor(243, 244, 246); // gray-100
  doc.roundedRect(margin, yPos, miniCardWidth, miniCardHeight, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99); // gray-600
  doc.text('🔹 Gastos Fixos', margin + 2, yPos + 6);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text(formatCurrency(totais.fixos), margin + 2, yPos + 13);

  // Variáveis
  doc.roundedRect(margin + miniCardWidth + 5, yPos, miniCardWidth, miniCardHeight, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('🔸 Gastos Variáveis', margin + miniCardWidth + 7, yPos + 6);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(formatCurrency(totais.variaveis), margin + miniCardWidth + 7, yPos + 13);

  // Pendentes
  doc.roundedRect(margin + (miniCardWidth + 5) * 2, yPos, miniCardWidth, miniCardHeight, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('⏰ A Pagar', margin + (miniCardWidth + 5) * 2 + 2, yPos + 6);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(234, 88, 12); // orange-600
  doc.text(formatCurrency(totais.naoPagos), margin + (miniCardWidth + 5) * 2 + 2, yPos + 13);

  yPos += miniCardHeight + 20;

  // === TOP 5 CATEGORIAS ===
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('📊 Top 5 Categorias', margin, yPos);
  
  yPos += 8;
  const top5 = porCategoria.slice(0, 5);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Categoria', 'Valor', 'Porcentagem']],
    body: top5.map(item => [
      item.categoria,
      formatCurrency(item.valor),
      `${item.porcentagem}%`
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // gray-50
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] }
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;

  // Nova página se necessário
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // === TRANSAÇÕES DETALHADAS ===
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('📋 Transações Detalhadas', margin, yPos);
  
  yPos += 8;
  
  const transacoesMes = transacoes
    .filter(t => t.data.startsWith(mesAtual))
    .sort((a, b) => {
      if (a.pago !== b.pago) return a.pago ? 1 : -1;
      return new Date(b.data) - new Date(a.data);
    });

  if (transacoesMes.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text('Nenhuma transação encontrada neste período', margin, yPos);
  } else {
    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Tipo', 'Categoria', 'Valor', 'Status']],
      body: transacoesMes.map(t => [
        formatDate(t.data),
        t.tipo === 'receita' ? '💚 Receita' : '💸 Gasto',
        t.categoria,
        formatCurrency(t.valor),
        t.pago ? '✅ Pago' : '⏰ Pendente'
      ]),
      theme: 'plain',
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 45 },
        3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 25, halign: 'center' }
      },
      didParseCell: function(data) {
        // Destacar pendentes
        if (data.section === 'body' && data.column.index === 4 && data.cell.raw === '⏰ Pendente') {
          data.cell.styles.textColor = [234, 88, 12]; // orange-600
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
  }

  // === RODAPÉ MODERNO ===
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Linha superior do rodapé
    const footerY = pageHeight - 15;
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    
    // Textos do rodapé
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.setFont(undefined, 'normal');
    doc.text('💰 Finance App - Seu controle financeiro pessoal', margin, footerY + 6);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin,
      footerY + 6,
      { align: 'right' }
    );
  }

  // Salvar
  const [year2, month2] = mesAtual.split('-');
  const nomeArquivo = `finance_app_${year2}_${month2}.pdf`;
  doc.save(nomeArquivo);
};

export const exportarPDFCompleto = (transacoes, caixinhas, usuario, periodo) => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let yPos = 20;

  // Título
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('💰 Relatório Completo', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Usuário: ${usuario.nome}`, margin, yPos);
  yPos += 5;
  doc.text(`Período: ${periodo.inicio} a ${periodo.fim}`, margin, yPos);
  yPos += 5;
  doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPos);

  // Linha separadora
  yPos += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // Todas as Transações
  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Todas as Transações', margin, yPos);
  
  yPos += 8;
  
  const todasTransacoes = transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

  autoTable(doc, {
    startY: yPos,
    head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']],
    body: todasTransacoes.map(t => [
      formatDate(t.data),
      t.tipo === 'receita' ? 'Receita' : 'Gasto',
      t.categoria,
      t.descricao || '-',
      formatCurrency(t.valor)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 8 }
  });

  // Nova página para caixinhas
  if (caixinhas.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Caixinhas', margin, yPos);
    
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Nome', 'Valor Total', 'Valor Pago', 'Parcelas', 'Progresso']],
      body: caixinhas.map(c => [
        c.nome,
        formatCurrency(c.valor_total),
        formatCurrency(c.valor_pago),
        `${c.parcelas_pagas}/${c.parcelas_total}`,
        `${((c.valor_pago / c.valor_total) * 100).toFixed(1)}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin }
    });
  }

  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`relatorio_completo_${new Date().toISOString().slice(0, 10)}.pdf`);
};