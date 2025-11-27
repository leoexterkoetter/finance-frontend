import { DollarSign, Home, Wifi, Smartphone, Car, Music, CreditCard, ShoppingCart, Pill, Zap, TrendingUp } from 'lucide-react';

export const CATEGORIA_CONFIG = {
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

export const CATEGORIAS_PADRAO = {
  fixos: ['Empréstimos', 'Aluguel/Condomínio', 'Internet', 'Celular', 'Carro', 'Assinaturas'],
  variaveis: ['Cartões de Crédito', 'Mercado', 'Farmácia', 'Gasolina', 'Lazer', 'Compras'],
  receitas: ['Salário', 'Freelance', 'Investimentos', 'Outros']
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3307';