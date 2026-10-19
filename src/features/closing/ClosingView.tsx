import React from 'react';
import { useApp } from '../../context/AppContext';
import { ROLES } from '../../data/constants';
import { fmt, fm, dmy, mon, lastDay, monthLabel } from '../../utils/formatters';
import { calculateBalance, needsApproval } from '../../services/financeService';
import { calculateGiftStock } from '../../services/inventoryService';
import { Lock, Unlock, CheckCircle2, History, AlertTriangle } from 'lucide-react';

export const ClosingView: React.FC = () => {
  const { 
    state, 
    ui, 
    canDo, 
    updateClosing, 
    lockMonth, 
    unlockMonth 
  } = useApp();

  const m = ui.month;
  const c = state.close[m] || {};
  const lastD = lastDay(m);
  const comp = calculateBalance(state.tx, 'QUY', lastD);

  const pend = state.tx.filter(
    (t) => mon(t.date) === m && (t.status === 'pending' || (t.status === 'checked' && needsApproval(t)))
  ).length;

  const unk = state.tx.filter(
    (t) => mon(t.date) === m && t.type === 'THU_KHAC' && (t.flags || []).some((f) => f.startsWith('Chưa rõ'))
  ).length;

  const stock = calculateGiftStock(state.gifts);
  const stockTotal = state.gifts.items.reduce((s, it) => s + (stock[it.id]?.balance || 0), 0);

  const bankOk = c.bank !== undefined && c.bank !== '' && Math.round(Number(c.bank)) === Math.round(comp);
  const giftOk = c.count !== undefined && c.count !== '' && Number(c.count) === stockTotal;
  const wageOk = !!c.wage;

  const checks = [
    {
      title: `Số dư sổ quỹ khớp sao kê ngày ${dmy(lastD)}`,
      passed: bankOk,
      info: <>Sổ gốc: <b>{fm(comp)}</b> đ</>,
      input: (
        <input
          type="number"
          value={c.bank ?? ''}
          placeholder="Số dư theo sao kê"
          disabled={!canDo('lock') || !!state.locks[m]}
          onChange={(e) => updateClosing(m, 'bank', e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
        />
      ),
      err: c.bank !== undefined && c.bank !== '' && !bankOk ? `Lệch ${fm(Number(c.bank) - comp)} đ` : ''
    },
    {
      title: 'Không còn giao dịch chờ kiểm, chờ duyệt',
      passed: pend === 0,
      info: pend ? `${pend} giao dịch còn treo` : 'Đã xử lý hết',
      input: null,
      err: ''
    },
    {
      title: 'Mọi khoản thu đã gắn đúng hợp đồng',
      passed: unk === 0,
      info: unk ? `${unk} khoản thu chưa rõ` : 'Đã gắn đủ hợp đồng',
      input: null,
      err: ''
    },
    {
      title: 'Kiểm kê quà tặng khớp tồn sổ',
      passed: giftOk,
      info: <>Tồn sổ: <b>{fmt(stockTotal)}</b> đơn vị</>,
      input: (
        <input
          type="number"
          value={c.count ?? ''}
          placeholder="Số lượng kiểm kê"
          disabled={!canDo('lock') || !!state.locks[m]}
          onChange={(e) => updateClosing(m, 'count', e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
        />
      ),
      err: c.count !== undefined && c.count !== '' && !giftOk ? `Lệch ${fm(Number(c.count) - stockTotal)} đơn vị` : ''
    },
    {
      title: 'VPM đã đối chiếu chi lương với bảng lương',
      passed: wageOk,
      info: 'Tổng thực lĩnh = các dòng chi lương của kỳ',
      input: (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={wageOk}
            disabled={!canDo('lock') || !!state.locks[m]}
            onChange={(e) => updateClosing(m, 'wage', e.target.checked)}
          />
          <span>Đã đối chiếu</span>
        </label>
      ),
      err: ''
    }
  ];

  const allPassed = checks.every((x) => x.passed);
  const isMonthLocked = !!state.locks[m];
  const passedCount = checks.filter((x) => x.passed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 5-Step Closing Checklist */}
      <section className="card-box">
        <h2 className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: isMonthLocked ? 'var(--good)' : 'var(--teal)' }} />
            <span>Đối chiếu trước khi khóa sổ {monthLabel(m).toLowerCase()}</span>
          </div>
          <small>{passedCount}/{checks.length} tiêu chí đạt</small>
        </h2>

        <ul className="issues-list">
          {checks.map((item, idx) => (
            <li key={idx} className={`issue-item ${item.passed ? 'good' : 'bad'}`}>
              <i className="issue-dot" />
              <div>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{item.info}</div>
                {item.err && (
                  <div style={{ color: 'var(--bad)', fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>
                    {item.err}
                  </div>
                )}
              </div>
              <div>{item.input}</div>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', marginTop: '8px' }}>
          {isMonthLocked ? (
            <>
              <span className="chip good" style={{ padding: '6px 12px', fontSize: '13px' }}>
                <CheckCircle2 size={15} />
                <span>Đã khóa bởi VPM ngày {dmy(state.locks[m])}</span>
              </span>
              {canDo('lock') && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => unlockMonth(m)}
                >
                  <Unlock size={14} />
                  <span>Mở khóa</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn primary"
                disabled={!allPassed || !canDo('lock')}
                onClick={() => lockMonth(m)}
              >
                <Lock size={14} />
                <span>Khóa sổ {monthLabel(m).toLowerCase()}</span>
              </button>
              <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                {canDo('lock')
                  ? allPassed
                    ? 'Khóa xong, hệ thống sẽ đóng băng số liệu của tháng này.'
                    : 'Cần đạt cả 5 tiêu chí trước khi khóa sổ.'
                  : 'Chỉ VPM mới có quyền khóa sổ tháng.'}
              </span>
            </>
          )}
        </div>
      </section>

      {/* Audit Trail Section */}
      <section className="card-box">
        <h2 className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--teal)' }} />
            <span>Lịch sử thao tác & kiểm toán</span>
          </div>
          <small>ai làm gì, vào lúc nào</small>
        </h2>

        {state.log.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Vai trò thực hiện</th>
                  <th>Nội dung thao tác</th>
                </tr>
              </thead>
              <tbody>
                {[...state.log].reverse().slice(0, 30).map((l, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--f-num)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {l.at}
                    </td>
                    <td>
                      <span className="chip teal">{ROLES[l.role] || l.role}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{l.what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13.5px' }}>
            Chưa có thao tác nào trong phiên làm việc. Hãy thử nhập 1 giao dịch với vai trò Tiên, sau đó đổi sang VPM để kiểm tra.
          </div>
        )}
      </section>
    </div>
  );
};
