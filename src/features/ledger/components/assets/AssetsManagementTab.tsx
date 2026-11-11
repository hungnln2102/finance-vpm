import React, { useState } from 'react';
import { useApp } from '../../../../context/useApp';
import { apiClient } from '../../../../services/apiClient';
import { calculateBalance } from '../../../../services/financeService';
import { fmt, mil } from '../../../../utils/formatters';
import { TODAY } from '../../../../data/constants';
import { AccountItem } from '../../../../types';
import { 
  Briefcase, 
  Wallet, 
  CreditCard, 
  Building2, 
  PlusCircle, 
  Power, 
  CheckCircle2, 
  XCircle,
  ShieldCheck
} from 'lucide-react';

export const AssetsManagementTab: React.FC = () => {
  const { state, showToast, refreshFromDatabase } = useApp();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state thêm tài sản mới
  const [newAccId, setNewAccId] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('bank');
  const [newAccNo, setNewAccNo] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Danh sách tài khoản từ AppState
  const accounts: AccountItem[] = state.accounts && state.accounts.length > 0 
    ? state.accounts 
    : [
        { id: 'QUY', name: 'Quỹ tiền mặt văn phòng', type: 'cash', accountNo: 'TIEN-MAT-VP', bankName: 'Két sắt VP', status: 'active' },
        { id: 'ACB', name: 'Ngân hàng ACB', type: 'bank', accountNo: '168393868', bankName: 'ACB', status: 'active' }
      ];

  const latestTxDate = state.tx.reduce((max, t) => (t.date > max ? t.date : max), TODAY);

  // Tính số dư cho từng tài sản
  const accountBalances: Record<string, number> = {};
  let totalActiveBalance = 0;

  accounts.forEach((acc) => {
    const bal = calculateBalance(state.tx, acc.id, latestTxDate);
    accountBalances[acc.id] = bal;
    if (acc.status === 'active') {
      totalActiveBalance += bal;
    }
  });

  const activeCount = accounts.filter((a) => a.status === 'active').length;
  const inactiveCount = accounts.filter((a) => a.status !== 'active').length;

  // Xử lý bật/tắt (Toggle ON/OFF)
  const handleToggleStatus = async (acc: AccountItem) => {
    const nextStatus = acc.status === 'active' ? 'inactive' : 'active';
    const actionLabel = nextStatus === 'active' ? 'BẬT (ON)' : 'TẮT (OFF)';

    if (acc.status === 'active' && activeCount <= 1) {
      showToast('⚠️ Cần duy trì ít nhất 1 tài sản kích hoạt trong hệ thống!', 'error');
      return;
    }

    setIsUpdating(acc.id);
    try {
      const ok = await apiClient.toggleAccountStatus(acc.id, nextStatus as 'active' | 'inactive');
      if (ok) {
        showToast(`✅ Đã ${actionLabel} tài sản [${acc.id}] ${acc.name}. Bảng số dư đã cập nhật cột động!`, 'success');
        await refreshFromDatabase();
      } else {
        showToast(`Có lỗi khi cập nhật trạng thái tài sản ${acc.id}`, 'error');
      }
    } catch (err: any) {
      showToast('Lỗi toggle: ' + err.message, 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  // Xử lý tạo tài sản mới
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newAccId.trim().toUpperCase().replace(/\s+/g, '_');
    if (!cleanId || !newAccName.trim()) {
      showToast('Vui lòng nhập Mã và Tên tài sản!', 'error');
      return;
    }

    if (accounts.some((a) => a.id === cleanId)) {
      showToast(`Mã tài sản "${cleanId}" đã tồn tại! Vui lòng chọn mã khác.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: AccountItem = {
        id: cleanId,
        name: newAccName.trim(),
        type: newAccType,
        accountNo: newAccNo.trim(),
        bankName: newBankName.trim(),
        status: 'active'
      };

      const ok = await apiClient.saveAccount(payload);
      if (ok) {
        showToast(`✅ Đã thêm tài sản mới "${payload.name}" thành công!`, 'success');
        setShowAddModal(false);
        setNewAccId('');
        setNewAccName('');
        setNewAccNo('');
        setNewBankName('');
        await refreshFromDatabase();
      } else {
        showToast('Có lỗi khi lưu tài sản mới', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi tạo tài sản: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 4 Thẻ KPI Tổng Hợp Tài Sản Doanh Nghiệp */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
        <div className="card-box kpi-card">
          <div className="kpi-label">Tổng Danh Mục Tài Sản</div>
          <div className="kpi-val" style={{ color: 'var(--teal)' }}>{accounts.length}</div>
          <div className="kpi-sub">Bao gồm tiền mặt, ngân hàng & các quỹ</div>
        </div>

        <div className="card-box kpi-card">
          <div className="kpi-label">Đang Kích Hoạt (ON)</div>
          <div className="kpi-val" style={{ color: 'var(--good)' }}>{activeCount}</div>
          <div className="kpi-sub">Hiển thị cột tại Bảng Số Dư</div>
        </div>

        <div className="card-box kpi-card">
          <div className="kpi-label">Đang Tạm Ẩn (OFF)</div>
          <div className="kpi-val" style={{ color: 'var(--muted)' }}>{inactiveCount}</div>
          <div className="kpi-sub">Ẩn khỏi Bảng Số Dư & Form giao dịch</div>
        </div>

        <div className="card-box kpi-card">
          <div className="kpi-label">Tổng Vốn Khả Dụng Active</div>
          <div className="kpi-val" style={{ color: 'var(--ochre)' }}>{mil(totalActiveBalance)}</div>
          <div className="kpi-sub">Số dư thực tế các quỹ đang bật</div>
        </div>
      </div>

      {/* Main Table: Danh Mục Tài Sản & Thao Tác Bật/Tắt */}
      <section className="card-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Briefcase size={18} style={{ color: 'var(--teal)' }} />
              <span>Quản Lý Danh Mục Tài Sản Doanh Nghiệp</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Bật/Tắt tài sản tại đây. Các tài sản ở trạng thái <b>ON</b> sẽ tự động sinh cột theo dõi tại Bảng Số Dư Đầu Kỳ & Cuối Kỳ. Tài sản <b>OFF</b> sẽ ẩn đi.
            </p>
          </div>

          <button
            type="button"
            className="btn primary sm"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={15} />
            <span>Thêm tài sản mới</span>
          </button>
        </div>

        <div className="table-scroll">
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                <th style={{ width: '100px' }}>Mã tài sản</th>
                <th>Tên tài sản / Tên quỹ</th>
                <th style={{ width: '110px' }}>Phân loại</th>
                <th style={{ width: '150px' }}>Số TK / Mã quỹ</th>
                <th style={{ width: '150px' }}>Đơn vị quản lý</th>
                <th className="num" style={{ width: '150px' }}>Số dư Realtime</th>
                <th className="num" style={{ width: '90px' }}>Tỷ trọng</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Thao tác ON/OFF</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, index) => {
                const isActive = acc.status === 'active';
                const bal = accountBalances[acc.id] || 0;
                const ratio = totalActiveBalance > 0 && isActive 
                  ? ((bal / totalActiveBalance) * 100).toFixed(1) 
                  : '0.0';

                return (
                  <tr 
                    key={acc.id} 
                    style={{ 
                      borderBottom: '1px solid var(--line)',
                      backgroundColor: isActive ? undefined : 'rgba(148, 163, 184, 0.04)',
                      opacity: isActive ? 1 : 0.72,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>
                      {index + 1}
                    </td>

                    <td style={{ fontFamily: 'var(--f-num)', fontWeight: 700, color: isActive ? 'var(--teal)' : 'var(--muted)' }}>
                      {acc.id}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{acc.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {acc.type === 'cash' ? 'Tiền mặt tại két' : 'Tài khoản thanh toán'}
                      </div>
                    </td>

                    <td>
                      <span 
                        className={`badge ${acc.type === 'cash' ? 'badge-teal' : 'badge-purple'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px' }}
                      >
                        {acc.type === 'cash' ? <Wallet size={11} /> : <CreditCard size={11} />}
                        <span>{acc.type === 'cash' ? 'Tiền mặt' : 'Ngân hàng'}</span>
                      </span>
                    </td>

                    <td style={{ fontFamily: 'var(--f-num)', color: 'var(--ink)' }}>
                      {acc.accountNo || '—'}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={13} style={{ color: 'var(--muted)' }} />
                        <span>{acc.bankName || 'Văn phòng VPM'}</span>
                      </div>
                    </td>

                    <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 700, color: bal < 0 ? 'var(--bad)' : 'var(--good)' }}>
                      {fmt(bal)} đ
                    </td>

                    <td className="num" style={{ fontFamily: 'var(--f-num)', color: 'var(--muted)', fontWeight: 600 }}>
                      {ratio}%
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {isActive ? (
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.28)',
                            padding: '3px 8px',
                            borderRadius: '12px'
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Đang BẬT</span>
                        </span>
                      ) : (
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--muted)',
                            backgroundColor: 'rgba(148, 163, 184, 0.12)',
                            border: '1px solid var(--line)',
                            padding: '3px 8px',
                            borderRadius: '12px'
                          }}
                        >
                          <XCircle size={12} />
                          <span>Đang TẮT</span>
                        </span>
                      )}
                    </td>

                    {/* Cột Thao Tác: Công Tắc Nguồn Xanh ON / OFF */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(acc)}
                        disabled={isUpdating === acc.id}
                        title={`Bấm để ${isActive ? 'TẮT (Ẩn khỏi bảng)' : 'BẬT (Hiện lên bảng)'}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: isUpdating === acc.id ? 'wait' : 'pointer',
                          transition: 'all 0.2s ease',
                          border: isActive 
                            ? '1px solid #10b981' 
                            : '1px solid rgba(148, 163, 184, 0.4)',
                          backgroundColor: isActive 
                            ? 'rgba(16, 185, 129, 0.15)' 
                            : 'rgba(148, 163, 184, 0.1)',
                          color: isActive ? '#10b981' : 'var(--muted)',
                          boxShadow: isActive ? '0 0 8px rgba(16, 185, 129, 0.25)' : 'none'
                        }}
                      >
                        <Power size={13} style={{ strokeWidth: 2.5 }} />
                        <span>{isActive ? 'ON' : 'OFF'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {accounts.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                    Chưa có tài sản nào được đăng ký trong hệ thống
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Thêm Tài Sản Mới */}
      {showAddModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)'
          }}
        >
          <div 
            className="card-box" 
            style={{ 
              width: '460px', 
              maxWidth: '92vw', 
              padding: '24px', 
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} style={{ color: 'var(--teal)' }} />
                <span>Thêm Tài Sản / Quỹ Mới</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px 8px', fontSize: '16px', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}>
                  Mã tài sản (ID viết hoa, không dấu) <span style={{ color: 'var(--bad)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: MB, VCB, VI_USDT, QUY_DU_PHONG..."
                  value={newAccId}
                  onChange={(e) => setNewAccId(e.target.value.toUpperCase())}
                  required
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--f-num)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}>
                  Tên tài sản / Tên quỹ hiển thị <span style={{ color: 'var(--bad)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tài khoản MBBank, Quỹ Dự Phòng Khẩn Cấp..."
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}>
                    Phân loại
                  </label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
                  >
                    <option value="bank">Tài khoản Ngân hàng</option>
                    <option value="cash">Quỹ tiền mặt</option>
                    <option value="wallet">Ví điện tử / Số</option>
                    <option value="fund">Quỹ nội bộ</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}>
                    Số tài khoản / Mã số
                  </label>
                  <input
                    type="text"
                    placeholder="Số TK ngân hàng"
                    value={newAccNo}
                    onChange={(e) => setNewAccNo(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--f-num)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}>
                  Đơn vị quản lý / Ngân hàng phát hành
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: MBBank CN Sài Gòn, Két sắt VP..."
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={isSubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={14} />
                  <span>{isSubmitting ? 'Đang lưu...' : 'Lưu tài sản'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
