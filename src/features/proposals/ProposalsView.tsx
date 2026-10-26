import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Proposal } from '../../types';
import { fmt, mil, dmy } from '../../utils/formatters';
import { TODAY, ROLES } from '../../data/constants';
import { 
  Send, 
  Mail, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  MessageSquare, 
  Clock, 
  CornerDownRight, 
  ShieldCheck, 
  Sparkles,
  User,
  Building,
  AtSign
} from 'lucide-react';

export const ProposalsView: React.FC = () => {
  const { state, ui, canDo, submitProposal, reviewProposal, addProposalThread } = useApp();

  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    state.proposals && state.proposals.length > 0 ? state.proposals[0].id : ''
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState(ui.role === 'operator' ? 'Nguyễn Thị Thảo' : 'Phòng Kinh Doanh');
  const [creatorEmail, setCreatorEmail] = useState('thao.nguyen@vpmfinance.vn');
  const [department, setDepartment] = useState('Kinh doanh & Phát triển Khách hàng');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [threadReplyContent, setThreadReplyContent] = useState('');

  const selectedProposal = state.proposals?.find((p) => p.id === selectedProposalId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    submitProposal({
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
    setShowCreateModal(false);
  };

  const handleSendThreadReply = (isInbound = false) => {
    if (!threadReplyContent.trim() || !selectedProposalId) return;
    addProposalThread(selectedProposalId, threadReplyContent.trim(), isInbound);
    setThreadReplyContent('');
  };

  const renderStatusBadge = (st: Proposal['status']) => {
    switch (st) {
      case 'approved':
        return (
          <span className="chip good" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
            <ShieldCheck size={12} /> Đã phê duyệt
          </span>
        );
      case 'pending_master':
        return (
          <span className="chip" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
            <Sparkles size={11} /> Chờ Master duyệt
          </span>
        );
      case 'pending_admin':
        return (
          <span className="chip warn" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={11} /> Chờ Admin xem xét
          </span>
        );
      case 'rejected':
        return (
          <span className="chip bad" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <XCircle size={11} /> Từ chối
          </span>
        );
      default:
        return <span className="chip">Bản nháp</span>;
    }
  };

  const totalProposedAmount = (state.proposals || []).reduce((s, p) => s + p.amount, 0);
  const approvedAmount = (state.proposals || []).filter((p) => p.status === 'approved').reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* KPI Cards Summary */}
      <div className="kpi-grid">
        <div className="card-box kpi-card">
          <div className="kpi-label">Tổng số Hồ sơ Đệ trình</div>
          <div className="kpi-val" style={{ color: 'var(--teal)' }}>{state.proposals ? state.proposals.length : 0}</div>
          <div className="kpi-sub">Kế hoạch các phòng ban gửi duyệt</div>
        </div>
        <div className="card-box kpi-card">
          <div className="kpi-label">Tổng Ngân sách Đề xuất</div>
          <div className="kpi-val" style={{ color: 'var(--ochre)' }}>{mil(totalProposedAmount)}</div>
          <div className="kpi-sub">Tổng dự toán tất cả hồ sơ</div>
        </div>
        <div className="card-box kpi-card">
          <div className="kpi-label">Ngân sách Đã Master Duyệt</div>
          <div className="kpi-val" style={{ color: 'var(--good)' }}>{mil(approvedAmount)}</div>
          <div className="kpi-sub">Đã cấp phép chi thực tế</div>
        </div>
        <div className="card-box kpi-card">
          <div className="kpi-label">Cổng Email Tự Động</div>
          <div className="kpi-val" style={{ color: '#f97316', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={20} /> Resend Ready
          </div>
          <div className="kpi-sub">Outbound CC nhân viên & Inbound Threading</div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Proposals List */}
        <section className="card-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 className="card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--teal)' }} />
                <span>Danh Sách Kế Hoạch & Đệ Trình</span>
              </div>
              <small>Quản lý hồ sơ đề xuất chi phí & dự toán</small>
            </h2>

            <button
              type="button"
              className="btn primary xs"
              onClick={() => setShowCreateModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <PlusCircle size={13} />
              <span>Lập kế hoạch mới</span>
            </button>
          </div>

          <div className="table-scroll">
            <table style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tiêu đề kế hoạch</th>
                  <th>Phòng ban</th>
                  <th className="num">Dự toán</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {(state.proposals || []).map((p) => {
                  const isSelected = p.id === selectedProposalId;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProposalId(p.id)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'var(--teal-soft)' : undefined
                      }}
                    >
                      <td style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>{p.code}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: isSelected ? 'var(--teal)' : undefined }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <User size={11} /> {p.creator} · {dmy(p.date)}
                        </div>
                      </td>
                      <td style={{ fontSize: '12px' }}>{p.department}</td>
                      <td className="num" style={{ fontWeight: 700, color: 'var(--ochre)' }}>
                        {fmt(p.amount)} đ
                      </td>
                      <td>{renderStatusBadge(p.status)}</td>
                    </tr>
                  );
                })}

                {(!state.proposals || state.proposals.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                      Chưa có kế hoạch nào được lập
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Proposal Detail & Inbound Email Thread */}
        <section className="card-box" style={{ borderLeft: '4px solid var(--teal)' }}>
          {selectedProposal ? (
            <div>
              {/* Proposal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: '14px', color: 'var(--teal)' }}>
                      {selectedProposal.code}
                    </span>
                    {renderStatusBadge(selectedProposal.status)}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '6px 0 4px' }}>
                    {selectedProposal.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} /> {selectedProposal.department}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AtSign size={12} /> CC: {selectedProposal.creatorEmail}
                    </span>
                    <span>Ngày: {dmy(selectedProposal.date)}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Dự toán phê duyệt</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ochre)', fontFamily: 'var(--f-num)' }}>
                    {fmt(selectedProposal.amount)} đ
                  </div>
                </div>
              </div>

              {/* Description box */}
              <div style={{ background: 'var(--soft)', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
                <b>Mục tiêu & nội dung kế hoạch:</b> {selectedProposal.description}
              </div>

              {/* Resend Email Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(249, 115, 22, 0.08)', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', color: '#c2410c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} />
                  <span>Resend Outbound Email đã kích hoạt · Đã tự động CC nhân viên lập</span>
                </div>
                <span style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>{selectedProposal.resendSentAt}</span>
              </div>

              {/* Approval Actions Bar */}
              <div style={{ display: 'flex', gap: '8px', padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                {canDo('review_proposal') && selectedProposal.status === 'pending_admin' && (
                  <>
                    <button
                      type="button"
                      className="btn xs primary"
                      onClick={() => reviewProposal(selectedProposal.id, 'pending_master', 'Admin đã kiểm tra hợp lệ và chuyển tiếp lên Master phê duyệt.')}
                    >
                      <CheckCircle2 size={12} />
                      <span>Sơ duyệt (Chuyển Master)</span>
                    </button>
                    <button
                      type="button"
                      className="btn xs danger"
                      onClick={() => reviewProposal(selectedProposal.id, 'rejected', 'Kế toán trưởng từ chối: Báo giá chưa đầy đủ định mức.')}
                    >
                      <XCircle size={12} />
                      <span>Từ chối</span>
                    </button>
                  </>
                )}

                {(ui.role === 'master' || ui.role === 'giau') && selectedProposal.status !== 'approved' && (
                  <>
                    <button
                      type="button"
                      className="btn xs primary"
                      onClick={() => reviewProposal(selectedProposal.id, 'approved', '👑 Sếp Mavryk chính thức phê duyệt kế hoạch và ngân sách.')}
                      style={{ background: 'var(--good)', borderColor: 'var(--good)' }}
                    >
                      <ShieldCheck size={12} />
                      <span>👑 Phê Duyệt Kế Hoạch</span>
                    </button>
                    <button
                      type="button"
                      className="btn xs danger"
                      onClick={() => reviewProposal(selectedProposal.id, 'rejected', '👑 Sếp Mavryk yêu cầu hoãn lại hoặc điều chỉnh quy mô.')}
                    >
                      <XCircle size={12} />
                      <span>Từ chối</span>
                    </button>
                  </>
                )}
              </div>

              {/* Discussion Thread (Inbound & Outbound) */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <MessageSquare size={14} />
                  <span>Nhật Ký Trao Đổi & Giải Trình (Inbound Threading)</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', marginBottom: '14px', paddingRight: '4px' }}>
                  {(selectedProposal.threads || []).map((th) => (
                    <div
                      key={th.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: th.isInboundReply ? 'rgba(59, 130, 246, 0.08)' : 'var(--soft)',
                        borderLeft: th.isInboundReply ? '3px solid #3b82f6' : '3px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '11.5px' }}>
                        <span style={{ fontWeight: 700, color: th.isInboundReply ? '#2563eb' : undefined }}>
                          {th.sender} {th.isInboundReply && '· ✉️ Reply Email (Inbound)'}
                        </span>
                        <span style={{ color: 'var(--muted)', fontFamily: 'var(--f-num)' }}>{th.createdAt}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', lineHeight: 1.4 }}>{th.content}</div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    rows={2}
                    placeholder="Viết phản hồi giải trình hoặc chỉ đạo..."
                    value={threadReplyContent}
                    onChange={(e) => setThreadReplyContent(e.target.value)}
                    style={{ fontSize: '12.5px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', resize: 'none' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn xs"
                      onClick={() => handleSendThreadReply(true)}
                      title="Giả lập nhân viên nhận mail qua Resend và bấm Reply giải trình trực tiếp"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}
                    >
                      <CornerDownRight size={12} />
                      <span>Giả lập Inbound Reply (Email)</span>
                    </button>
                    <button
                      type="button"
                      className="btn xs primary"
                      onClick={() => handleSendThreadReply(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Send size={12} />
                      <span>Gửi trao đổi</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Chọn một kế hoạch bên trái để xem chi tiết và trao đổi giải trình
            </div>
          )}
        </section>
      </div>

      {/* Modal Lập Kế Hoạch Mới */}
      {showCreateModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card-box" style={{ width: '560px', maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} style={{ color: 'var(--teal)' }} />
                <span>Lập Hồ Sơ Kế Hoạch & Đệ Trình Phê Duyệt</span>
              </h3>
              <button type="button" className="btn xs" onClick={() => setShowCreateModal(false)}>
                Đóng
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
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
                <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>
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
      )}
    </div>
  );
};
