import React, { useState } from 'react';
import { Proposal, ProposalThread, Role } from '../../../types';
import { fmt, dmy } from '../../../utils/formatters';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { 
  FileText, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Eye, 
  Reply, 
  Clock, 
  Mail, 
  Building 
} from 'lucide-react';

interface ProposalListTableProps {
  proposals: Proposal[];
  txList: any[];
  uiRole: Role;
  canReview: boolean;
  onOpenCreateModal: () => void;
  onReview: (id: string, status: 'pending_master' | 'approved' | 'rejected', comment?: string) => void;
  onAddThread: (proposalId: string, content: string, isInbound?: boolean) => void;
}

export const ProposalListTable: React.FC<ProposalListTableProps> = ({
  proposals,
  txList,
  uiRole,
  canReview,
  onOpenCreateModal,
  onReview,
  onAddThread
}) => {
  // State lưu id của các dòng đang mở dropdown (hỗ trợ mở 1 hoặc nhiều dòng)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(
    proposals.length > 0 ? proposals[0].id : null
  );

  // State nhập nội dung phản hồi cho từng proposal
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  // State mở modal xem chi tiết tin nhắn
  const [viewingThread, setViewingThread] = useState<ProposalThread | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleReplyChange = (id: string, text: string) => {
    setReplyInputs((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = (proposalId: string, isInbound = false) => {
    const content = replyInputs[proposalId]?.trim();
    if (!content) return;
    onAddThread(proposalId, content, isInbound);
    setReplyInputs((prev) => ({ ...prev, [proposalId]: '' }));
  };

  // Tính số tiền đã chi thực tế theo kế hoạch
  const calculateSpentAmount = (p: Proposal): number => {
    // 1. Tìm giao dịch chi trong sổ có diễn giải chứa mã kế hoạch
    const spentFromTx = txList
      .filter((t) => t.dir === 'out' && (t.desc?.includes(p.code) || (t.contract && t.contract === p.code)))
      .reduce((sum, t) => sum + (Number(t.amt) || 0), 0);

    if (spentFromTx > 0) return spentFromTx;

    // 2. Nếu đã approved nhưng chưa khớp mã tx riêng, ta tạm tính theo trạng thái
    return p.status === 'approved' ? p.amount : 0;
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
            Quản lý tập trung hồ sơ đề xuất, dự toán, chi phí thực tế và nhật ký trao đổi giải trình tích hợp.
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

      {/* Main Table: 7 Cột Chuẩn Theo Yêu Cầu Của Master */}
      <div className="table-scroll">
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
              <th style={{ width: '130px' }}>Mã kế hoạch</th>
              <th style={{ width: '220px' }}>Tiêu đề kế hoạch</th>
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
              const spent = calculateSpentAmount(p);
              const threadList = p.threads || [];

              return (
                <React.Fragment key={p.id}>
                  {/* Dòng Chính (Master Row) */}
                  <tr
                    onClick={() => toggleExpand(p.id)}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid var(--line)',
                      backgroundColor: isExpanded ? 'rgba(59, 130, 246, 0.05)' : undefined,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Cột 1: Mã */}
                    <td style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(p.id);
                          }}
                          className="btn btn-ghost btn-xs"
                          style={{ padding: '2px 4px', color: isExpanded ? '#3b82f6' : 'var(--muted)' }}
                          title={isExpanded ? 'Thu gọn nhật ký' : 'Bấm mở nhật ký trao đổi'}
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <span style={{ fontFamily: 'var(--f-num)', fontWeight: 700, color: 'var(--teal)' }}>
                          {p.code}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', paddingLeft: '22px' }}>
                        {dmy(p.date)}
                      </div>
                    </td>

                    {/* Cột 2: Tiêu đề */}
                    <td style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px' }}>
                      <div style={{ fontWeight: 600, color: isExpanded ? '#2563eb' : 'var(--ink)', fontSize: '13.5px' }}>
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

                    {/* Cột 7: Thao tác */}
                    <td style={{ verticalAlign: 'top', paddingTop: '14px', paddingBottom: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        {/* Nút Toggle Trao Đổi */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(p.id);
                          }}
                          className="btn btn-ghost xs"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isExpanded ? '#2563eb' : 'var(--teal)',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '3px 8px'
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>Trao đổi ({threadList.length})</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        {/* Thao tác Phê duyệt nhanh nếu có quyền */}
                        {canReview && p.status === 'pending_admin' && (
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
                            </button>
                          </div>
                        )}

                        {(uiRole === 'master' || uiRole === 'giau') && p.status !== 'approved' && (
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
                              <span>Duyệt</span>
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
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Dòng Mở Rộng Dropdown: Nhật Ký Trao Đổi Chi Tiết Chuẩn Theo Mẫu Ảnh */}
                  {isExpanded && (
                    <tr style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'rgba(59, 130, 246, 0.02)' }}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <div
                          style={{
                            margin: '8px 14px 16px 20px',
                            padding: '16px 20px',
                            backgroundColor: 'var(--panel-2)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #3b82f6', // Viền xanh dọc bên trái chuẩn 1-1 ảnh mẫu
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                          }}
                        >
                          {/* Banner Tiêu Đề Của Bảng Con */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MessageSquare size={16} style={{ color: '#3b82f6' }} />
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                                Nhật Ký Trao Đổi & Giải Trình Email (Inbound Threading) — [{p.code}] {p.title}
                              </span>
                            </div>

                            {p.resendSentAt && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#c2410c', backgroundColor: 'rgba(249, 115, 22, 0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                                <Mail size={12} />
                                <span>Resend Auto-CC: {p.resendSentAt}</span>
                              </div>
                            )}
                          </div>

                          {/* Bảng Con 6 Cột Đúng Theo Yêu Cầu Của Master */}
                          <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
                            <table style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'collapse', backgroundColor: 'var(--bg)', borderRadius: '6px', overflow: 'hidden' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', borderBottom: '1px solid var(--line)' }}>
                                  <th style={{ width: '50px', textAlign: 'center', padding: '8px 6px' }}>STT</th>
                                  <th style={{ width: '130px', padding: '8px 10px' }}>Ngày</th>
                                  <th style={{ width: '180px', padding: '8px 10px' }}>Tiêu đề</th>
                                  <th style={{ padding: '8px 10px' }}>Nội dung trao đổi</th>
                                  <th style={{ width: '160px', padding: '8px 10px' }}>Người gửi</th>
                                  <th style={{ width: '130px', textAlign: 'center', padding: '8px 10px' }}>Thao tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {threadList.map((th, tIdx) => {
                                  const threadSubject = th.isInboundReply 
                                    ? `Re: [${p.code}] Giải trình kế hoạch`
                                    : `Chỉ đạo [${p.code}]`;

                                  return (
                                    <tr 
                                      key={th.id} 
                                      style={{ 
                                        borderBottom: '1px solid var(--line)',
                                        backgroundColor: th.isInboundReply ? 'rgba(59, 130, 246, 0.04)' : undefined 
                                      }}
                                    >
                                      {/* Cột 1: STT */}
                                      <td style={{ textAlign: 'center', padding: '8px 6px', color: 'var(--muted)', fontWeight: 600 }}>
                                        {tIdx + 1}
                                      </td>

                                      {/* Cột 2: Ngày */}
                                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', fontFamily: 'var(--f-num)', color: 'var(--ink)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Clock size={11} style={{ opacity: 0.6 }} />
                                          <span>{th.createdAt}</span>
                                        </div>
                                      </td>

                                      {/* Cột 3: Tiêu đề */}
                                      <td style={{ padding: '8px 10px', fontWeight: 600, color: th.isInboundReply ? '#2563eb' : 'var(--ink)' }}>
                                        {threadSubject}
                                      </td>

                                      {/* Cột 4: Nội dung */}
                                      <td style={{ padding: '8px 10px', color: 'var(--ink)', lineHeight: 1.4 }}>
                                        {th.content}
                                      </td>

                                      {/* Cột 5: Người gửi */}
                                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                                        <div style={{ fontWeight: 600, color: th.isInboundReply ? '#2563eb' : 'var(--teal)' }}>
                                          {th.sender}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                          {th.isInboundReply ? '✉️ Email Inbound' : `Vai trò: ${th.role}`}
                                        </div>
                                      </td>

                                      {/* Cột 6: Thao tác (Xem, Phản hồi) */}
                                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                                          <button
                                            type="button"
                                            onClick={() => setViewingThread(th)}
                                            className="btn btn-ghost xs"
                                            style={{ padding: '3px 6px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
                                            title="Xem toàn văn nội dung trao đổi"
                                          >
                                            <Eye size={12} />
                                            <span>Xem</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentVal = replyInputs[p.id] || '';
                                              handleReplyChange(p.id, currentVal ? `${currentVal} ` : `@${th.sender}: `);
                                            }}
                                            className="btn btn-ghost xs"
                                            style={{ padding: '3px 6px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#2563eb' }}
                                            title="Bấm để trả lời nhanh người gửi này"
                                          >
                                            <Reply size={12} />
                                            <span>Phản hồi</span>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {threadList.length === 0 && (
                                  <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)' }}>
                                      Chưa có nhật ký trao đổi nào cho kế hoạch này. Hãy nhập phản hồi bên dưới.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Khung Gửi Phản Hồi / Chỉ Đạo Trực Tiếp Tại Chỗ */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                            <textarea
                              rows={2}
                              placeholder="Nhập nội dung phản hồi, giải trình hoặc chỉ đạo giải ngân..."
                              value={replyInputs[p.id] || ''}
                              onChange={(e) => handleReplyChange(p.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                fontSize: '12.5px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                background: 'var(--panel-2)',
                                color: 'var(--fg)',
                                resize: 'none'
                              }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                type="button"
                                className="btn xs"
                                onClick={() => handleSendReply(p.id, true)}
                                title="Giả lập nhân viên nhận email qua Resend và bấm Reply giải trình trực tiếp"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}
                              >
                                <CornerDownRight size={12} />
                                <span>Giả lập Inbound Reply (Email)</span>
                              </button>

                              <button
                                type="button"
                                className="btn xs primary"
                                onClick={() => handleSendReply(p.id, false)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Send size={12} />
                                <span>Gửi phản hồi</span>
                              </button>
                            </div>
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

      {/* Modal Popup Xem Chi Tiết Tin Nhắn / Email Trao Đổi */}
      {viewingThread && (
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
          onClick={() => setViewingThread(null)}
        >
          <div 
            className="card-box" 
            style={{ 
              width: '500px', 
              maxWidth: '92vw', 
              padding: '24px', 
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} style={{ color: '#3b82f6' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  Chi Tiết Nhật Ký Trao Đổi
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setViewingThread(null)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 6px', fontSize: '16px', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Người gửi: </span>
                <b style={{ color: viewingThread.isInboundReply ? '#2563eb' : 'var(--teal)' }}>{viewingThread.sender}</b>
                <span style={{ fontSize: '11.5px', color: 'var(--muted)', marginLeft: '6px' }}>
                  ({viewingThread.isInboundReply ? '✉️ Phản hồi qua Email Inbound' : `Vai trò: ${viewingThread.role}`})
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Thời gian: </span>
                <span style={{ fontFamily: 'var(--f-num)' }}>{viewingThread.createdAt}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Nội dung chi tiết:</div>
                <div style={{ padding: '12px', backgroundColor: 'var(--panel-2)', borderRadius: '6px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {viewingThread.content}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="btn primary sm"
                onClick={() => setViewingThread(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
