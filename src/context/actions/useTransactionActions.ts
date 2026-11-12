import { useCallback } from 'react';
import { AppState, UIState, Transaction, BankWebhookLog } from '../../types';
import { TODAY, ROLES } from '../../data/constants';
import { mon, monthLabel, fmt } from '../../utils/formatters';
import { apiClient } from '../../services/apiClient';
import { ToastState } from './useAppUiState';

interface UseTransactionActionsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  ui: UIState;
  setUi: React.Dispatch<React.SetStateAction<UIState>>;
  addLog: (what: string) => void;
  showToast: (message: string, type?: ToastState['type']) => void;
}

export function useTransactionActions({
  state,
  setState,
  ui,
  setUi,
  addLog,
  showToast
}: UseTransactionActionsProps) {
  const addTransaction = useCallback(
    (data: {
      date: string;
      acc: string;
      dir?: 'in' | 'out';
      type?: Transaction['type'];
      amt: number;
      cat?: string;
      contract?: string;
      desc: string;
      docFile?: File | null;
      proposalId?: string;
      receipts?: import('../../types').TransactionReceipt[];
    }) => {
      const isLockedMonth = !!state.locks[mon(data.date)];
      if (isLockedMonth) {
        showToast(monthLabel(mon(data.date)) + ' đã khóa sổ', 'error');
        return;
      }

      const nextId = 'N' + String(state.tx.length + 1).padStart(4, '0');
      const resolvedDir = data.dir || (data.type && ['OPEX', 'UNG_PHI', 'HOAN_UNG', 'CHUYEN_DFAM', 'TAM_UNG'].includes(data.type) ? 'out' : 'in');
      const resolvedType: Transaction['type'] = data.type || (resolvedDir === 'out' ? 'OPEX' : (data.contract ? 'THU_KH' : 'THU_KHAC'));
      
      let initStatus: Transaction['status'] = 'draft';
      if (ui.role === 'admin' || ui.role === 'vpm') {
        initStatus = 'pending_master';
      } else if (ui.role === 'master' || ui.role === 'giau') {
        initStatus = 'posted';
      } else {
        initStatus = 'pending_admin';
      }

      const defaultReceipts = data.receipts && data.receipts.length > 0 
        ? data.receipts 
        : (data.docFile ? [{
            id: 'REC-' + nextId,
            code: data.docFile.name,
            amount: Math.round(data.amt),
            date: data.date,
            note: data.desc.trim()
          }] : []);

      const newTx: Transaction = {
        id: nextId,
        date: data.date,
        acc: data.acc,
        dir: resolvedDir,
        amt: Math.round(data.amt),
        desc: data.desc.trim(),
        type: resolvedType,
        cat: resolvedDir === 'out' ? (data.cat || '') : '',
        contract: data.contract || '',
        flags: [],
        status: initStatus,
        doc: data.docFile ? data.docFile.name : (defaultReceipts[0]?.code || ''),
        proposalId: data.proposalId || '',
        receipts: defaultReceipts,
        src: 'Nhập bởi ' + ROLES[ui.role]
      };

      setState((prev) => {
        const list = [...prev.tx, newTx];
        list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
        return { ...prev, tx: list };
      });

      apiClient.addTransaction(newTx);
      addLog(`Ghi ${newTx.id} · ${newTx.desc} · ${fmt(newTx.amt)} đ`);
      setUi((prev) => ({ ...prev, month: mon(data.date) }));

      if (newTx.status === 'pending_admin' || newTx.status === 'draft') {
        showToast('Đã ghi chứng từ, chuyển Admin xem xét đối chiếu Webhook', 'info');
      } else if (newTx.status === 'pending_master') {
        showToast('Đã ghi chứng từ, chuyển Sếp Mavryk duyệt', 'warn');
      } else {
        showToast('Đã ghi nhận chính thức vào Sổ Cái (PostgreSQL & Sheet)', 'success');
      }
    },
    [state.locks, state.tx.length, ui.role, addLog, showToast, setState, setUi]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      setState((prev) => {
        const list = prev.tx.map((t) => (t.id === id ? { ...t, ...updates } : t));
        list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
        return { ...prev, tx: list };
      });
      apiClient.updateTransaction(id, updates);
      addLog(`Cập nhật giao dịch ${id}`);
      showToast('Đã lưu phân loại giao dịch (PostgreSQL & Sheet)', 'success');
    },
    [addLog, showToast, setState]
  );

  const checkTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'pending_master' } : t))
      }));
      apiClient.updateTransaction(id, { status: 'pending_master' });
      addLog(`Admin sơ duyệt ${tx.id} · ${tx.desc}`);
      showToast('Đã sơ duyệt, chuyển tiếp Master phê duyệt', 'success');
    },
    [state.tx, addLog, showToast, setState]
  );

  const forwardTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'pending_master' } : t))
      }));
      apiClient.updateTransaction(id, { status: 'pending_master' });
      addLog(`Admin chuyển tiếp ${tx.id} lên Master`);
      showToast('Đã chuyển tiếp lên Master phê duyệt', 'success');
    },
    [state.tx, addLog, showToast, setState]
  );

  const postTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'posted' } : t))
      }));
      apiClient.updateTransaction(id, { status: 'posted' });
      addLog(`Master phê duyệt cuối cùng đưa vào Sổ Cái: ${tx.id}`);
      showToast('👑 Đã ghi nhận chính thức vào Sổ Cái (Posted)', 'success');
    },
    [state.tx, addLog, showToast, setState]
  );

  const returnTransaction = useCallback(
    (id: string, reason?: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      const noteMsg = reason || 'Admin yêu cầu bổ sung chứng từ';
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'returned', note: noteMsg } : t))
      }));
      apiClient.updateTransaction(id, { status: 'returned' });
      addLog(`Trả lại ${tx.id}: ${noteMsg}`);
      showToast('Đã trả lại cho nhân viên nhập liệu', 'warn');
    },
    [state.tx, addLog, showToast, setState]
  );

  const rejectTransaction = useCallback(
    (id: string, reason?: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      const noteMsg = reason || 'Từ chối giao dịch';
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'rejected', note: noteMsg } : t))
      }));
      apiClient.updateTransaction(id, { status: 'rejected' });
      addLog(`Từ chối giao dịch ${tx.id}: ${noteMsg}`);
      showToast('Đã từ chối giao dịch', 'error');
    },
    [state.tx, addLog, showToast, setState]
  );

  const approveTransaction = useCallback(
    (id: string) => {
      const tx = state.tx.find((t) => t.id === id);
      if (!tx) return;
      setState((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === id ? { ...t, status: 'posted' } : t))
      }));
      apiClient.updateTransaction(id, { status: 'posted' });
      addLog(`Duyệt chốt sổ ${tx.id} · ${fmt(tx.amt)} đ`);
      showToast('👑 Đã phê duyệt chốt vào Sổ Cái (Posted)', 'success');
    },
    [state.tx, addLog, showToast, setState]
  );

  const simulateWebhook = useCallback(
    (options?: { dir?: 'in' | 'out'; amount?: number; desc?: string; acc?: string }) => {
      const dir = options?.dir || (Math.random() > 0.35 ? 'in' : 'out');
      const amount = options?.amount || [5000000, 10000000, 15000000, 20000000, 25000000, 35000000][Math.floor(Math.random() * 6)];
      const sampleDescsIn = [
        'KHACH HANG NGUYEN VAN CUONG THANH TOAN HD KH012',
        'TU VAN VIEN THAO TRA NO TAM UNG HOP DONG TV03',
        'DFAM CAP VON KINH DOANH THANG 10 HOI THAO',
        'CHI TRA HOA HONG KINH DOANH THANG 9'
      ];
      const sampleDescsOut = [
        'THANH TOAN TIEN THUE MAT BANG VAN PHONG',
        'CHI PHI IN AN BROCHURE AN PHAM HOI THAO',
        'MUA QUA TANG BOC THAM KHACH HANG VIP'
      ];
      const desc = options?.desc || (dir === 'in' ? sampleDescsIn[Math.floor(Math.random() * sampleDescsIn.length)] : sampleDescsOut[Math.floor(Math.random() * sampleDescsOut.length)]);
      const bankTxId = 'ACB-' + Math.floor(100000000 + Math.random() * 900000000);
      const newWebhookId = 'WH-' + String(state.webhooks.length + 1).padStart(3, '0');

      const matchTx = state.tx.find(
        (t) => t.amt === amount && t.dir === dir && ['draft', 'pending_admin', 'pending'].includes(t.status)
      );

      // Nếu không khớp giao dịch có sẵn: Tạo ngay giao dịch mới trừ tiền tài sản tức thì và đưa vào tab "Chưa liệt kê"
      let createdTxItem: Transaction | null = null;
      if (!matchTx) {
        const nextId = 'N' + String(state.tx.length + 1).padStart(4, '0');
        createdTxItem = {
          id: nextId,
          date: TODAY,
          acc: options?.acc || 'ACB',
          dir,
          amt: amount,
          desc: desc,
          type: dir === 'out' ? 'OPEX' : 'THU_KHAC',
          cat: '',
          contract: '',
          proposalId: '',
          flags: ['unlisted'],
          status: 'pending',
          doc: `Biên lai ${bankTxId}`,
          receipts: [
            {
              id: 'REC-' + bankTxId,
              code: `BL-${bankTxId}`,
              amount: amount,
              date: TODAY,
              vendor: dir === 'out' ? 'Đối tác chưa xác định' : 'Khách hàng ACB',
              note: desc
            }
          ],
          src: 'Webhook ACB (Biên lai số)'
        };
      }

      const newLog: BankWebhookLog = {
        id: newWebhookId,
        bankTxId,
        date: TODAY,
        acc: (options?.acc as any) || 'ACB',
        dir,
        amount,
        description: desc,
        status: matchTx ? 'auto_matched' : 'unmatched',
        matchedTxId: matchTx ? matchTx.id : (createdTxItem ? createdTxItem.id : undefined)
      };

      setState((prev) => {
        let updatedTx = prev.tx;
        if (matchTx) {
          updatedTx = prev.tx.map((t) =>
            t.id === matchTx.id
              ? {
                  ...t,
                  status: 'pending_master',
                  doc: (t.doc ? t.doc + ', ' : '') + `Biên lai ${bankTxId}`,
                  receipts: [
                    ...(t.receipts || []),
                    {
                      id: 'REC-' + bankTxId,
                      code: `BL-${bankTxId}`,
                      amount: amount,
                      date: TODAY,
                      vendor: 'Ngân hàng ACB',
                      note: desc
                    }
                  ]
                }
              : t
          );
        } else if (createdTxItem) {
          updatedTx = [...prev.tx, createdTxItem];
          updatedTx.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
        }

        return {
          ...prev,
          webhooks: [newLog, ...prev.webhooks],
          tx: updatedTx
        };
      });

      if (createdTxItem) {
        apiClient.addTransaction(createdTxItem);
      }

      addLog(`Nhận Webhook ACB ${bankTxId} (${dir === 'in' ? '+' : '-'}${fmt(amount)} đ)`);
      if (matchTx) {
        showToast(`⚡ Webhook Auto-Matched: Khớp tự động chứng từ ${matchTx.id} (${fmt(amount)} đ)!`, 'success');
      } else {
        showToast(`⚡ Nhận biên lai ${bankTxId} (${dir === 'in' ? '+' : '-'}${fmt(amount)} đ): Đã trừ tiền tài sản ACB và đưa vào Chưa liệt kê`, 'warn');
      }
    },
    [state.webhooks.length, state.tx, addLog, showToast, setState]
  );

  const matchWebhook = useCallback(
    (webhookId: string, txId: string) => {
      const wh = state.webhooks.find((w) => w.id === webhookId);
      const tx = state.tx.find((t) => t.id === txId);
      if (!wh || !tx) return;

      setState((prev) => ({
        ...prev,
        webhooks: prev.webhooks.map((w) =>
          w.id === webhookId ? { ...w, status: 'matched', matchedTxId: txId } : w
        ),
        tx: prev.tx.map((t) =>
          t.id === txId
            ? {
                ...t,
                status: t.status === 'draft' ? 'pending_admin' : t.status,
                doc: (t.doc ? t.doc + ', ' : '') + `Biên lai ${wh.bankTxId}`
              }
            : t
        )
      }));

      addLog(`Khớp Webhook ${wh.bankTxId} với chứng từ ${tx.id}`);
      showToast(`Đã khớp biên lai ${wh.bankTxId} với chứng từ ${tx.id}`, 'success');
    },
    [state.webhooks, state.tx, addLog, showToast, setState]
  );

  return {
    addTransaction,
    updateTransaction,
    checkTransaction,
    forwardTransaction,
    postTransaction,
    returnTransaction,
    rejectTransaction,
    approveTransaction,
    simulateWebhook,
    matchWebhook
  };
}
