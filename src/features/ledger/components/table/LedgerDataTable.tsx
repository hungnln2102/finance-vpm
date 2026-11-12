import React, { useState } from 'react';
import { Transaction, TransactionReceipt, Proposal } from '../../../../types';
import { TYPES, CATS } from '../../../../data/constants';
import { fmt, dmy } from '../../../../utils/formatters';
import { txIssues } from '../../../../services/financeService';
import { 
  AlertCircle, 
  FileText, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Receipt, 
  ExternalLink, 
  Target, 
  Zap, 
  Check 
} from 'lucide-react';

interface LedgerDataTableProps {
  rows: Transaction[];
  editTxId: string | null;
  canEdit: boolean;
  locked: boolean;
  proposals?: Proposal[];
  isUnlistedTab?: boolean;
  onEditTx: (id: string) => void;
  onUpdateTx?: (id: string, updates: Partial<Transaction>) => void;
}

export const LedgerDataTable: React.FC<LedgerDataTableProps> = ({
  rows,
  editTxId,
  canEdit,
  locked,
  proposals = [],
  isUnlistedTab = false,
  onEditTx,
  onUpdateTx
}) => {
  // State lưu id của dòng đang mở dropdown xem biên lai
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // State lưu id của dòng đang mở panel chọn phân loại nhanh (Match Kế hoạch hoặc Chi phí khác)
  const [matchingTxId, setMatchingTxId] = useState<string | null>(null);
  const [matchMode, setMatchMode] = useState<'proposal' | 'opex' | 'contract'>('proposal');
  const [selectedProposalId, setSelectedProposalId] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [contractInput, setContractInput] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedTxId((prev) => (prev === id ? null : id));
  };

  const handleConfirmMatch = (t: Transaction) => {
    if (!onUpdateTx) return;

    const nextFlags = (t.flags || []).filter((f) => f !== 'unlisted');

    if (t.dir === 'out') {
      if (matchMode === 'proposal') {
        const p = proposals.find((item) => item.id === selectedProposalId);
        onUpdateTx(t.id, {
          proposalId: selectedProposalId,
          cat: selectedCat || t.cat || '',
          type: 'OPEX',
          status: 'posted',
          flags: nextFlags,
          desc: t.desc || (p ? `Chi giải ngân kế hoạch ${p.code || p.id}` : t.desc)
        });
      } else {
        onUpdateTx(t.id, {
          cat: selectedCat,
          type: 'OPEX',
          status: 'posted',
          flags: nextFlags
        });
      }
    } else {
      onUpdateTx(t.id, {
        contract: contractInput.trim(),
        type: contractInput.trim() ? 'THU_KH' : 'THU_KHAC',
        status: 'posted',
        flags: nextFlags
      });
    }

    setMatchingTxId(null);
  };

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th style={{ width: '110px' }}>Ngày</th>
            <th style={{ width: '80px' }}>Tài khoản</th>
            <th>Diễn giải & Chứng từ</th>
            <th style={{ width: '180px' }}>Phân loại</th>
            <th className="num" style={{ width: '130px' }}>Thu</th>
            <th className="num" style={{ width: '130px' }}>Chi</th>
            <th style={{ textAlign: 'right', width: '90px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const issues = txIssues(t);
            const paidAmt = t.paidAmt ?? t.amt;
            const totalAmt = t.totalAmt ?? t.amt;
            const amountDisplay = `${fmt(paidAmt)}/${fmt(totalAmt)}`;
            const isExpanded = expandedTxId === t.id;

            // Tìm kế hoạch tương ứng nếu có
            const matchedProposal = proposals.find(
              (p) => (t.proposalId && p.id === t.proposalId) || (p.code && (t.desc?.includes(p.code) || t.contract === p.code))
            );

            // Chuẩn hóa danh sách biên lai (tận dụng mảng receipts hoặc fallback từ t.doc)
            const receiptList: TransactionReceipt[] = (t.receipts && t.receipts.length > 0)
              ? t.receipts
              : (t.doc ? [
                  {
                    id: `REC-${t.id}`,
                    code: t.doc,
                    amount: paidAmt,
                    date: t.date,
                    vendor: t.acc === 'ACB' ? 'Ngân hàng ACB (Ủy nhiệm chi)' : 'Sổ quỹ VPM (Phiếu chi tiền mặt)',
                    note: t.desc
                  }
                ] : []);

            const hasReceipts = receiptList.length > 0;
            const isUnlisted = (t.flags && t.flags.includes('unlisted')) || (!t.proposalId && !t.cat && !t.contract && t.status !== 'migrated');

            return (
              <React.Fragment key={t.id}>
                {/* Dòng Giao Dịch Chính */}
                <tr 
                  style={{
                    ...(editTxId === t.id ? { background: 'var(--teal-soft)' } : {}),
                    ...(isExpanded ? { backgroundColor: 'rgba(20, 184, 166, 0.05)' } : {}),
                    cursor: hasReceipts ? 'pointer' : undefined
                  }}
                  onClick={() => {
                    if (hasReceipts) toggleExpand(t.id);
                  }}
                >
                  {/* Cột 1: Ngày & Nút Mũi Tên Dropdown */}
                  <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--f-num)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {hasReceipts ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(t.id);
                          }}
                          className="btn btn-ghost btn-xs"
                          style={{
                            padding: '2px 4px',
                            color: isExpanded ? 'var(--teal)' : 'var(--muted)',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title={isExpanded ? 'Thu gọn biên lai' : 'Bấm để mở danh sách biên lai'}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      ) : (
                        <span style={{ width: '18px', display: 'inline-block' }} />
                      )}
                      <span>{dmy(t.date)}</span>
                    </div>
                  </td>

                  {/* Cột 2: Tài khoản */}
                  <td>
                    <span className="chip">{t.acc}</span>
                  </td>

                  {/* Cột 3: Diễn giải & Chứng từ */}
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{t.desc}</div>
                    
                    {issues.map((iss, idx) => (
                      <div key={idx} style={{ color: 'var(--bad)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <AlertCircle size={11} />
                        <span>{iss}</span>
                      </div>
                    ))}

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {/* Thẻ Biên lai có nút toggle */}
                      {hasReceipts && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(t.id);
                          }}
                          style={{
                            fontSize: '11px',
                            color: isExpanded ? '#0f766e' : 'var(--teal)',
                            backgroundColor: isExpanded ? 'rgba(20, 184, 166, 0.16)' : 'rgba(20, 184, 166, 0.08)',
                            border: '1px solid rgba(20, 184, 166, 0.25)',
                            borderRadius: '4px',
                            padding: '2px 7px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                          }}
                          title="Bấm để xem danh sách biên lai"
                        >
                          <FileText size={11} />
                          <span>{t.doc || receiptList[0]?.code}</span>
                          <span style={{ opacity: 0.75 }}>({receiptList.length} biên lai)</span>
                          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      )}

                      {/* Huy hiệu Kế hoạch nếu đã khớp */}
                      {matchedProposal && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#2563eb',
                            backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                          }}
                          title={`Thuộc kế hoạch: ${matchedProposal.title}`}
                        >
                          <Target size={11} />
                          <span>Kế hoạch: {matchedProposal.code}</span>
                        </span>
                      )}

                      {/* Huy hiệu Chưa liệt kê nếu có */}
                      {isUnlisted && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#ea580c',
                            backgroundColor: 'rgba(234, 88, 12, 0.12)',
                            border: '1px solid rgba(234, 88, 12, 0.3)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontWeight: 600
                          }}
                          title="Giao dịch chưa làm rõ nguồn tiền (chưa khớp Kế hoạch hoặc Chi phí khác)"
                        >
                          <AlertCircle size={11} />
                          <span>Chưa liệt kê</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cột 4: Phân loại */}
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{TYPES[t.type]?.l || t.type}</div>
                    {t.cat && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {CATS[t.cat] || t.cat}
                      </div>
                    )}
                    {t.contract && (
                      <div style={{ fontSize: '11px', color: 'var(--teal)' }}>
                        HĐ: {t.contract}
                      </div>
                    )}
                  </td>

                  {/* Cột 5: Thu */}
                  <td className="num" style={{ color: t.dir === 'in' ? 'var(--good)' : undefined, fontWeight: t.dir === 'in' ? 600 : 400 }}>
                    {t.dir === 'in' ? amountDisplay : ''}
                  </td>

                  {/* Cột 6: Chi */}
                  <td className="num" style={{ color: t.dir === 'out' ? 'var(--bad)' : undefined, fontWeight: t.dir === 'out' ? 600 : 400 }}>
                    {t.dir === 'out' ? amountDisplay : ''}
                  </td>

                  {/* Cột 7: Thao tác */}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                      {isUnlisted && !locked && (
                        <button
                          type="button"
                          className="btn xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (matchingTxId === t.id) {
                              setMatchingTxId(null);
                            } else {
                              setMatchingTxId(t.id);
                              setMatchMode('proposal');
                              setSelectedProposalId(t.proposalId || (proposals[0]?.id || ''));
                              setSelectedCat(t.cat || 'VP');
                              setContractInput(t.contract || '');
                            }
                          }}
                          style={{
                            backgroundColor: matchingTxId === t.id ? '#ea580c' : 'rgba(234, 88, 12, 0.1)',
                            borderColor: '#ea580c',
                            color: matchingTxId === t.id ? '#fff' : '#ea580c',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px'
                          }}
                          title="Bấm để chọn Kế hoạch hoặc Chi phí khác cho giao dịch này"
                        >
                          <Zap size={12} />
                          <span>Khớp nguồn</span>
                        </button>
                      )}

                      {canEdit && !locked && (
                        <button
                          type="button"
                          className="btn xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTx(t.id);
                          }}
                          title="Sửa phân loại hoặc thông tin"
                        >
                          <Edit3 size={12} />
                          <span>Sửa</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Dòng Mở Rộng Dropdown: Danh Sách Biên Lai Gắn Với Log Này */}
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
                        {/* Thanh Tiêu Đề Của Bảng Con Biên Lai */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Receipt size={16} style={{ color: 'var(--teal)' }} />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                              Danh Sách Biên Lai & Chứng Từ Gắn Với Giao Dịch [{t.id}]
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--teal)', backgroundColor: 'var(--teal-soft)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                              {receiptList.length} biên lai
                            </span>
                          </div>

                          {matchedProposal && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#2563eb', backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                              <Target size={13} />
                              <span><b>Kế hoạch:</b> [{matchedProposal.code}] {matchedProposal.title}</span>
                              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>(Dự toán: {fmt(matchedProposal.amount)} đ)</span>
                            </div>
                          )}
                        </div>

                        {/* Bảng Con Chi Tiết Biên Lai */}
                        <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid var(--line)' }}>
                          <table style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'collapse', backgroundColor: 'var(--bg)' }}>
                            <thead>
                              <tr style={{ backgroundColor: 'rgba(20, 184, 166, 0.08)', borderBottom: '1px solid var(--line)' }}>
                                <th style={{ width: '45px', textAlign: 'center', padding: '8px 6px' }}>STT</th>
                                <th style={{ width: '160px', padding: '8px 10px' }}>Mã biên lai</th>
                                <th style={{ width: '110px', padding: '8px 10px' }}>Ngày chứng từ</th>
                                <th style={{ width: '220px', padding: '8px 10px' }}>Đơn vị thụ hưởng / NCC</th>
                                <th style={{ padding: '8px 10px' }}>Nội dung chi phí & diễn giải</th>
                                <th className="num" style={{ width: '140px', padding: '8px 10px' }}>Số tiền</th>
                                <th style={{ width: '110px', textAlign: 'center', padding: '8px 10px' }}>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {receiptList.map((rec, rIdx) => (
                                <tr key={rec.id || rIdx} style={{ borderBottom: '1px solid var(--line)' }}>
                                  <td style={{ textAlign: 'center', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>
                                    {rIdx + 1}
                                  </td>
                                  <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--teal)', fontFamily: 'var(--f-num)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <FileText size={12} />
                                      <span>{rec.code}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '8px 10px', fontFamily: 'var(--f-num)', whiteSpace: 'nowrap' }}>
                                    {rec.date ? dmy(rec.date) : dmy(t.date)}
                                  </td>
                                  <td style={{ padding: '8px 10px', color: 'var(--ink)' }}>
                                    {rec.vendor || (t.acc === 'ACB' ? 'Ngân hàng ACB (Ủy nhiệm chi)' : 'Sổ quỹ VPM')}
                                  </td>
                                  <td style={{ padding: '8px 10px', color: 'var(--ink)' }}>
                                    {rec.note || t.desc}
                                  </td>
                                  <td className="num" style={{ padding: '8px 10px', fontWeight: 700, color: t.dir === 'out' ? 'var(--bad)' : 'var(--good)', fontFamily: 'var(--f-num)' }}>
                                    {fmt(rec.amount || paidAmt)} đ
                                  </td>
                                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                    <button
                                      type="button"
                                      className="btn btn-ghost xs"
                                      style={{ padding: '2px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--teal)' }}
                                      onClick={() => alert(`Xem chứng từ số: ${rec.code}\nNội dung: ${rec.note || t.desc}\nSố tiền: ${fmt(rec.amount || paidAmt)} đ`)}
                                    >
                                      <ExternalLink size={11} />
                                      <span>Xem</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}

                              {receiptList.length === 0 && (
                                <tr>
                                  <td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)' }}>
                                    Chưa có biên lai đính kèm nào cho giao dịch này.
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

                {/* Dòng Mở Rộng: Bộ Phân Loại Khớp Kế Hoạch Hoặc Chi Phí Khác (OPEX) */}
                {matchingTxId === t.id && (
                  <tr style={{ backgroundColor: 'rgba(234, 88, 12, 0.03)', borderBottom: '1px solid var(--line)' }}>
                    <td colSpan={7} style={{ padding: '0 0 16px 0' }}>
                      <div
                        style={{
                          margin: '8px 14px 4px 20px',
                          padding: '16px 20px',
                          backgroundColor: 'var(--panel-2)',
                          borderRadius: '8px',
                          borderLeft: '4px solid #ea580c',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={16} style={{ color: '#ea580c' }} />
                            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                              Phân Loại Nguồn Tiền Cho Giao Dịch [{t.id}] · {fmt(paidAmt)} đ ({t.dir === 'out' ? 'Tiền ra' : 'Tiền vào'})
                            </span>
                            <span style={{ fontSize: '11px', color: '#ea580c', backgroundColor: 'rgba(234, 88, 12, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                              Tiền đã trừ vào tài sản {t.acc}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost xs"
                            onClick={() => setMatchingTxId(null)}
                            style={{ fontSize: '11px', color: 'var(--muted)' }}
                          >
                            Đóng
                          </button>
                        </div>

                        {/* Nội dung chọn Match */}
                        {t.dir === 'out' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Lựa chọn Radio */}
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: matchMode === 'proposal' ? 600 : 400, color: matchMode === 'proposal' ? '#2563eb' : 'var(--ink)' }}>
                                <input
                                  type="radio"
                                  name={`match-mode-${t.id}`}
                                  checked={matchMode === 'proposal'}
                                  onChange={() => setMatchMode('proposal')}
                                />
                                <span>🎯 Khớp với Kế hoạch đã duyệt</span>
                              </label>

                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: matchMode === 'opex' ? 600 : 400, color: matchMode === 'opex' ? '#ea580c' : 'var(--ink)' }}>
                                <input
                                  type="radio"
                                  name={`match-mode-${t.id}`}
                                  checked={matchMode === 'opex'}
                                  onChange={() => setMatchMode('opex')}
                                />
                                <span>📁 Chi phí khác (OPEX Doanh Nghiệp)</span>
                              </label>
                            </div>

                            {/* Khung Chi Tiết Tuỳ Chế Độ */}
                            {matchMode === 'proposal' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
                                  Chọn Kế hoạch đã được phê duyệt để làm rõ khoản chi giải ngân này:
                                </label>
                                <select
                                  value={selectedProposalId}
                                  onChange={(e) => setSelectedProposalId(e.target.value)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg)',
                                    color: 'var(--ink)',
                                    maxWidth: '650px'
                                  }}
                                >
                                  <option value="">-- Chọn kế hoạch giải ngân --</option>
                                  {proposals.map((p) => {
                                    const spent = (p as any).spent ?? 0;
                                    const remain = Math.max(0, p.amount - spent);
                                    return (
                                      <option key={p.id} value={p.id}>
                                        [{p.code || p.id}] {p.title} · (Dự toán: {fmt(p.amount)} đ · Còn lại: {fmt(remain)} đ)
                                      </option>
                                    );
                                  })}
                                </select>
                                {selectedProposalId && (() => {
                                  const p = proposals.find((item) => item.id === selectedProposalId);
                                  if (!p) return null;
                                  return (
                                    <div style={{ fontSize: '11.5px', color: '#2563eb', marginTop: '2px' }}>
                                      ℹ️ Sau khi khớp, đợt chi {fmt(paidAmt)} đ sẽ tự động được ghi nhận vào kế hoạch <b>{p.title}</b>. Số dư tài sản giữ nguyên vì đã trừ lúc nhận biên lai.
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
                                  Chọn danh mục Chi phí khác (OPEX):
                                </label>
                                <select
                                  value={selectedCat}
                                  onChange={(e) => setSelectedCat(e.target.value)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg)',
                                    color: 'var(--ink)',
                                    maxWidth: '450px'
                                  }}
                                >
                                  <option value="">-- Chọn danh mục chi phí --</option>
                                  {Object.entries(CATS).map(([k, label]) => (
                                    <option key={k} value={k}>
                                      {label} ({k})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
                              Gán vào mã Hợp đồng khách hàng (nếu là tiền thu hợp đồng, để trống nếu là Thu khác):
                            </label>
                            <input
                              type="text"
                              placeholder="VD: KH012, TV03..."
                              value={contractInput}
                              onChange={(e) => setContractInput(e.target.value)}
                              style={{
                                padding: '8px 12px',
                                fontSize: '13px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg)',
                                color: 'var(--ink)',
                                maxWidth: '300px'
                              }}
                            />
                          </div>
                        )}

                        {/* Nút hành động */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                          <button
                            type="button"
                            className="btn xs"
                            onClick={() => setMatchingTxId(null)}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            className="btn xs primary"
                            style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => handleConfirmMatch(t)}
                            disabled={t.dir === 'out' ? (matchMode === 'proposal' ? !selectedProposalId : !selectedCat) : false}
                          >
                            <Check size={13} />
                            <span>Xác nhận phân loại nguồn tiền</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                {isUnlistedTab
                  ? '✅ Tuyệt vời! Toàn bộ biên lai và giao dịch đều đã được liệt kê và phân loại rõ nguồn tiền.'
                  : 'Không có giao dịch nào phù hợp bộ lọc'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

