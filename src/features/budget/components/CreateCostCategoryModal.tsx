import React, { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { monthLabel } from '../../../utils/formatters';

interface CreateCostCategoryModalProps {
  show: boolean;
  month: string;
  existingCodes: string[];
  onClose: () => void;
  onSubmit: (code: string, name: string, amount: number) => void;
}

export const CreateCostCategoryModal: React.FC<CreateCostCategoryModalProps> = ({
  show, month, existingCodes, onClose, onSubmit
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setCode('');
      setName('');
      setAmount('');
      setError('');
    }
  }, [show]);

  if (!show) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode || !name.trim() || amount === '' || Number(amount) <= 0) return;
    if (existingCodes.includes(normalizedCode)) {
      setError(`Mã ${normalizedCode} đã tồn tại trong danh mục cost.`);
      return;
    }
    onSubmit(normalizedCode, name.trim(), Number(amount));
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <form className="card-box" onSubmit={submit} style={{ width: '500px', maxWidth: '92vw' }}>
        <h3><PlusCircle size={18} /> Thêm Danh Mục Cost {monthLabel(month)}</h3>
        <label>Mã danh mục<input required maxLength={30} placeholder="VD: MARKETING" value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setError(''); }} /></label>
        <label>Tên danh mục<input required maxLength={120} placeholder="VD: Marketing và truyền thông" value={name} onChange={(event) => { setName(event.target.value); setError(''); }} /></label>
        <label>Số tiền định mức<input type="number" min="1" step="1000" required placeholder="VD: 15000000" value={amount} onChange={(event) => { setAmount(event.target.value === '' ? '' : Number(event.target.value)); setError(''); }} /></label>
        {error && <div>{error}</div>}
        <button type="button" onClick={onClose}>Hủy</button>
        <button type="submit" disabled={!code.trim() || !name.trim() || amount === '' || Number(amount) <= 0}>Thêm cost</button>
      </form>
    </div>
  );
};
