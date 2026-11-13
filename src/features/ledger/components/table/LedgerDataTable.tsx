import React, { useState, useMemo } from 'react';
import { Transaction, TransactionReceipt, Proposal, Contract } from '../../../../types';
import { TYPES } from '../../../../data/constants';
import { useApp } from '../../../../context/useApp';
import { fmt, dmy } from '../../../../utils/formatters';
import { txIssues } from '../../../../services/financeService';
import { CustomSelect, CustomSelectOption } from '../../../../shared/components/common/CustomSelect';
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
  contracts?: Contract[];
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
  contracts = [],
  isUnlistedTab = false,
  onEditTx,
  onUpdateTx
}) => {
  const { state } = useApp();
  const categoryNames = state.costCategories;
  // State lưu id của dòng đang mở dropdown xem biên lai
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // State lưu id của dòng đang mở panel chọn phân loại nhanh (Match Kế hoạch, Chi phí hoặc Công nợ)
  const [matchingTxId, setMatchingTxId] = useState<string | null>(null);
  const [matchCategory, setMatchCategory] = useState<'proposal' | 'opex' | 'debt' | 'other_income'>('debt');
  const [selectedProposalId, setSelectedProposalId] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [contractInput, setContractInput] = useState<string>('');
  const [incomeDescription, setIncomeDescription] = useState<string>('');

  // Dropdown 1 cho dòng TIỀN VÀO (Thu tiền: Tuyệt đối không cho phép gán Kế hoạch chi tiêu)
  const inCategoryOptions: CustomSelectOption[] = useMemo(() => [
    { value: 'debt', label: '📑 Thu công nợ Hợp đồng', badge: 'Thu nợ', badgeColor: 'teal' },
    { value: 'other_income', label: '📁 Khoản thu khác / Hoàn tiền', badge: 'Thu khác', badgeColor: 'muted' }
  ], []);

  // Dropdown 1 cho dòng TIỀN RA (Chi tiêu ngân sách / Thanh toán)
  const outCategoryOptions: CustomSelectOption[] = useMemo(() => [
    { value: 'proposal', label: '🎯 Chi giải ngân Kế hoạch đã duyệt', badge: 'Kế hoạch', badgeColor: 'blue' },
    { value: 'opex', label: '📁 Chi phí vận hành (OPEX)', badge: 'Khoản chi', badgeColor: 'ochre' },
    { value: 'debt', label: '📑 Chi tạm ứng / Trả nợ HĐ', badge: 'Công nợ', badgeColor: 'teal' }
  ], []);

  // Danh mục phân loại các khoản thu khác (Tiền vào)
  const otherIncomeOptions: CustomSelectOption[] = useMemo(() => [
    { value: 'LÃI_NH', label: 'Thu tiền lãi tiền gửi tiết kiệm / tài khoản ngân hàng', badge: 'Lãi NH', badgeColor: 'teal' },
    { value: 'HOÀN_TIỀN', label: 'Đối tác / Nhà cung cấp hoàn trả tiền hoặc đền bù', badge: 'Hoàn tiền', badgeColor: 'blue' },
    { value: 'DFAM_CAP_VON', label: 'DFAM rót vốn kinh doanh / Hỗ trợ ngân sách', badge: 'Cấp vốn', badgeColor: 'ochre' },
    { value: 'THU_HOAT_DONG_KHAC', label: 'Các nguồn thu hoạt động doanh nghiệp khác', badge: 'Thu khác', badgeColor: 'muted' }
  ], []);

  // Chỉ lọc các kế hoạch đã được phê duyệt (status === 'approved') để chi giải ngân
  const approvedProposals = useMemo(() => {
    return proposals.filter((p) => p.status === 'approved');
  }, [proposals]);

  const proposalOptions: CustomSelectOption[] = useMemo(() => {
    return approvedProposals.map((p) => {
      const spent = (p as any).spent ?? 0;
      const remain = Math.max(0, p.amount - spent);
      return {
        value: p.id,
        label: p.title,
        badge: p.code || p.id,
        badgeColor: 'blue',
        subLabel: `Đã chi: ${fmt(spent)} đ · Còn lại: ${fmt(remain)} đ`,
        meta: `Dự toán: ${fmt(p.amount)} đ`
      };
    });
  }, [approvedProposals]);

  const opexOptions: CustomSelectOption[] = useMemo(() => {
    return Object.entries(categoryNames).map(([k, label]) => ({
      value: k,
      label: label,
      badge: k,
      badgeColor: 'ochre'
    }));
  }, []);

  const debtOptions: CustomSelectOption[] = useMemo(() => {
    return contracts.map((c) => ({
      value: c.id,
      label: c.customer,
      badge: c.id,
      badgeColor: c.kind === 'KH' ? 'teal' : 'ochre',
      subLabel: c.kind === 'KH' ? 'Hợp đồng Khách hàng' : 'Tư vấn viên / Hoa hồng',
      meta: `Phí: ${fmt(c.fee)} đ`
    }));
  }, [contracts]);

  const toggleExpand = (id: string) => {
    setExpandedTxId((prev) => (prev === id ? null : id));
  };

  const handleConfirmMatch = (t: Transaction) => {
    if (!onUpdateTx) return;

    const nextFlags = (t.flags || []).filter((f) => f !== 'unlisted');

    if (t.dir === 'in') {
      // 1. TIỀN VÀO: Bắt buộc proposalId = '' (Không bao giờ gán vào kế hoạch chi tiêu)
      if (matchCategory === 'debt') {
        const cId = contractInput.trim();
        onUpdateTx(t.id, {
          proposalId: '',
          cat: '',
          contract: cId,
          type: cId ? 'THU_KH' : 'THU_KHAC',
          status: 'posted',
          flags: nextFlags
        });
      } else {
        // other_income
        onUpdateTx(t.id, {
          proposalId: '',
          cat: selectedCat || 'THU_HOAT_DONG_KHAC',
          contract: '',
          type: 'THU_KHAC',
          status: 'posted',
          flags: nextFlags,
          desc: incomeDescription.trim()
        });
      }
    } else {
      // 2. TIỀN RA: Chi giải ngân kế hoạch đã duyệt, chi OPEX hoặc trả nợ
      if (matchCategory === 'proposal') {
        const p = approvedProposals.find((item) => item.id === selectedProposalId);
        if (!p) return;
        onUpdateTx(t.id, {
          proposalId: selectedProposalId,
          cat: selectedCat || t.cat || '',
          contract: '',
          type: 'OPEX',
          status: 'posted',
          flags: nextFlags,
          desc: t.desc || (p ? `Chi giải ngân kế hoạch ${p.code || p.id}` : t.desc)
        });
      } else if (matchCategory === 'opex') {
        onUpdateTx(t.id, {
          proposalId: '',
          cat: selectedCat,
          contract: '',
          type: 'OPEX',
          status: 'posted',
          flags: nextFlags
        });
      } else {
        // Công nợ / Tạm ứng Hợp đồng
        const cId = contractInput.trim();
        onUpdateTx(t.id, {
          proposalId: '',
          cat: '',
          contract: cId,
          type: cId.startsWith('TV') ? 'TAM_UNG' : 'OPEX',
          status: 'posted',
          flags: nextFlags
        });
      }
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
                    
                    {issues.length > 0 && (
                      <span
                        title={issues.join(' · ')}
                        style={{ color: 'var(--bad)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}
                      >
                        <AlertCircle size={11} />
                        <span>{issues.length} cảnh báo</span>
                      </span>
                    )}

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

                    </div>
                  </td>

                  {/* Cột 4: Phân loại */}
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{TYPES[t.type]?.l || t.type}</div>
                    {t.cat && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {categoryNames[t.cat] || t.cat}
                      </div>
                    )}
                    {t.contract && (
                      <div style={{ fontSize: '11px', color: 'var(--teal)' }}>
                        HĐ: {t.contract}
                      </div>
                    )}
                    {matchedProposal && (
                      <div style={{ fontSize: '11px', color: '#2563eb' }} title={matchedProposal.title}>
                        KH: {matchedProposal.code || matchedProposal.id}
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
                              if (t.dir === 'in') {
                                setMatchCategory('debt');
                                setSelectedProposalId('');
                                setSelectedCat('');
                                setContractInput(t.contract || (contracts[0]?.id || ''));
                                setIncomeDescription(t.desc || '');
                              } else {
                                const hasApproved = approvedProposals.length > 0;
                                const defaultCat: 'proposal' | 'opex' | 'debt' = t.proposalId 
                                  ? 'proposal' 
                                  : (t.cat ? 'opex' : (hasApproved ? 'proposal' : 'opex'));
                                setMatchCategory(defaultCat);
                                const matchedApprovedProp = approvedProposals.find((p) => p.id === t.proposalId) || approvedProposals[0];
                                const initialPropId = matchedApprovedProp?.id || '';
                                setSelectedProposalId(initialPropId);
                                setSelectedCat(t.cat || 'VP');
                                setContractInput(
                                  t.contract || 
                                  (defaultCat === 'proposal' ? (matchedApprovedProp?.code || matchedApprovedProp?.id || '') : 
                                   defaultCat === 'opex' ? (t.cat || 'VP') : 
                                   (contracts[0]?.id || ''))
                                );
                              }
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
                          title="Bấm để chọn Kế hoạch, Chi phí hoặc Công nợ cho giao dịch này"
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
                {matchingTxId === t.id && (() => {
                  const isIncome = t.dir === 'in';
                  const themeColor = isIncome ? 'var(--good)' : '#ea580c';
                  const themeBg = isIncome ? 'rgba(16, 185, 129, 0.04)' : 'rgba(234, 88, 12, 0.03)';
                  const themeBadgeBg = isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 88, 12, 0.1)';

                  return (
                    <tr style={{ backgroundColor: themeBg, borderBottom: '1px solid var(--line)' }}>
                      <td colSpan={7} style={{ padding: '0 0 16px 0' }}>
                        <div
                          style={{
                            margin: '8px 14px 4px 20px',
                            padding: '16px 20px',
                            backgroundColor: 'var(--panel-2)',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${themeColor}`,
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Zap size={16} style={{ color: themeColor }} />
                              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                                {isIncome ? 'Phân Loại Nguồn Thu Tiền Về' : 'Phân Loại Nguồn Tiền Chi Ra'} Cho Giao Dịch [{t.id}] · {isIncome ? '+' : '-'}{fmt(paidAmt)} đ ({isIncome ? 'Tiền vào' : 'Tiền ra'})
                              </span>
                              <span style={{ fontSize: '11px', color: themeColor, backgroundColor: themeBadgeBg, padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                {isIncome ? `Tiền đã cộng vào tài sản ${t.acc}` : `Tiền đã trừ vào tài sản ${t.acc}`}
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

                          {/* Nội dung chọn Match: 2 dropdown liên hoàn CustomSelect + 1 input mã */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>
                              {isIncome 
                                ? 'Phân loại nguồn tiền THU VÀO (Công nợ Hợp đồng / Khoản thu khác):' 
                                : 'Phân loại nguồn tiền CHI RA (Kế hoạch đã duyệt / Chi phí OPEX / Công nợ):'}
                            </label>

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                              {/* Dropdown 1: Loại nguồn tiền */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '190px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                                  1. Phân loại nguồn
                                </span>
                                <CustomSelect
                                  value={matchCategory}
                                  options={isIncome ? inCategoryOptions : outCategoryOptions}
                                  onChange={(val) => {
                                    const nextCat = val as 'proposal' | 'opex' | 'debt' | 'other_income';
                                    setMatchCategory(nextCat);
                                    if (nextCat === 'proposal') {
                                      const firstP = approvedProposals[0];
                                      setSelectedProposalId(firstP?.id || '');
                                      setContractInput(firstP?.code || firstP?.id || '');
                                    } else if (nextCat === 'opex') {
                                      const firstCat = Object.keys(categoryNames)[0] || 'VP';
                                      setSelectedCat(firstCat);
                                      setContractInput(firstCat);
                                    } else if (nextCat === 'other_income') {
                                      const firstIncome = otherIncomeOptions[0]?.value || 'THU_HOAT_DONG_KHAC';
                                      setSelectedCat(firstIncome);
                                      setContractInput('');
                                      setIncomeDescription('');
                                      setSelectedProposalId('');
                                    } else {
                                      const firstC = contracts[0];
                                      setContractInput(firstC?.id || '');
                                      setSelectedProposalId('');
                                    }
                                  }}
                                  showSearch={false}
                                  minWidth="190px"
                                  width="190px"
                                />
                              </div>

                              {/* Dropdown 2: Dựa vào Dropdown 1 để list ra */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 380px', minWidth: '280px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                                  2. Danh mục chi tiết ({
                                    matchCategory === 'proposal' ? 'Kế hoạch đã duyệt' : 
                                    matchCategory === 'opex' ? 'Khoản mục chi phí' : 
                                    matchCategory === 'other_income' ? 'Khoản thu khác' : 
                                    'Hợp đồng / Khách hàng'
                                  })
                                </span>

                                {matchCategory === 'proposal' && (
                                  <CustomSelect
                                    value={selectedProposalId}
                                    options={proposalOptions}
                                    placeholder={approvedProposals.length > 0 ? '-- Chọn kế hoạch đã được phê duyệt --' : '-- Không có kế hoạch nào được phê duyệt --'}
                                    searchPlaceholder="Gõ mã hoặc tên kế hoạch đã duyệt để tìm..."
                                    onChange={(val) => {
                                      setSelectedProposalId(val);
                                      const p = approvedProposals.find((item) => item.id === val);
                                      if (p) setContractInput(p.code || p.id);
                                    }}
                                    minWidth="280px"
                                    width="100%"
                                    disabled={approvedProposals.length === 0}
                                  />
                                )}

                                {matchCategory === 'opex' && (
                                  <CustomSelect
                                    value={selectedCat}
                                    options={opexOptions}
                                    placeholder="-- Chọn danh mục chi phí (OPEX) --"
                                    searchPlaceholder="Gõ tên danh mục chi phí để tìm..."
                                    onChange={(val) => {
                                      setSelectedCat(val);
                                    }}
                                    minWidth="280px"
                                    width="100%"
                                  />
                                )}

                                {matchCategory === 'debt' && (
                                  <CustomSelect
                                    value={contractInput}
                                    options={debtOptions}
                                    placeholder="-- Chọn hợp đồng khách hàng / tư vấn viên --"
                                    searchPlaceholder="Gõ mã HĐ hoặc tên khách hàng để tìm..."
                                    onChange={(val) => setContractInput(val)}
                                    minWidth="280px"
                                    width="100%"
                                  />
                                )}

                                {matchCategory === 'other_income' && (
                                  <CustomSelect
                                    value={selectedCat}
                                    options={otherIncomeOptions}
                                    placeholder="-- Chọn khoản thu khác / hoàn tiền --"
                                    searchPlaceholder="Gõ tên khoản thu để tìm..."
                                    onChange={(val) => {
                                      setSelectedCat(val);
                                    }}
                                    minWidth="280px"
                                    width="100%"
                                  />
                                )}
                              </div>

                              {/* Custom link code or income description */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: matchCategory === 'other_income' ? '280px' : '160px', flex: matchCategory === 'other_income' ? '1 1 320px' : '0 0 170px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                                  {matchCategory === 'other_income' ? '3. Di\u1ec5n gi\u1ea3i ngu\u1ed3n thu *' : '3. M\u00e3 g\u00e1n / T\u00f9y bi\u1ebfn'}
                                </span>
                                <input
                                  type="text"
                                  placeholder={
                                    matchCategory === 'debt'
                                      ? (isIncome ? 'VD: KH012, TV03...' : 'Mã HĐ tạm ứng...')
                                      : matchCategory === 'proposal' ? 'Mã kế hoạch...'
                                      : matchCategory === 'other_income' ? 'VD: Kh\u00e1ch h\u00e0ng ho\u00e0n l\u1ea1i ti\u1ec1n c\u1ecdc h\u1ed9i th\u1ea3o...'
                                      : 'Mã khoản chi...'
                                  }
                                  value={matchCategory === 'other_income' ? incomeDescription : contractInput}
                                  onChange={(e) => {
                                    if (matchCategory === 'other_income') {
                                      setIncomeDescription(e.target.value);
                                    } else {
                                      setContractInput(e.target.value);
                                    }
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--line)',
                                    backgroundColor: 'var(--panel)',
                                    color: 'var(--ink)',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                            </div>

                            {/* Card Preview trực quan sau khi chọn */}
                            {matchCategory === 'proposal' && selectedProposalId && (() => {
                              const p = approvedProposals.find((item) => item.id === selectedProposalId);
                              if (!p) return null;
                              const spent = (p as any).spent ?? 0;
                              const remain = Math.max(0, p.amount - spent);
                              return (
                                <div
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                    border: '1px solid rgba(59, 130, 246, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    fontSize: '12px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb' }}>
                                    <Target size={14} />
                                    <span>Ghi nhận chi giải ngân vào: <b>[{p.code || p.id}] {p.title}</b></span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '12px', color: 'var(--ink)', fontFamily: 'var(--f-num)', fontSize: '11.5px' }}>
                                    <span>Dự toán: <b>{fmt(p.amount)} đ</b></span>
                                    <span>Đã chi: <b>{fmt(spent)} đ</b></span>
                                    <span style={{ color: remain > 0 ? 'var(--good)' : 'var(--bad)' }}>Còn lại: <b>{fmt(remain)} đ</b></span>
                                  </div>
                                </div>
                              );
                            })()}

                            {matchCategory === 'debt' && contractInput && (() => {
                              const c = contracts.find((item) => item.id.toUpperCase() === contractInput.trim().toUpperCase());
                              if (!c) return null;
                              return (
                                <div
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.08)' : 'rgba(20, 184, 166, 0.08)',
                                    border: `1px solid ${isIncome ? 'rgba(16, 185, 129, 0.25)' : 'rgba(20, 184, 166, 0.25)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    fontSize: '12px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isIncome ? 'var(--good)' : 'var(--teal)' }}>
                                    <FileText size={14} />
                                    <span>
                                      {isIncome ? 'Thu tiền công nợ hợp đồng: ' : 'Đối soát / Tạm ứng hợp đồng: '}
                                      <b>[{c.id}] {c.customer}</b> ({c.kind === 'KH' ? 'HĐ Khách hàng' : 'Tư vấn viên'})
                                    </span>
                                  </div>
                                  <div style={{ color: 'var(--ink)', fontFamily: 'var(--f-num)', fontSize: '11.5px' }}>
                                    <span>Trị giá hợp đồng: <b>{fmt(c.fee)} đ</b></span>
                                    {c.due && <span style={{ marginLeft: '12px', color: 'var(--muted)' }}>Hạn thanh toán: {c.due}</span>}
                                  </div>
                                </div>
                              );
                            })()}

                            {matchCategory === 'other_income' && selectedCat && (() => {
                              const inc = otherIncomeOptions.find((item) => item.value === selectedCat);
                              return (
                                <div
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    fontSize: '12px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--good)' }}>
                                    <Check size={14} />
                                    <span>Nh\u00f3m h\u1ea1ch to\u00e1n: <b>{inc?.label || selectedCat}</b></span>
                                  </div>
                                  <div style={{ color: 'var(--ink)', fontFamily: 'var(--f-num)', fontSize: '11.5px' }}>
                                    <span>{incomeDescription.trim() || 'Ch\u01b0a nh\u1eadp di\u1ec5n gi\u1ea3i ngu\u1ed3n thu'}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

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
                              style={{ backgroundColor: themeColor, borderColor: themeColor, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              onClick={() => handleConfirmMatch(t)}
                              disabled={
                                !isIncome
                                  ? (matchCategory === 'proposal' ? (!selectedProposalId || !approvedProposals.some((p) => p.id === selectedProposalId)) : matchCategory === 'opex' ? !selectedCat : false)
                                  : (matchCategory === 'other_income' ? (!selectedCat || !incomeDescription.trim()) : false)
                              }
                            >
                              <Check size={13} />
                              <span>{isIncome ? 'Xác nhận ghi nhận nguồn thu' : 'Xác nhận phân loại nguồn chi'}</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })()}
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

