import { SCHEMA } from './dbPool.mjs';

/**
 * Single Source of Truth (SSOT) cho tên bảng và cột trong PostgreSQL
 * Tuân thủ quy định tại db-schema-source-of-truth trong AGENTS.md
 */

export const TABLES = {
  TRANSACTIONS: 'transactions',
  CONTRACTS: 'contracts',
  ACCOUNTS: 'accounts',
  USER_ACCOUNTS: 'user_accounts',
  AUTH_SESSIONS: 'auth_sessions',
  ATTENDANCE: 'attendance',
  STAFF: 'staff',
  GIFT_ITEMS: 'gift_items',
  GIFT_MOVEMENTS: 'gift_movements',
  PROPOSALS: 'proposals',
  COST_ADJUSTMENTS: 'cost_adjustments',
  MONTHLY_BALANCES: 'monthly_balances',
  AUDIT_LOGS: 'audit_logs',
  APP_METADATA: 'app_metadata'
};

export function tableName(table) {
  return `${SCHEMA}.${table}`;
}
