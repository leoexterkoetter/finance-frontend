import React from 'react';
import { DollarSign } from 'lucide-react';
import { CATEGORIA_CONFIG } from '../constants';

const IconeCategoria = ({ categoria, tamanho = 18 }) => {
  const Icon = CATEGORIA_CONFIG[categoria]?.icon || DollarSign;
  return <Icon size={tamanho} />;
};

export default IconeCategoria;