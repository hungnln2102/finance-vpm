/**
 * Google Apps Script (GAS) Bridge Service
 * Cầu nối dữ liệu giữa React Frontend và Google Apps Script Backend (Google Sheets)
 */

import { AppState, Transaction, Contract, GiftMovement } from '../types';

declare global {
  interface Window {
    google?: {
      script?: {
        run: {
          withSuccessHandler: (fn: (res: any) => void) => {
            withFailureHandler: (fn: (err: any) => void) => any;
          };
          [key: string]: any;
        };
      };
    };
  }
}

export const isGasEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
         Boolean(window.google?.script?.run);
};

const getRunner = () => {
  if (typeof window !== 'undefined' && window.google?.script?.run) {
    return window.google.script.run;
  }
  return null;
};

export const gasService = {
  /**
   * Tải toàn bộ AppState từ Google Sheets qua Apps Script
   */
  async fetchInitialData(): Promise<AppState | null> {
    const runner = getRunner();
    if (!runner) return null;

    return new Promise((resolve) => {
      try {
        runner
          .withSuccessHandler((result: any) => {
            if (result && typeof result === 'object') {
              resolve(result as AppState);
            } else if (typeof result === 'string') {
              try {
                resolve(JSON.parse(result) as AppState);
              } catch {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          })
          .withFailureHandler((err: any) => {
            console.warn('[GAS] Lỗi khi tải dữ liệu từ Google Sheets:', err);
            resolve(null);
          })
          .getInitialState();
      } catch (e) {
        console.warn('[GAS] Không thể gọi google.script.run.getInitialState:', e);
        resolve(null);
      }
    });
  },

  /**
   * Lưu hoặc cập nhật một giao dịch lên Google Sheets
   */
  addTransaction(tx: Transaction): void {
    const runner = getRunner();
    if (!runner) return;
    try {
      runner
        .withSuccessHandler(() => console.log('[GAS] Thêm giao dịch thành công:', tx.id))
        .withFailureHandler((err: any) => console.error('[GAS] Lỗi thêm giao dịch:', err))
        .apiAddTransaction(JSON.stringify(tx));
    } catch (e) {
      console.warn('[GAS] Lỗi gọi apiAddTransaction:', e);
    }
  },

  /**
   * Cập nhật giao dịch
   */
  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const runner = getRunner();
    if (!runner) return;
    try {
      runner
        .withSuccessHandler(() => console.log('[GAS] Cập nhật giao dịch thành công:', id))
        .withFailureHandler((err: any) => console.error('[GAS] Lỗi cập nhật giao dịch:', err))
        .apiUpdateTransaction(id, JSON.stringify(updates));
    } catch (e) {
      console.warn('[GAS] Lỗi gọi apiUpdateTransaction:', e);
    }
  },

  /**
   * Thêm hợp đồng công nợ mới
   */
  addContract(c: Contract): void {
    const runner = getRunner();
    if (!runner) return;
    try {
      runner
        .withSuccessHandler(() => console.log('[GAS] Thêm hợp đồng thành công:', c.id))
        .withFailureHandler((err: any) => console.error('[GAS] Lỗi thêm hợp đồng:', err))
        .apiAddContract(JSON.stringify(c));
    } catch (e) {
      console.warn('[GAS] Lỗi gọi apiAddContract:', e);
    }
  },

  /**
   * Thêm phiếu xuất/nhập quà tặng
   */
  addGiftMovement(mv: GiftMovement): void {
    const runner = getRunner();
    if (!runner) return;
    try {
      runner
        .withSuccessHandler(() => console.log('[GAS] Lưu phiếu quà tặng thành công'))
        .withFailureHandler((err: any) => console.error('[GAS] Lỗi lưu quà tặng:', err))
        .apiAddGiftMovement(JSON.stringify(mv));
    } catch (e) {
      console.warn('[GAS] Lỗi gọi apiAddGiftMovement:', e);
    }
  },

  /**
   * Lưu chấm công nhân sự
   */
  saveAttendance(staffId: string, dateIso: string, val: any): void {
    const runner = getRunner();
    if (!runner) return;
    try {
      runner
        .withSuccessHandler(() => console.log('[GAS] Cập nhật công:', staffId, dateIso, val))
        .withFailureHandler((err: any) => console.error('[GAS] Lỗi cập nhật công:', err))
        .apiSaveAttendance(staffId, dateIso, val);
    } catch (e) {
      console.warn('[GAS] Lỗi gọi apiSaveAttendance:', e);
    }
  },

  /**
   * Cập nhật ngân sách tháng
   */
  updateBudget(month: string, category: string, amount: number): void {
    const runner = getRunner();
    if (!runner) return;
    try {
      runner
        .withSuccessHandler(() => console.log('[GAS] Cập nhật ngân sách:', month, category))
        .withFailureHandler((err: any) => console.error('[GAS] Lỗi cập nhật ngân sách:', err))
        .apiUpdateBudget(month, category, amount);
    } catch (e) {
      console.warn('[GAS] Lỗi gọi apiUpdateBudget:', e);
    }
  },

  /**
   * Khóa hoặc mở khóa sổ tháng
   */
  setMonthLock(month: string, locked: boolean, lockedBy: string): void {
    const runner = getRunner();
    if (!runner) return;
    try {
      runner
        .withSuccessHandler(() => console.log('[GAS] Khóa sổ tháng thành công:', month, locked))
        .withFailureHandler((err: any) => console.error('[GAS] Lỗi khóa sổ:', err))
        .apiSetMonthLock(month, locked, lockedBy);
    } catch (e) {
      console.warn('[GAS] Lỗi gọi apiSetMonthLock:', e);
    }
  },

  /**
   * Đồng bộ toàn bộ state sang Sheets (dự phòng)
   */
  syncFullState(state: AppState): void {
    const runner = getRunner();
    if (!runner) return;
    try {
      runner
        .withSuccessHandler(() => console.log('[GAS] Đồng bộ toàn bộ dữ liệu thành công'))
        .withFailureHandler((err: any) => console.error('[GAS] Lỗi đồng bộ dữ liệu:', err))
        .apiSyncFullState(JSON.stringify(state));
    } catch (e) {
      console.warn('[GAS] Lỗi gọi apiSyncFullState:', e);
    }
  }
};
