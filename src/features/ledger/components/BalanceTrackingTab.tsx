import React, { useState } from 'react';
import { useApp } from './../../../context/useApp';
import { apiClient } from '../../../services/apiClient';
import { fmt, fm, mon, lastDay, prevMonth, monthLabel } from '../../../utils/formatters';
import { calculateBalance } from '../../../services/financeService';
import { OPEN_BAL, TODAY } from '../../../data/constants';
import {
  Landmark,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Lock,
  CheckCircle2,
  Activity,
  ArrowRight,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

export const BalanceTrackingTab: React.FC = () => {
  const { state, ui, setMonth, showToast, refreshFromDatabase } = useApp();
  const [isSyncingSheetToDb, setIsSyncingSheetToDb] = useState(false);
  const [isSyncingDbToSheet, setIsSyncingDbToSheet] = useState(false);

  // Chiều 1: Kéo toàn bộ dữ liệu từ Google Sheet về nạp/cập nhật vào PostgreSQL (Sheet -> DB)
  const handleSyncSheetToDb = async () => {
    setIsSyncingSheetToDb(true);
    showToast('Đang kết nối Google Sheet để xuất dữ liệu mới nhất về PostgreSQL...', 'info');
    try {
      const res = await apiClient.syncSheetToDb();
      if (res && res.success) {
        showToast(
          `✅ Đồng bộ thành công: ${res.insertedTx || 0} GD mới, ${res.updatedTx || 0} GD cập nhật từ Google Sheet!`,
          'success'
        );
        // Tự động làm mới state trên giao diện Web thời gian thực
        await refreshFromDatabase();
      } else {
        showToast(res.error || 'Có lỗi khi đồng bộ từ Google Sheet', 'error');
      }
    } catch (e: any) {
      showToast('Lỗi khi đồng bộ Sheet -> DB: ' + e.message, 'error');
    } finally {
      setIsSyncingSheetToDb(false);
    }
  };

  // Chiều 2: Đẩy toàn bộ dữ liệu từ PostgreSQL lên làm mới Google Sheet (DB -> Sheet)
  const handleSyncDbToSheet = async () => {
    setIsSyncingDbToSheet(true);
    showToast('Đang đẩy toàn bộ cơ sở dữ liệu PostgreSQL lên Google Sheet...', 'info');
    try {
      const res = await apiClient.syncDbToSheet();
      if (res && res.success) {
        showToast(
          `✅ Đã đẩy toàn bộ PostgreSQL lên Google Sheet (${res.txCount || 0} GD, ${res.contractCount || 0} HĐ, ${res.balanceCount || 0} kỳ số dư)!`,
          'success'
        );
      } else {
        showToast(res.error || 'Có lỗi khi đẩy dữ liệu lên Google Sheet', 'error');
      }
    } catch (e: any) {
      showToast('Lỗi khi đồng bộ DB -> Sheet: ' + e.message, 'error');
    } finally {
      setIsSyncingDbToSheet(false);
    }
  };

  // 1. Thu thập danh sách các tháng từ giao dịch + kỳ hiện tại + tháng thời gian thực
  const monthSet = new Set<string>();
  monthSet.add('2026-08');
  monthSet.add('2026-09');
  monthSet.add('2026-10');
  const realCurrentMonth = mon(TODAY);
  monthSet.add(realCurrentMonth);
  if (ui.month) monthSet.add(ui.month);
  state.tx.forEach((t) => {
    if (t.date) monthSet.add(mon(t.date));
  });

  const months = Array.from(monthSet).sort((a, b) => a.localeCompare(b));

  // 2. Tính toán số dư hiện tại của toàn hệ thống (Realtime)
  const latestTxDate = state.tx.reduce((max, t) => (t.date > max ? t.date : max), TODAY);
  const liveQuy = calculateBalance(state.tx, 'QUY', latestTxDate);
  const liveAcb = calculateBalance(state.tx, 'ACB', latestTxDate);
  const liveTotal = liveQuy + liveAcb;

  // 3. Xây dựng ma trận số dư theo từng tháng
  const matrix = months.map((m, idx) => {
    const prevM = prevMonth(m);
    const isLocked = !!state.locks[m];
    const isCurrentActive = m === ui.month;
    const isPast = idx < months.length - 1 && m < mon(TODAY);

    // Số dư đầu kỳ (ngày 01/MM) = Số dư chốt cuối kỳ của tháng trước
    const startQuy = calculateBalance(state.tx, 'QUY', lastDay(prevM));
    const startAcb = calculateBalance(state.tx, 'ACB', lastDay(prevM));
    const startTotal = startQuy + startAcb;

    // Số dư cuối kỳ (nếu tháng đã chốt thì cố định, nếu tháng đang mở thì tính theo giao dịch phát sinh đến nay)
    const endQuy = calculateBalance(state.tx, 'QUY', lastDay(m));
    const endAcb = calculateBalance(state.tx, 'ACB', lastDay(m));
    const endTotal = endQuy + endAcb;

    const netChange = endTotal - startTotal;
    const netQuy = endQuy - startQuy;
    const netAcb = endAcb - startAcb;

    return {
      month: m,
      isLocked,
      isCurrentActive,
      isPast,
      startQuy,
      endQuy,
      netQuy,
      startAcb,
      endAcb,
      netAcb,
      startTotal,
      endTotal,
      netChange
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 3 Thẻ KPI Số Dư Tức Thời */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
        <div className="ledger-kpi-card">
          <div className="ledger-kpi-card-header">
            <span>SỐ DƯ QUỸ TIỀN MẶT (QUY)</span>
            <div className="ledger-kpi-badge badge-teal">
              <Wallet size={16} />
            </div>
          </div>
          <div className={`ledger-kpi-card-value ${liveQuy < 0 ? 'text-bad' : ''}`}>
            {fmt(liveQuy)} đ
          </div>
          <div className="ledger-kpi-card-footer">
            <span>Két tiền mặt văn phòng</span>
            <span style={{ color: liveQuy < 0 ? 'var(--bad)' : 'var(--teal)' }}>
              {liveQuy < 0 ? 'Cảnh báo âm quỹ' : 'Khả dụng'}
            </span>
          </div>
        </div>

        <div className="ledger-kpi-card">
          <div className="ledger-kpi-card-header">
            <span>SỐ DƯ TÀI KHOẢN ACB</span>
            <div className="ledger-kpi-badge badge-purple">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="ledger-kpi-card-value">
            {fmt(liveAcb)} đ
          </div>
          <div className="ledger-kpi-card-footer">
            <span>TK Ngân hàng ACB</span>
            <span style={{ color: 'var(--good)' }}>Tài khoản hoạt động</span>
          </div>
        </div>

        <div className="ledger-kpi-card">
          <div className="ledger-kpi-card-header">
            <span>TỔNG CỘNG QUỸ TOÀN HỆ THỐNG</span>
            <div className="ledger-kpi-badge badge-green">
              <Landmark size={16} />
            </div>
          </div>
          <div className="ledger-kpi-card-value" style={{ color: 'var(--good)' }}>
            {fmt(liveTotal)} đ
          </div>
          <div className="ledger-kpi-card-footer">
            <span>Quỹ mặt + ACB</span>
            <span style={{ color: 'var(--teal)' }}>Realtime Database</span>
          </div>
        </div>
      </div>

      {/* Bảng Ma Trận Số Dư Các Tháng (Header 2 Tầng) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
              Bảng Theo Dõi Số Dư Đầu Kỳ & Cuối Kỳ Theo Tháng
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Số dư đầu kỳ lấy ngày 01 hàng tháng (kế thừa cuối kỳ tháng trước). Cuối kỳ cập nhật tự động Realtime khi phát sinh giao dịch, chốt cứng khi hết tháng.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--good)' }} />
              <span>Tăng ròng</span>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--bad)', marginLeft: '6px' }} />
              <span>Giảm ròng / Âm quỹ</span>
            </div>

            {/* Cụm 2 nút Đồng Bộ Hai Chiều: Sheet <=> PostgreSQL */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Nút 1: Kéo từ Google Sheet về DB */}
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleSyncSheetToDb}
                disabled={isSyncingSheetToDb || isSyncingDbToSheet}
                title="Đồng bộ các dòng mới hoặc sửa đổi trực tiếp trên Google Sheet về lưu vào PostgreSQL"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid var(--teal)',
                  color: 'var(--teal)'
                }}
              >
                {isSyncingSheetToDb ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                <span>{isSyncingSheetToDb ? 'Đang kéo từ Sheet...' : '📥 Đồng bộ Sheet → DB'}</span>
              </button>

              {/* Nút 2: Đẩy từ DB lên Google Sheet */}
              <button
                type="button"
                className="btn btn-sm primary"
                onClick={handleSyncDbToSheet}
                disabled={isSyncingSheetToDb || isSyncingDbToSheet}
                title="Đẩy toàn bộ cơ sở dữ liệu PostgreSQL lên làm mới các bảng trên Google Sheet"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {isSyncingDbToSheet ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Upload size={13} />
                )}
                <span>{isSyncingDbToSheet ? 'Đang đẩy lên Sheet...' : '📤 Đồng bộ DB → Sheet'}</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card)' }}>
                <th rowSpan={2} style={{ verticalAlign: 'middle', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', padding: '12px 16px' }}>
                  Kỳ Tháng
                </th>
                <th colSpan={2} style={{ textAlign: 'center', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', color: 'var(--ink)' }}>
                  Quỹ Tiền Mặt (QUY)
                </th>
                <th colSpan={2} style={{ textAlign: 'center', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', color: 'var(--ink)' }}>
                  Tài Khoản ACB
                </th>
                <th colSpan={2} style={{ textAlign: 'center', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', color: 'var(--ink)' }}>
                  Tổng Quỹ Khả Dụng
                </th>
                <th rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'right', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', padding: '12px 16px' }}>
                  Biến Động Ròng
                </th>
                <th rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
                  Trạng Thái Kỳ
                </th>
              </tr>
              <tr style={{ background: 'var(--bg-card)', fontSize: '11px', color: 'var(--muted)' }}>
                <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>Đầu kỳ (01/MM)</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', color: 'var(--teal)' }}>Cuối kỳ</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>Đầu kỳ (01/MM)</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', color: 'var(--teal)' }}>Cuối kỳ</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>Đầu kỳ</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', color: 'var(--teal)' }}>Cuối kỳ</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => {
                const isSelected = row.month === ui.month;

                return (
                  <tr
                    key={row.month}
                    style={{
                      background: isSelected ? 'var(--teal-soft)' : undefined,
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Cột Tháng */}
                    <td style={{ fontWeight: 600, borderRight: '1px solid var(--line)', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{monthLabel(row.month)}</span>
                        {isSelected && (
                          <span className="chip" style={{ fontSize: '10px', background: 'var(--teal)', color: '#000', fontWeight: 700, padding: '2px 6px' }}>
                            Đang chọn
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quỹ Đầu kỳ */}
                    <td className="num" style={{ color: row.startQuy < 0 ? 'var(--bad)' : 'var(--muted)', padding: '12px' }}>
                      {fm(row.startQuy)}
                    </td>

                    {/* Quỹ Cuối kỳ */}
                    <td className="num" style={{ fontWeight: 600, color: row.endQuy < 0 ? 'var(--bad)' : 'var(--ink)', borderRight: '1px solid var(--line)', padding: '12px' }}>
                      {fm(row.endQuy)}
                    </td>

                    {/* ACB Đầu kỳ */}
                    <td className="num" style={{ color: 'var(--muted)', padding: '12px' }}>
                      {fm(row.startAcb)}
                    </td>

                    {/* ACB Cuối kỳ */}
                    <td className="num" style={{ fontWeight: 600, color: 'var(--ink)', borderRight: '1px solid var(--line)', padding: '12px' }}>
                      {fm(row.endAcb)}
                    </td>

                    {/* Tổng Đầu kỳ */}
                    <td className="num" style={{ color: 'var(--muted)', padding: '12px' }}>
                      {fm(row.startTotal)}
                    </td>

                    {/* Tổng Cuối kỳ */}
                    <td className="num" style={{ fontWeight: 700, color: row.endTotal < 0 ? 'var(--bad)' : 'var(--teal)', borderRight: '1px solid var(--line)', padding: '12px' }}>
                      {fm(row.endTotal)}
                    </td>

                    {/* Biến Động Ròng */}
                    <td className="num" style={{ fontWeight: 600, color: row.netChange >= 0 ? 'var(--good)' : 'var(--bad)', borderRight: '1px solid var(--line)', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {row.netChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        <span>{row.netChange >= 0 ? '+' : ''}{fm(row.netChange)}</span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                      {row.isLocked ? (
                        <span className="chip" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--bad)', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} /> Đã khóa sổ
                        </span>
                      ) : row.isPast ? (
                        <span className="chip" style={{ background: 'rgba(148, 163, 184, 0.1)', color: 'var(--muted)', border: '1px solid var(--line)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Đã chốt cuối tháng
                        </span>
                      ) : (
                        <span className="chip" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--good)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Activity size={12} /> Cập nhật Realtime
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '14px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
          <span>💡 <b>Quy tắc số dư:</b> Số dư đầu kỳ tháng sau = Số dư cuối kỳ tháng trước. Dữ liệu được đồng bộ trực tiếp từ PostgreSQL và Google Sheet.</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setMonth(ui.month)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Xem chi tiết chứng từ {monthLabel(ui.month)}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

