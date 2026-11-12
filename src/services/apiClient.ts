/**
 * API Client kết nối Frontend với Local Backend (PostgreSQL + Google Sheet Dual-Sync)
 */

import { AppState, Transaction, Contract, AccountItem, Proposal, CostAdjustment, GiftMovement } from '../types';

export const apiClient = {
  /**
   * Kiểm tra tình trạng kết nối Backend & PostgreSQL
   */
  async checkHealth(): Promise<{ status: string; database?: string; googleSheetSyncEnabled?: boolean } | null> {
    try {
      const res = await fetch('/api/health');
      if (!ok(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Tải toàn bộ AppState từ PostgreSQL qua Local Backend (10 bảng nghiệp vụ)
   */
  async getState(): Promise<AppState | null> {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data as AppState;
      }
      return null;
    } catch (e) {
      console.warn('[ApiClient] Không thể kết nối Backend PostgreSQL, sẽ dùng LocalStorage fallback:', e);
      return null;
    }
  },

  /**
   * Lấy danh sách tài khoản từ bảng database accounts
   */
  async getAccounts(): Promise<AccountItem[] | null> {
    try {
      const res = await fetch('/api/accounts');
      if (!res.ok) return null;
      const data = await res.json();
      return data && data.success ? data.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Lưu thông tin tài khoản
   */
  async saveAccount(acc: AccountItem): Promise<boolean> {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acc)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Bật / Tắt trạng thái tài khoản (ON/OFF)
   */
  async toggleAccountStatus(id: string, status: 'active' | 'inactive'): Promise<boolean> {
    try {
      const res = await fetch(`/api/accounts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Ghi giao dịch mới vào PostgreSQL + Google Sheet
   */
  async addTransaction(tx: Transaction): Promise<boolean> {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
      return res.ok;
    } catch (e) {
      console.warn('[ApiClient] Lỗi ghi giao dịch sang Backend:', e);
      return false;
    }
  },

  /**
   * Cập nhật giao dịch
   */
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<boolean> {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (e) {
      console.warn('[ApiClient] Lỗi cập nhật giao dịch sang Backend:', e);
      return false;
    }
  },

  /**
   * Xóa giao dịch
   */
  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Thêm hợp đồng công nợ
   */
  async addContract(c: Contract): Promise<boolean> {
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      });
      return res.ok;
    } catch (e) {
      console.warn('[ApiClient] Lỗi thêm hợp đồng sang Backend:', e);
      return false;
    }
  },

  /**
   * Xóa hợp đồng
   */
  async deleteContract(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Duyệt chiết khấu hợp đồng
   */
  async approveContractDiscount(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/contracts/${id}/approve-discount`, { method: 'PUT' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Lưu chấm công nhân sự
   */
  async saveAttendance(staffId: string, dateIso: string, val: any, staffName?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, dateIso, val, staffName })
      });
      return res.ok;
    } catch (e) {
      console.warn('[ApiClient] Lỗi lưu chấm công sang Backend:', e);
      return false;
    }
  },

  /**
   * Đệ trình kế hoạch (Proposals)
   */
  async submitProposal(p: Proposal): Promise<boolean> {
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Cập nhật đệ trình kế hoạch
   */
  async updateProposal(id: string, updates: Partial<Proposal>): Promise<boolean> {
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Thêm điều chỉnh ngân sách
   */
  async addCostAdjustment(adj: CostAdjustment): Promise<boolean> {
    try {
      const res = await fetch('/api/cost-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adj)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Thêm biến động quà tặng
   */
  async addGiftMovement(mv: GiftMovement): Promise<boolean> {
    try {
      const res = await fetch('/api/gifts/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mv)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Lấy danh sách số dư các tháng từ PostgreSQL
   */
  async getMonthlyBalances(): Promise<any[] | null> {
    try {
      const res = await fetch('/api/monthly-balances');
      if (!res.ok) return null;
      const data = await res.json();
      return data && data.success ? data.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Tính toán lại và đồng bộ sang Google Sheet tab 00_SODU_KY
   */
  async syncMonthlyBalances(): Promise<{ success: boolean; count?: number; sheetSynced?: boolean; error?: string }> {
    try {
      const res = await fetch('/api/monthly-balances/sync', { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Đồng bộ hai chiều - Chiều 1: Kéo toàn bộ dữ liệu từ Google Sheet về PostgreSQL (Sheet -> DB)
   */
  async syncSheetToDb(): Promise<{
    success: boolean;
    insertedTx?: number;
    updatedTx?: number;
    deletedTx?: number;
    totalTx?: number;
    insertedContracts?: number;
    updatedContracts?: number;
    balances?: any[];
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/sync/sheet-to-db', { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Đồng bộ hai chiều - Chiều 2: Đẩy toàn bộ 10 bảng nghiệp vụ từ PostgreSQL lên Google Sheet (DB -> Sheet)
   */
  async syncDbToSheet(): Promise<{
    success: boolean;
    txCount?: number;
    contractCount?: number;
    balanceCount?: number;
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/sync/db-to-sheet', { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Clear toàn bộ Sổ Giao Dịch Gốc & Reset số dư về kỳ hiện tại
   */
  async clearLedger(): Promise<{
    success: boolean;
    message?: string;
    balances?: any[];
    error?: string;
  }> {
    try {
      const res = await fetch('/api/ledger/clear', { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Trigger thủ công Cron tạo kỳ tháng mới (Đầu kỳ = Cuối kỳ tháng trước)
   */
  async triggerRollover(targetMonth?: string): Promise<{
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/cron/trigger-rollover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetMonth ? { targetMonth } : {})
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};

function ok(res: Response): boolean {
  return res.ok;
}
