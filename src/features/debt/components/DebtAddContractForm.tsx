import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { TODAY, DISC_LIMIT } from '../../../data/constants';
import { Contract, ContractKind } from '../../../types';

interface DebtAddContractFormProps {
  kind: ContractKind;
  onAddContract: (data: Omit<Contract, 'id'>) => void;
}

export const DebtAddContractForm: React.FC<DebtAddContractFormProps> = ({
  kind,
  onAddContract,
}) => {
  const [customer, setCustomer] = useState('');
  const [no, setNo] = useState('');
  const [tv, setTv] = useState('');
  const [fee, setFee] = useState<number | ''>('');
  const [disc, setDisc] = useState<number | ''>('');
  const [due, setDue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fee || Number(fee) <= 0 || !customer.trim()) return;

    onAddContract({
      kind,
      customer: customer.trim(),
      no: kind === 'KH' ? no.trim() : '',
      tv: kind === 'TV' ? tv.trim() : '',
      signed: TODAY,
      fee: Number(fee),
      disc: Number(disc) || 0,
      due: due || TODAY,
      terms: '',
      note: ''
    });

    setCustomer('');
    setNo('');
    setTv('');
    setFee('');
    setDisc('');
    setDue('');
  };

  return (
    <section className="card-box" style={{ borderLeft: '4px solid var(--teal)' }}>
      <h2 className="card-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} style={{ color: 'var(--teal)' }} />
          <span>Thêm hợp đồng {kind === 'KH' ? 'khách hàng' : 'tư vấn'} mới</span>
        </div>
        <small>chiết khấu trên {DISC_LIMIT * 100}% cần chị Giàu duyệt</small>
      </h2>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>{kind === 'KH' ? 'Tên khách hàng' : 'Tên khách / tư vấn'}</label>
          <input
            type="text"
            required
            placeholder="vd Nguyễn Văn A"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>

        {kind === 'KH' ? (
          <div className="form-group">
            <label>Số hợp đồng bảo hiểm</label>
            <input
              type="text"
              placeholder="vd 8288152"
              value={no}
              onChange={(e) => setNo(e.target.value)}
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Tư vấn phụ trách</label>
            <input
              type="text"
              placeholder="vd Nguyễn Hữu Thạch"
              value={tv}
              onChange={(e) => setTv(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>Phí hợp đồng (đ)</label>
          <input
            type="number"
            min="1000"
            step="1000"
            required
            placeholder="vd 15000000"
            value={fee}
            onChange={(e) => setFee(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Chiết khấu (đ)</label>
          <input
            type="number"
            min="0"
            step="1000"
            placeholder="vd 3000000"
            value={disc}
            onChange={(e) => setDisc(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Hạn thanh toán</label>
          <input
            type="date"
            required
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '6px' }}>
          <button type="submit" className="btn primary">
            Thêm hợp đồng
          </button>
        </div>
      </form>
    </section>
  );
};
