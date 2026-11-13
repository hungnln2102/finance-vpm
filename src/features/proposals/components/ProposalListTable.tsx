import React, { useState } from 'react';
import { Proposal, Role, Transaction } from '../../../types';
import { fmt, dmy } from '../../../utils/formatters';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Mail, 
  Building,
  ChevronDown,
  ChevronUp,
  Receipt
} from 'lucide-react';

interface ProposalListTableProps {
  proposals: Proposal[];
  txList: Transaction[];
  uiRole: Role;
  canReview: boolean;
  onOpenCreateModal: () => void;
  onReview: (id: string, status: 'pending_master' | 'approved' | 'rejected', comment?: string) => void;
  onAddThread?: (proposalId: string, content: string, isInbound?: boolean) => void;
}

interface MatchedReceiptRow {
  receiptId: string;
  receiptCode: string;
  txId: string;
  date: string;
  acc: string;
  vendor: string;
  note: string;
  amount: number;
  txStatus: string;
}

export const ProposalListTable: React.FC<ProposalListTableProps> = ({
  proposals,
  txList,
  uiRole,
  canReview,
  onOpenCreateModal,
  onReview
}) => {
  // State lưu id của dòng kế hoạch đang mở dropdown xem các biên lai đã khớp
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  // Tìm tất cả các giao dịch chi thực tế trong sổ thuộc kế hoạch này (1 Kế hoạch - Nhiều Giao dịch)
  const getMatchedTransactions = (p: Proposal): Transaction[] => {
    return txList.filter(
      (t) =>
        t.dir === 'out' &&
        (t.proposalId === p.id || (p.code && (t.desc?.includes(p.code) || t.contract === p.code)))
    );
  };

  // Trích xuất toàn bộ danh sách biên lai được match với kế hoạch này
  const getMatchedReceipts = (p: Proposal): MatchedReceiptRow[] => {
    const matchedTx = getMatchedTransactions(p);
    const list: MatchedReceiptRow[] = [];

    for (const t of matchedTx) {
      if (t.receipts && t.receipts.length > 0) {
        for (const r of t.receipts) {
          list.push({
            receiptId: r.id || `REC-${t.id}`,
            receiptCode: r.code || t.doc || `BL-${t.id}`,
            txId: t.id,
            date: r.date || t.date,
            acc: t.acc,
            vendor: r.vendor || (t.acc === 'ACB' ? 'Ngân hàng ACB (Ủy nhiệm chi)' : 'Sổ quỹ VPM'),
            note: r.note || t.desc,
            amount: r.amount || t.amt,
            txStatus: t.status
          });
        }
      } else {
        list.push({
          receiptId: `REC-${t.id}`,
          receiptCode: t.doc || `BL-${t.id}`,
          txId: t.id,
          date: t.date,
          acc: t.acc,
          vendor: t.acc === 'ACB' ? 'Ngân hàng ACB (Ủy nhiệm chi)' : 'Sổ quỹ VPM',
          note: t.desc,
          amount: t.amt,
          txStatus: t.status
        });
      }
    }

    return list;
  };

  // Tính số tiền đã chi thực tế theo kế hoạch
  const calculateSpentAmount = (p: Proposal): number => {
    const matched = getMatchedTransactions(p);
    return matched.reduce((sum, t) => sum + (Number(t.amt) || 0), 0);
  };

  return (
    <section className="card-box" style={{ width: '100%', overflow: 'hidden' }}>
      {/* Header Bảng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FileText size={18} style={{ color: 'var(--teal)' }} />
            <span>Danh Sách Kế Hoạch & Đệ Trình Hợp Nhất</span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
            Quản lý tập trung hồ sơ đề xuất, dự toán và đối soát danh sách các biên lai được match với từng kế hoạch.
          </p>
        </div>

        <button
          type="button"
          className="btn primary sm"
          onClick={onOpenCreateModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={15} />
          <span>Lập kế hoạch mới</span>
        </button>
      </div>

      {/* Main Table: 7 Cột + Dropdown Danh Sách Biên Lai Đã Match */}
      <div className="table-scroll">
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
              <th style={{ width: '140px' }}>Mã kế hoạch</th>
              <th style={{ width: '240px' }}>Tiêu đề kế hoạch</th>
              <th>Nội dung kế hoạch</th>
              <th className="num" style={{ width: '130px' }}>Dự toán</th>
              <th className="num" style={{ width: '130px' }}>Đã chi</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Trạng thái</th>
              <th style={{ width: '170px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p) => {
              const isExpanded = expandedRowId === p.id;
              const matchedReceipts = getMatchedReceipts(p);
              const spent = calculateSpentAmount(p);
              const remainBudget = Math.max(0, p.amount - spent);
              const percent = p.amount > 0 ? Math.min(100, Math.round((spent / p.amount) * 100)) : 0;

              return (
                <React.Fragment key={p.id}>
                  {/* Dòng Chính Kế Hoạch */}
                  <tr
                    onClick={() => toggleExpand(p.id)}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid var(--line)',
                      backgroundColor: isExpanded ? 'rgba(20, 184, 166, 0.05)' : undefined,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Cột 1: Mã & Nút Toggle Dropdown */}
                    <td style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(p.id);
                          }}
                          className="btn btn-ghost btn-xs"
                          style={{ padding: '2px 4px', color: isExpanded ? 'var(--teal)' : 'var(--muted)' }}
                          title={isExpanded ? 'Thu gọn danh sách biên lai' : 'Bấm để xem các biên lai đã khớp'}
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <span style={{ fontFamily: 'var(--f-num)', fontWeight: 700, color: 'var(--teal)' }}>
                          {p.code}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', paddingLeft: '24px' }}>
                        {dmy(p.date)}
                      </div>
                    </td>

                    {/* Cột 2: Tiêu đề */}
                    <td style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px' }}>
                      <div style={{ fontWeight: 600, color: isExpanded ? 'var(--teal)' : 'var(--ink)', fontSize: '13.5px' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                        <Building size={12} />
                        <span>{p.department} · {p.creator}</span>
                      </div>
                    </td>

                    {/* Cột 3: Nội dung */}
                    <td style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px', color: 'var(--muted-dark)', lineHeight: 1.45 }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: isExpanded ? 5 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description || 'Chưa có nội dung mô tả chi tiết.'}
                      </div>
                      {p.creatorEmail && (
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={11} /> CC: {p.creatorEmail}
                        </div>
                      )}
                    </td>

                    {/* Cột 4: Dự toán */}
                    <td className="num" style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px', fontFamily: 'var(--f-num)', fontWeight: 700, color: 'var(--ochre)', fontSize: '13.5px' }}>
                      {fmt(p.amount)} đ
                    </td>

                    {/* Cột 5: Đã chi */}
                    <td className="num" style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px', fontFamily: 'var(--f-num)', fontWeight: 700, color: spent > 0 ? 'var(--good)' : 'var(--muted)', fontSize: '13.5px' }}>
                      {fmt(spent)} đ
                    </td>

                    {/* Cột 6: Trạng thái */}
                    <td style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px', textAlign: 'center' }}>
                      <ProposalStatusBadge status={p.status} />
                    </td>

                    {/* Cột 7: Thao tác & Nút Xem Biên Lai */}
                    <td style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        {/* Thao tác Phê duyệt nhanh cho Admin */}
                        {(uiRole === 'admin' || uiRole === 'vpm') && canReview && p.status === 'pending_admin' && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn xs primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReview(p.id, 'pending_master', 'Admin sơ duyệt và chuyển Master.');
                              }}
                              style={{ padding: '2px 6px', fontSize: '10.5px' }}
                              title="Sơ duyệt kế hoạch"
                            >
                              <CheckCircle2 size={11} />
                              <span>Sơ duyệt</span>
                            </button>
                            <button
                              type="button"
                              className="btn xs danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReview(p.id, 'rejected', 'Admin từ chối.');
                              }}
                              style={{ padding: '2px 6px', fontSize: '10.5px' }}
                              title="Từ chối kế hoạch"
                            >
                              <XCircle size={11} />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        )}

                        {/* Thao tác Phê duyệt cho Master */}
                        {(uiRole === 'master' || uiRole === 'giau') && p.status === 'pending_master' && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReview(p.id, 'approved', '👑 Master phê duyệt kế hoạch.');
                              }}
                              style={{
                                padding: '2px 8px',
                                fontSize: '10.5px',
                                backgroundColor: 'var(--good)',
                                color: '#fff',
                                borderColor: 'var(--good)'
                              }}
                              title="Master chính thức phê duyệt"
                            >
                              <ShieldCheck size={11} />
                              <span>Phê duyệt</span>
                            </button>
                            <button
                              type="button"
                              className="btn xs danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReview(p.id, 'rejected', 'Master từ chối.');
                              }}
                              style={{ padding: '2px 6px', fontSize: '10.5px' }}
                              title="Master từ chối"
                            >
                              <XCircle size={11} />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Dòng Mở Rộng Dropdown: Chỉ Hiển Thị Danh Sách Các Biên Lai Được Match Với Kế Hoạch Này */}
                  {isExpanded && (
                    <tr style={{ backgroundColor: 'rgba(20, 184, 166, 0.02)', borderBottom: '1px solid var(--line)' }}>
                      <td colSpan={7} style={{ padding: '0 0 16px 0' }}>
                        <div
                          style={{
                            margin: '8px 14px 4px 20px',
                            padding: '16px 20px',
                            backgroundColor: 'var(--panel-2)',
                            borderRadius: '8px',
                            borderLeft: '4px solid var(--teal)',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          {/* Header Dropdown: Tên kế hoạch & Thanh Thống Kê Tiến Độ Giải Ngân */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Receipt size={16} style={{ color: 'var(--teal)' }} />
                              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                                Các Biên Lai Đã Khớp Với Kế Hoạch [{p.code}]
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--teal)', backgroundColor: 'var(--teal-soft)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                {matchedReceipts.length} biên lai
                              </span>
                            </div>

                            {/* Chỉ số Tóm tắt Ngân Sách */}
                            <div style={{ display: 'flex', gap: '18px', fontSize: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <div>
                                <span style={{ color: 'var(--muted)' }}>Dự toán: </span>
                                <b style={{ color: 'var(--ochre)', fontFamily: 'var(--f-num)' }}>{fmt(p.amount)} đ</b>
                              </div>
                              <div>
                                <span style={{ color: 'var(--muted)' }}>Đã giải ngân: </span>
                                <b style={{ color: spent > 0 ? 'var(--good)' : 'var(--muted)', fontFamily: 'var(--f-num)' }}>
                                  {fmt(spent)} đ ({percent}%)
                                </b>
                              </div>
                              <div>
                                <span style={{ color: 'var(--muted)' }}>Còn lại: </span>
                                <b style={{ color: 'var(--teal)', fontFamily: 'var(--f-num)' }}>{fmt(remainBudget)} đ</b>
                              </div>
                            </div>
                          </div>

                          {/* Bảng Danh Sách Biên Lai Đã Match */}
                          <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid var(--line)' }}>
                            <table style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'collapse', backgroundColor: 'var(--bg)' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'rgba(20, 184, 166, 0.08)', borderBottom: '1px solid var(--line)' }}>
                                  <th style={{ width: '45px', textAlign: 'center', padding: '8px 6px' }}>STT</th>
                                  <th style={{ width: '150px', padding: '8px 10px' }}>Mã biên lai</th>
                                  <th style={{ width: '100px', padding: '8px 10px' }}>Ngày chi</th>
                                  <th style={{ width: '90px', padding: '8px 10px' }}>Tài khoản</th>
                                  <th style={{ width: '90px', padding: '8px 10px' }}>Log Sổ cái</th>
                                  <th style={{ width: '200px', padding: '8px 10px' }}>Đơn vị thụ hưởng / NCC</th>
                                  <th style={{ padding: '8px 10px' }}>Nội dung chi phí</th>
                                  <th className="num" style={{ width: '130px', padding: '8px 10px' }}>Số tiền</th>
                                  <th style={{ width: '100px', textAlign: 'center', padding: '8px 10px' }}>Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody>
                                {matchedReceipts.map((rec, idx) => (
                                  <tr key={`${rec.receiptId}-${idx}`} style={{ borderBottom: '1px solid var(--line)' }}>
                                    <td style={{ textAlign: 'center', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>
                                      {idx + 1}
                                    </td>
                                    <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--teal)', fontFamily: 'var(--f-num)' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FileText size={12} />
                                        <span>{rec.receiptCode}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding: '8px 10px', fontFamily: 'var(--f-num)', whiteSpace: 'nowrap' }}>
                                      {dmy(rec.date)}
                                    </td>
                                    <td style={{ padding: '8px 10px' }}>
                                      <span className="chip">{rec.acc}</span>
                                    </td>
                                    <td style={{ padding: '8px 10px', fontFamily: 'var(--f-num)', color: 'var(--muted)', fontSize: '11.5px' }}>
                                      {rec.txId}
                                    </td>
                                    <td style={{ padding: '8px 10px', color: 'var(--ink)' }}>
                                      {rec.vendor}
                                    </td>
                                    <td style={{ padding: '8px 10px', color: 'var(--ink)', lineHeight: 1.4 }}>
                                      {rec.note}
                                    </td>
                                    <td className="num" style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--bad)', fontFamily: 'var(--f-num)' }}>
                                      {fmt(rec.amount)} đ
                                    </td>
                                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          padding: '2px 7px',
                                          borderRadius: '4px',
                                          backgroundColor: rec.txStatus === 'posted' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                          color: rec.txStatus === 'posted' ? 'var(--good)' : 'var(--ochre)',
                                          fontWeight: 600
                                        }}
                                      >
                                        {rec.txStatus === 'posted' ? 'Đã chốt sổ' : 'Chờ xử lý'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}

                                {matchedReceipts.length === 0 && (
                                  <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                                      Chưa có biên lai nào được match với kế hoạch này. Hãy vào <b>Sổ giao dịch gốc &gt; Chưa liệt kê</b> để chọn khớp biên lai vào kế hoạch này.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {proposals.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                  Chưa có kế hoạch hoặc hồ sơ đệ trình nào được lập
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
