import React from 'react';
import { X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const TIPOS_CONTA = [
  { value: 'cartao_credito', label: '💳 Cartão de Crédito' },
  { value: 'cartao_debito', label: '💳 Cartão de Débito' },
  { value: 'conta_corrente', label: '🏦 Conta Corrente' },
  { value: 'poupanca', label: '🏦 Poupança' },
  { value: 'dinheiro', label: '💵 Dinheiro' },
];

const CORES_DISPONIVEIS = [
  '#8A05BE', // Nubank
  '#3B82F6', // Azul
  '#EF4444', // Vermelho
  '#22C55E', // Verde
  '#F59E0B', // Laranja
  '#8B5CF6', // Roxo
  '#6B7280', // Cinza
];

const ModalConta = ({ 
  isOpen, 
  onClose, 
  onSave, 
  contaEdit,
  usuario 
}) => {
  const [form, setForm] = React.useState({
    nome: '',
    tipo: 'cartao_credito',
    limite: '',
    saldo_atual: '',
    cor: '#3B82F6',
  });

  React.useEffect(() => {
    if (contaEdit) {
      setForm(contaEdit);
    } else {
      setForm({
        nome: '',
        tipo: 'cartao_credito',
        limite: '',
        saldo_atual: '',
        cor: '#3B82F6',
      });
    }
  }, [contaEdit, isOpen]);

  const handleSave = async () => {
    if (!form.nome) {
      toast.error('Digite o nome da conta');
      return;
    }

    if (form.tipo === 'cartao_credito' && !form.limite) {
      toast.error('Digite o limite do cartão');
      return;
    }

    try {
      const url = contaEdit 
        ? `https://finance-backend-production-8578.up.railway.app/api/contas/${contaEdit.id}`
        : 'https://finance-backend-production-8578.up.railway.app/api/contas';
      
      const method = contaEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          usuario_id: usuario.id,
          limite: parseFloat(form.limite) || 0,
          saldo_atual: parseFloat(form.saldo_atual) || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(contaEdit ? 'Conta atualizada!' : 'Conta criada!');
        onSave(data);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar conta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {contaEdit ? 'Editar Conta' : 'Nova Conta/Cartão'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Nome */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Nome</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({...form, nome: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            placeholder="Ex: Nubank, Bradesco, Dinheiro..."
          />
        </div>

        {/* Tipo */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => setForm({...form, tipo: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
          >
            {TIPOS_CONTA.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Limite (se cartão de crédito) */}
        {form.tipo === 'cartao_credito' && (
          <div className="mb-4">
            <label className="block text-sm mb-2">Limite</label>
            <input
              type="number"
              value={form.limite}
              onChange={(e) => setForm({...form, limite: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              placeholder="5000.00"
              step="0.01"
            />
          </div>
        )}

        {/* Saldo Inicial */}
        {form.tipo !== 'cartao_credito' && (
          <div className="mb-4">
            <label className="block text-sm mb-2">Saldo Inicial</label>
            <input
              type="number"
              value={form.saldo_atual}
              onChange={(e) => setForm({...form, saldo_atual: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              placeholder="1000.00"
              step="0.01"
            />
          </div>
        )}

        {/* Cor */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Cor</label>
          <div className="grid grid-cols-7 gap-2">
            {CORES_DISPONIVEIS.map(cor => (
              <button
                key={cor}
                onClick={() => setForm({...form, cor})}
                className={`w-10 h-10 rounded ${
                  form.cor === cor ? 'ring-2 ring-white' : ''
                }`}
                style={{ backgroundColor: cor }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-700 p-4 rounded mb-4">
          <p className="text-sm text-gray-400 mb-2">Preview:</p>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: form.cor }}
            >
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <div className="font-bold">{form.nome || 'Minha Conta'}</div>
              <div className="text-sm text-gray-400">
                {TIPOS_CONTA.find(t => t.value === form.tipo)?.label}
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
          >
            Salvar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConta;