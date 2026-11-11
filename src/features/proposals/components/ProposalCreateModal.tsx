import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { TODAY } from '../../../data/constants';
import { Role } from '../../../types';

interface ProposalCreateModalProps {
  show: boolean;
  uiRole: Role;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    creator: string;
    creatorEmail: string;
    department: string;
    amount: number;
    date: string;
    description: string;
    ccEmails: string[];
  }) => void;
}

export const ProposalCreateModal: React.FC<ProposalCreateModalProps> = ({
  show,
  uiRole,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState(uiRole === 'operator' ? 'Nguyễn Thị Thảo' : 'Phòng Kinh Doanh');
  const [creatorEmail, setCreatorEmail] = useState('thao.nguyen@vpmfinance.vn');
  const [department, setDepartment] = useState('Kinh doanh & Phát triển Khách hàng');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    onSubmit({
      title: title.trim(),
      creator: creator.trim(),
      creatorEmail: creatorEmail.trim(),
      department: department.trim(),
      amount: Number(amount),
      date: TODAY,
      description: description.trim(),
      ccEmails: [creatorEmail.trim(), 'ketoan@vpmfinance.vn']
    });

    setTitle('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card-box" style={{ width: '560px', maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} style={{ color: 'var(--teal)' }} />
            <span>Lập Hồ Sơ Kế Hoạch & Đệ Trình Phê Duyệt</span>
          </h3>
          <button type="button" className="btn xs" onClick={onClose}>
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group wide">
            <label>Tiêu đề kế hoạch / sự kiện</label>
            <input
              type="text"
              required
              placeholder="vd Tổ chức Hội thảo Khách hàng VIP Quý 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Người lập hồ sơ</label>
            <input
              type="text"
              required
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email cá nhân (Tự động CC)</label>
            <input
              type="email"
              required
              value={creatorEmail}
              onChange={(e) => setCreatorEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Phòng ban / Bộ phận</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="Kinh doanh & Phát triển Khách hàng">Kinh doanh & Phát triển Khách hàng</option>
              <option value="Văn phòng & Vận hành">Văn phòng & Vận hành</option>
              <option value="Chăm sóc Khách hàng (CSKH)">Chăm sóc Khách hàng (CSKH)</option>
              <option value="Đào tạo & Phát triển Đội ngũ">Đào tạo & Phát triển Đội ngũ</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số tiền dự toán (đ)</label>
            <input
              type="number"
              min="100000"
              step="100000"
              required
              placeholder="vd 15000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div className="form-group wide">
            <label>Nội dung chi tiết & diễn giải dự toán</label>
            <textarea
              rows={3}
              required
              placeholder="Mô tả mục tiêu, dự toán chi phí chi tiết, địa điểm, các hạng mục cần cấp ngân sách..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn primary">
              <Send size={14} style={{ marginRight: '4px' }} />
              Gửi đệ trình qua Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
