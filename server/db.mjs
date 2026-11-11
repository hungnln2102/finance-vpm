/**
 * =========================================================================
 * CENTRAL DATABASE BARREL EXPORTER (DOMAIN-DRIVEN RE-EXPORTS)
 * =========================================================================
 * Tái cấu trúc theo chuẩn Domain-Driven Architecture.
 * Tất cả các hàm được tổ chức trong server/domains/ và được re-export tại đây
 * để đảm bảo tính tương thích ngược 100% với toàn bộ codebase.
 */

// Connection Pool & Transaction Helper
export { pool, withTransaction, checkDbHealth, SCHEMA, DATABASE_URL } from './config/dbPool.mjs';

// Schema SSOT
export { TABLES, tableName } from './config/dbSchema.mjs';

// Database Initializer & Seed
export { initDb } from './domains/init/initDbService.mjs';

// Full State Query
export { getFullState } from './domains/state/stateService.mjs';

// Accounts Domain
export { getAccounts, upsertAccount, deleteAccount } from './domains/accounts/accountsService.mjs';

// Ledger Domain (Transactions & Monthly Balances)
export { 
  insertTransaction, 
  updateTransaction, 
  deleteTransaction, 
  recalculateMonthlyBalances, 
  getMonthlyBalances, 
  rolloverNewMonth, 
  resetLedgerToCurrentMonth 
} from './domains/ledger/ledgerService.mjs';

// Contracts Domain
export { 
  insertContract, 
  deleteContract, 
  approveContractDiscount 
} from './domains/contracts/contractsService.mjs';

// Attendance & Staff Domain
export { 
  saveAttendance, 
  upsertStaff, 
  deleteStaff 
} from './domains/attendance/attendanceService.mjs';

// Proposals Domain
export { 
  upsertProposal, 
  deleteProposal 
} from './domains/proposals/proposalsService.mjs';

// Budget Domain
export { 
  upsertCostAdjustment 
} from './domains/budget/budgetService.mjs';

// Gifts Domain
export { 
  insertGiftMovement 
} from './domains/gifts/giftsService.mjs';

// Audit Domain
export { 
  recordAuditLog, 
  getAuditLogs 
} from './domains/audit/auditService.mjs';

// Sync Domain
export { 
  importSheetDataToPostgres 
} from './domains/sync/syncService.mjs';
