import React from 'react';
import { X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const ICONES_DISPONIVEIS = [
  'Home', 'Car', 'ShoppingCart', 'Coffee', 'Book', 
  'Gamepad2', 'Pizza', 'Film', 'Tag'
];

const CORES_DISPONIVEIS = [
  '#EF4444', '#F97316', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#6B7280',
];

const ModalCategoria = ({ 
  isOpen, 
  onClose, 
  onSave, 
  categoriaEdit,
  usuario 
}) => {
  const [form, setForm] = React.useState({
    nome: '',
    icone: 'Tag',
    cor: '#6B7280',
    tipo: 'variavel',
  });

  React.useEffect(() => {
    if (categoriaEdit) {
      setForm(categoriaEdit);
    } else {
      setForm({
        nome: '',
        icone: 'Tag',
        cor: '#6B7280',
        tipo: 'variavel',
      });
    }
  }, [categoriaEdit, isOpen]);

  const handleSave = async () => {
    if (!form.nome) {
      toast.error('Digite o nome da categoria');
      return;
    }

    try {
      const url = categoriaEdit 
        ? `https://finance-backend-production-8578.up.railway.app/api/categorias/${categoriaEdit.id}`
        : 'https://finance-backend-production-8578.up.railway.app/api/categorias';
      
      const method = categoriaEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          usuario_id: usuario.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(categoriaEdit ? 'Categoria atualizada!' : 'Categoria criada!');
        onSave(data);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar categoria');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {categoriaEdit ? 'Editar Categoria' : 'Nova Categoria'}
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
            placeholder="Ex: Games, Pet, Academia..."
          />
        </div>

        {/* Tipo */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {['fixo', 'variavel', 'receita'].map(tipo => (
              <button
                key={tipo}
                onClick={() => setForm({...form, tipo})}
                className={`py-2 rounded ${
                  form.tipo === tipo
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {tipo === 'fixo' ? 'Fixo' : tipo === 'variavel' ? 'Variável' : 'Receita'}
              </button>
            ))}
          </div>
        </div>

        {/* Ícone */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Ícone</label>
          <div className="grid grid-cols-5 gap-2">
            {ICONES_DISPONIVEIS.map(icone => (
              <button
                key={icone}
                onClick={() => setForm({...form, icone})}
                className={`p-3 rounded flex items-center justify-center ${
                  form.icone === icone
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Tag size={24} />
              </button>
            ))}
          </div>
        </div>

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
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded flex items-center justify-center"
              style={{ backgroundColor: form.cor }}
            >
              <Tag size={20} className="text-white" />
            </div>
            <span className="font-medium">{form.nome || 'Minha Categoria'}</span>
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

export default ModalCategoria;