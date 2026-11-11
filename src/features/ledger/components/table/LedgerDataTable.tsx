import React from 'react';
import { Transaction } from '../../../../types';
import { TYPES, CATS } from '../../../../data/constants';
import { fmt, dmy } from '../../../../utils/formatters';
import { txIssues } from '../../../../services/financeService';
import { AlertCircle, FileText, Edit3 } from 'lucide-react';

interface LedgerDataTableProps {
  rows: Transaction[];
  editTxId: string | null;
  canEdit: boolean;
  locked: boolean;
  onEditTx: (id: string) => void;
}

export const LedgerDataTable: React.FC<LedgerDataTableProps> = ({
  rows,
  editTxId,
  canEdit,
  locked,
  onEditTx
}) => {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Mã</th>
            <th>Tài khoản</th>
            <th>Diễn giải & Chứng từ</th>
            <th>Phân loại</th>
            <th className="num">Thu</th>
            <th className="num">Chi</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const issues = txIssues(t);

            return (
              <tr key={t.id} style={editTxId === t.id ? { background: 'var(--teal-soft)' } : undefined}>
                <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--f-num)' }}>{dmy(t.date)}</td>
                <td style={{ fontFamily: 'var(--f-num)', fontWeight: 600 }}>{t.id}</td>
                <td>
                  <span className="chip">{t.acc}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{t.desc}</div>
                  {issues.map((iss, idx) => (
                    <div key={idx} style={{ color: 'var(--bad)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <AlertCircle size={11} />
                      <span>{iss}</span>
                    </div>
                  ))}
                  {t.doc && (
                    <span style={{ fontSize: '11px', color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                      <FileText size={11} />
                      <span>{t.doc}</span>
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{TYPES[t.type]?.l || t.type}</div>
                  {t.cat && (
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {CATS[t.cat] || t.cat}
                    </div>
                  )}
                  {t.contract && (
                    <div style={{ fontSize: '11px', color: 'var(--teal)' }}>
                      HĐ: {t.contract}
                    </div>
                  )}
                </td>
                <td className="num" style={{ color: t.dir === 'in' ? 'var(--good)' : undefined, fontWeight: t.dir === 'in' ? 600 : 400 }}>
                  {t.dir === 'in' ? fmt(t.amt) : ''}
                </td>
                <td className="num" style={{ color: t.dir === 'out' ? 'var(--bad)' : undefined, fontWeight: t.dir === 'out' ? 600 : 400 }}>
                  {t.dir === 'out' ? fmt(t.amt) : ''}
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {canEdit && !locked && (
                    <button
                      type="button"
                      className="btn xs"
                      onClick={() => onEditTx(t.id)}
                      title="Sửa phân loại hoặc thông tin"
                    >
                      <Edit3 size={12} />
                      <span>Sửa</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                Không có giao dịch nào phù hợp bộ lọc
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
