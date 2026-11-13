import React, { useState } from 'react';
import { PlusCircle, FileText, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import { TODAY, DISC_LIMIT } from '../../../data/constants';
import { Contract, ContractKind } from '../../../types';
import { fmt } from '../../../utils/formatters';

interface DebtCreateModalProps {
  show: boolean;
  defaultKind?: ContractKind;
  onClose: () => void;
  onAddContract: (data: Omit<Contract, 'id'>) => void;
}

export const DebtCreateModal: React.FC<DebtCreateModalProps> = ({
  show,
  defaultKind = 'KH',
  onClose,
  onAddContract,
}) => {
  const [debtType, setDebtType] = useState<'thu' | 'chi'>(defaultKind === 'TV' ? 'chi' : 'thu');
  const [customer, setCustomer] = useState('');
  const [no, setNo] = useState('');
  const [tv, setTv] = useState('');
  const [fee, setFee] = useState<number | ''>('');
  const [disc, setDisc] = useState<number | ''>('');
  const [due, setDue] = useState(TODAY);
  const [note, setNote] = useState('');

  if (!show) return null;

  const isThu = debtType === 'thu';
  const numFee = Number(fee) || 0;
  const numDisc = Number(disc) || 0;
  const netDue = Math.max(0, numFee - numDisc);
  const discRate = numFee > 0 ? numDisc / numFee : 0;
  const needApproval = isThu && discRate > DISC_LIMIT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fee || Number(fee) <= 0 || !customer.trim()) return;

    onAddContract({
      kind: isThu ? 'KH' : 'TV',
      flow: isThu ? 'in' : 'out',
      customer: customer.trim(),
      no: no.trim(),
      tv: tv.trim(),
      signed: TODAY,
      fee: Number(fee),
      disc: Number(disc) || 0,
      due: due || TODAY,
      terms: isThu ? 'Thu nợ hợp đồng' : 'Tạm ứng / Phải chi',
      note: note.trim()
    });

    setCustomer('');
    setNo('');
    setTv('');
    setFee('');
    setDisc('');
    setDue(TODAY);
    setNote('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card-box"
        style={{
          width: '560px',
          maxWidth: '92vw',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${isThu ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 88, 12, 0.3)'}`,
          borderTop: `4px solid ${isThu ? 'var(--good)' : '#ea580c'}`
        }}
      >
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--ink)' }}>
            <PlusCircle size={18} style={{ color: isThu ? 'var(--good)' : '#ea580c' }} />
            <span>Tạo Công Nợ Mới ({isThu ? 'Công nợ Thu' : 'Công nợ Chi'})</span>
          </h3>
          <button type="button" className="btn btn-ghost xs" onClick={onClose} style={{ color: 'var(--muted)' }}>
            Đóng
          </button>
        </div>

        {/* Chuyển đổi Segmented: Thu vs Chi */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>
            Chọn luồng công nợ:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--soft)', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setDebtType('thu')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: isThu ? 'var(--good)' : 'transparent',
                color: isThu ? '#fff' : 'var(--muted)'
              }}
            >
              <ArrowDownLeft size={16} />
              <span>Tạo THU (Phải thu tiền về)</span>
            </button>
            <button
              type="button"
              onClick={() => setDebtType('chi')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: !isThu ? '#ea580c' : 'transparent',
                color: !isThu ? '#fff' : 'var(--muted)'
              }}
            >
              <ArrowUpRight size={16} />
              <span>Tạo CHI (Phải chi / Tạm ứng)</span>
            </button>
          </div>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
                {isThu ? 'Tên khách hàng / Đối tác (*)' : 'Tên người nhận / Tư vấn viên (*)'}
              </label>
              <input
                type="text"
                required
                placeholder={isThu ? 'VD: Phạm Văn Phúc' : 'VD: Lê Thành Công'}
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  background: 'var(--panel)',
                  color: 'var(--ink)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
                {isThu ? 'Số hợp đồng bảo hiểm' : 'Hạng mục / Căn cứ tạm ứng'}
              </label>
              <input
                type="text"
                placeholder={isThu ? 'VD: 8288152' : 'VD: Tạm ứng hoa hồng / công tác'}
                value={no}
                onChange={(e) => setNo(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  background: 'var(--panel)',
                  color: 'var(--ink)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
                {isThu ? 'Tư vấn phụ trách' : 'Người lập / Phê duyệt'}
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Hữu Thạch"
                value={tv}
                onChange={(e) => setTv(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  background: 'var(--panel)',
                  color: 'var(--ink)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
                Hạn thanh toán / Hoàn ứng (*)
              </label>
              <input
                type="date"
                required
                value={due}
                onChange={(e) => setDue(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  background: 'var(--panel)',
                  color: 'var(--ink)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
                {isThu ? 'Phí hợp đồng / Số tiền (đ) (*)' : 'Số tiền tạm ứng / Phải chi (đ) (*)'}
              </label>
              <input
                type="number"
                min="1000"
                step="100000"
                required
                placeholder="VD: 15000000"
                value={fee}
                onChange={(e) => setFee(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  background: 'var(--panel)',
                  color: isThu ? 'var(--good)' : '#ea580c',
                  fontWeight: 700,
                  fontFamily: 'var(--f-num)',
                  fontSize: '13.5px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
                {isThu ? 'Chiết khấu / Giảm trừ (đ)' : 'Khoản giảm trừ (nếu có)'}
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                placeholder="VD: 0"
                value={disc}
                onChange={(e) => setDisc(e.target.value === '' ? '' : Number(e.target.value))}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  background: 'var(--panel)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--f-num)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Card tóm tắt số tiền */}
          {numFee > 0 && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: isThu ? 'rgba(16, 185, 129, 0.08)' : 'rgba(234, 88, 12, 0.08)',
                border: `1px solid ${isThu ? 'rgba(16, 185, 129, 0.25)' : 'rgba(234, 88, 12, 0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isThu ? 'var(--good)' : '#ea580c' }}>
                <FileText size={15} />
                <span>
                  <b>{isThu ? 'Thực tế phải thu:' : 'Thực tế phải chi:'}</b>
                </span>
              </div>
              <div style={{ fontFamily: 'var(--f-num)', fontWeight: 800, fontSize: '14px', color: isThu ? 'var(--good)' : '#ea580c' }}>
                {fmt(netDue)} đ
                {needApproval && (
                  <span style={{ fontSize: '11px', color: 'var(--bad)', marginLeft: '8px', fontWeight: 600 }}>
                    (Chiết khấu {(discRate * 100).toFixed(0)}% cần chị Giàu duyệt)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
              Ghi chú / Điều khoản:
            </label>
            <input
              type="text"
              placeholder="VD: Trả nhiều phần hàng tháng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                background: 'var(--panel)',
                color: 'var(--ink)',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
            <button type="button" className="btn xs" onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className="btn xs primary"
              style={{
                backgroundColor: isThu ? 'var(--good)' : '#ea580c',
                borderColor: isThu ? 'var(--good)' : '#ea580c',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                fontWeight: 600
              }}
              disabled={!fee || Number(fee) <= 0 || !customer.trim()}
            >
              <Check size={13} />
              <span>{isThu ? 'Tạo công nợ Thu' : 'Tạo công nợ Chi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
