import React from 'react';
import { useApp } from './../../../context/useApp';
import { TODAY, OLD } from '../../../data/constants';
import { fm, fmt } from '../../../utils/formatters';
import { calculateBalance, opexBy } from '../../../services/financeService';
import { calculateDebt } from '../../../services/debtService';
import { X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface LegacyAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegacyAuditModal: React.FC<LegacyAuditModalProps> = ({ isOpen, onClose }) => {
  const { state } = useApp();

  if (!isOpen) return null;

  const khDebts = state.contracts.filter((c) => c.kind === 'KH').map((c) => calculateDebt(c, state.tx, TODAY));
  const overKH = khDebts.reduce((sum, d) => sum + (d.over > 0 ? d.left : 0), 0);
  const recvKH = khDebts.reduce((sum, d) => sum + d.due, 0);

  const wage10 = opexBy(state.tx, '2026-10').LUONG || 0;
  const other8 = opexBy(state.tx, '2026-08').KHAC || 0;
  const fundEndOct = calculateBalance(state.tx, 'QUY', '2026-10-31');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={20} color="#0d9488" />
            <div>
              <h3 className="modal-title">Đối Chiếu Dữ Liệu: File Cũ vs Sổ Gốc</h3>
              <p className="modal-sub">Dữ liệu gốc từ 8 file khách gửi ngày 16/10/2026 chuẩn hóa theo ACID</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="vs-grid-modern">
            <div className="vs-cell-mod vs-head">Chỉ tiêu tài chính</div>
            <div className="vs-cell-mod vs-head">File Excel Cũ</div>
            <div className="vs-cell-mod vs-head">Sổ Gốc Chuẩn ACID</div>

            <div className="vs-cell-mod">Phải thu khách (sau chiết khấu)</div>
            <div className="vs-cell-mod vs-old-val">{fmt(OLD.receivableKH)}</div>
            <div className="vs-cell-mod vs-new-val">{fmt(recvKH)}</div>

            <div className="vs-cell-mod">Nợ khách quá hạn</div>
            <div className="vs-cell-mod vs-old-val">{fmt(OLD.overdueKH)}</div>
            <div className="vs-cell-mod vs-new-val text-bad">{fmt(overKH)}</div>

            <div className="vs-cell-mod">Chi lương, thưởng tháng 10</div>
            <div className="vs-cell-mod vs-old-val">{fmt(OLD.wageOct)}</div>
            <div className="vs-cell-mod vs-new-val">{fmt(wage10)}</div>

            <div className="vs-cell-mod">"Chi phí khác" tháng 8</div>
            <div className="vs-cell-mod vs-old-val">{fmt(OLD.otherAug)}</div>
            <div className="vs-cell-mod vs-new-val">{fmt(other8)}</div>

            <div className="vs-cell-mod">Tồn sổ quỹ cuối tháng 10</div>
            <div className="vs-cell-mod vs-old-val">{fm(OLD.fundOct)}</div>
            <div className="vs-cell-mod vs-new-val text-bad">{fm(fundEndOct)}</div>
          </div>

          <div className="audit-notes-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--ink)' }}>
              <CheckCircle2 size={15} color="#10b981" />
              <span>Nguyên nhân sai lệch trong file Excel cũ:</span>
            </div>
            <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: '12.5px', lineHeight: 1.5, color: 'var(--muted)' }}>
              <li>Tổng công nợ bỏ sót 2 dòng khách hàng chưa tính vào file tổng.</li>
              <li>Tổng hợp chi phí tháng 10 bị trỏ sai dòng công thức Excel.</li>
              <li>Tháng 8 tính nhầm hoàn ứng 33,55 triệu đồng và phí hợp đồng khách vào chi phí vận hành.</li>
              <li>Tháng 10 không mang số dư lũy kế từ tháng 9 sang làm sai lệch tồn quỹ thực tế.</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

