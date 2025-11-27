// Utilitários de formatação
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString) => {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
};

export const formatMonth = (monthString) => {
  const [year, month] = monthString.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export const formatShortMonth = (monthString) => {
  const [year, month] = monthString.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('pt-BR', { month: 'short' });
};

export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};