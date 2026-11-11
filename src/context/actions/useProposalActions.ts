import { useCallback } from 'react';
import { AppState, UIState, Proposal, ProposalThread } from '../../types';
import { TODAY, ROLES } from '../../data/constants';
import { fmt } from '../../utils/formatters';
import { apiClient } from '../../services/apiClient';
import { ToastState } from './useAppUiState';

interface UseProposalActionsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  ui: UIState;
  addLog: (what: string) => void;
  showToast: (message: string, type?: ToastState['type']) => void;
}

export function useProposalActions({
  state,
  setState,
  ui,
  addLog,
  showToast
}: UseProposalActionsProps) {
  const submitProposal = useCallback(
    (data: {
      title: string;
      creator: string;
      creatorEmail: string;
      department: string;
      amount: number;
      date: string;
      description: string;
      ccEmails?: string[];
    }) => {
      const nextNum = state.proposals.length + 1;
      const code = `KH-2026-10-${String(nextNum).padStart(2, '0')}`;
      const newProp: Proposal = {
        id: `PROP-${String(nextNum).padStart(2, '0')}`,
        code,
        title: data.title.trim(),
        creator: data.creator.trim(),
        creatorEmail: data.creatorEmail.trim(),
        department: data.department.trim(),
        amount: Math.round(data.amount),
        date: data.date || TODAY,
        description: data.description.trim(),
        status: 'pending_admin',
        resendSentAt: TODAY + ' ' + new Date().toTimeString().slice(0, 5),
        ccEmails: data.ccEmails || [data.creatorEmail],
        threads: [
          {
            id: `TH-${Date.now()}`,
            sender: `${data.creator} (Operator)`,
            role: 'operator',
            content: `Khởi tạo kế hoạch đệ trình qua Resend. Tự động CC tới: ${data.creatorEmail}`,
            createdAt: TODAY + ' ' + new Date().toTimeString().slice(0, 5)
          }
        ]
      };

      setState((prev) => ({
        ...prev,
        proposals: [newProp, ...prev.proposals]
      }));

      apiClient.submitProposal(newProp);
      addLog(`Lập kế hoạch đệ trình ${newProp.code} · ${fmt(newProp.amount)} đ`);
      showToast(`Đã đệ trình kế hoạch ${newProp.code} (Resend Email Outbound & CC nhân viên)`, 'success');
    },
    [state.proposals.length, addLog, showToast, setState]
  );

  const reviewProposal = useCallback(
    (id: string, status: 'pending_master' | 'approved' | 'rejected', comment?: string) => {
      const prop = state.proposals.find((p) => p.id === id);
      if (!prop) return;

      const newThread: ProposalThread = {
        id: `TH-${Date.now()}`,
        sender: ROLES[ui.role],
        role: ui.role,
        content: comment || (status === 'approved' ? 'Phê duyệt kế hoạch.' : status === 'pending_master' ? 'Sơ duyệt chuyển lên Master.' : 'Từ chối kế hoạch.'),
        createdAt: TODAY + ' ' + new Date().toTimeString().slice(0, 5)
      };

      setState((prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                threads: [...p.threads, newThread]
              }
            : p
        )
      }));

      apiClient.updateProposal(id, { status, threads: [...prop.threads, newThread] });
      addLog(`${ROLES[ui.role]} cập nhật trạng thái đề xuất ${prop.code} ➔ ${status}`);
      showToast(`Đã cập nhật đệ trình: ${status === 'approved' ? 'Phê duyệt' : status === 'pending_master' ? 'Chuyển Master' : 'Từ chối'}`, 'success');
    },
    [state.proposals, ui.role, addLog, showToast, setState]
  );

  const addProposalThread = useCallback(
    (proposalId: string, content: string, isInboundReply?: boolean) => {
      if (!content.trim()) return;
      const prop = state.proposals.find((p) => p.id === proposalId);
      const newThread: ProposalThread = {
        id: `TH-${Date.now()}`,
        sender: ROLES[ui.role],
        role: ui.role,
        content: content.trim(),
        createdAt: TODAY + ' ' + new Date().toTimeString().slice(0, 5),
        isInboundReply
      };

      setState((prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === proposalId
            ? { ...p, threads: [...p.threads, newThread] }
            : p
        )
      }));

      if (prop) {
        apiClient.updateProposal(proposalId, { threads: [...prop.threads, newThread] });
      }
      addLog(`Phản hồi trao đổi kế hoạch ${proposalId}`);
      showToast(isInboundReply ? 'Đã nhận nội dung giải trình qua Email (Inbound Threading)' : 'Đã đăng trao đổi', 'success');
    },
    [state.proposals, ui.role, addLog, showToast, setState]
  );

  return {
    submitProposal,
    reviewProposal,
    addProposalThread
  };
}
