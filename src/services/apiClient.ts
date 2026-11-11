/**
 * API Client kết nối Frontend với Local Backend (PostgreSQL + Google Sheet Sync)
 */

import { AppState, Transaction, Contract } from '../types';

export const apiClient = {
  /**
   * Kiểm tra tình trạng kết nối Backend & PostgreSQL
   */
  async checkHealth(): Promise<{ status: string; database?: string; googleSheetSyncEnabled?: boolean } | null> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Tải toàn bộ AppState từ PostgreSQL qua Local Backend
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
   * Lưu chấm công nhân sự
   */
  async saveAttendance(staffId: string, dateIso: string, val: any): Promise<boolean> {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, dateIso, val })
      });
      return res.ok;
    } catch (e) {
      console.warn('[ApiClient] Lỗi lưu chấm công sang Backend:', e);
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
   * Tính toán lại và đồng bộ sang Google Sheet
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
   * Đồng bộ hai chiều - Chiều 2: Đẩy toàn bộ dữ liệu từ PostgreSQL lên làm mới Google Sheet (DB -> Sheet)
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
  }
};

