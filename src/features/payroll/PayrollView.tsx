import React from 'react';
import { useApp } from '../../context/AppContext';
import { DEDUCT_SELF } from '../../data/constants';
import { fmt, mil, dmy } from '../../utils/formatters';
import { 
  getAttendanceDays, 
  calculateStandardDays, 
  detectAttendanceAlerts, 
  calculateSalary 
} from '../../services/payrollService';
import { Users, AlertTriangle, CheckCheck, Info } from 'lucide-react';

export const PayrollView: React.FC = () => {
  const { 
    state, 
    canDo, 
    cycleAttendance, 
    applyAttendanceSuggestions, 
    updateStaffAdvance 
  } = useApp();

  const m = state.attMonth; // '2026-09'
  const ds = getAttendanceDays(m, state.holidays);
  const std = calculateStandardDays(m, state.holidays);
  const alerts = detectAttendanceAlerts(state.staff, state.att, m, state.holidays);
  const alertSet = new Set(alerts.map((a) => a.s + a.d));

  const payrollCalculations = state.staff.map((s) => {
    const attRec = state.att[s.name];
    const p = calculateSalary(s, attRec, m, state.holidays);
    return { staff: s, calc: p };
  });

  const sumTotal = (key: keyof typeof payrollCalculations[0]['calc']) => {
    return payrollCalculations.reduce((sum, item) => sum + (Number(item.calc[key]) || 0), 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Attendance Sheet Card */}
      <section className="card-box">
        <h2 className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} style={{ color: 'var(--teal)' }} />
            <span>Bảng chấm công tháng 9/2026</span>
          </div>
          <small>công chuẩn {std} ngày · bấm vào từng ô để đổi ký hiệu</small>
        </h2>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: 'var(--muted)', background: 'var(--soft)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
          <span><b>1</b> đủ công</span>
          <span><b>½</b> nửa công</span>
          <span style={{ color: 'var(--ochre)' }}><b>L</b> nghỉ lễ hưởng lương</span>
          <span style={{ color: 'var(--good)' }}><b>X</b> đi làm ngày lễ (300%)</span>
          <span style={{ color: 'var(--good)' }}><b>2</b> đi làm chủ nhật (200%)</span>
          <span style={{ color: 'var(--bad)' }}>Ô viền đỏ cần xác nhận</span>
        </div>

        {/* Interactive Calendar Table */}
        <div className="table-scroll">
          <table className="att-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', minWidth: '150px' }}>Nhân sự</th>
                {ds.map((d) => (
                  <th key={d.iso} className={d.sun ? 'sun' : d.hol ? 'hol' : ''}>
                    {d.d}
                    <br />
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.wd]}
                  </th>
                ))}
                <th style={{ textAlign: 'right', paddingRight: '8px' }}>Tổng công</th>
              </tr>
            </thead>
            <tbody>
              {state.staff.map((s) => {
                const a = (state.att[s.name] || { days: {} }).days;
                const p = payrollCalculations.find((item) => item.staff.id === s.id)?.calc;
                const totalWork = p ? p.work + p.holWork + p.sunWork : 0;

                return (
                  <tr key={s.id}>
                    <td className="name">{s.name}</td>
                    {ds.map((d) => {
                      const v = a[d.iso];
                      const label = v === 0.5 ? '½' : v === undefined ? '' : String(v);
                      const cls =
                        v === 1
                          ? 'v1'
                          : v === 0.5
                          ? 'vh'
                          : v === 'L'
                          ? 'vL'
                          : v === 'X'
                          ? 'vX'
                          : v === 2
                          ? 'v2'
                          : '';
                      const isAlert = alertSet.has(s.name + d.iso);

                      return (
                        <td key={d.iso}>
                          <button
                            type="button"
                            className={`att-btn ${cls} ${isAlert ? 'alert' : ''}`}
                            onClick={() => cycleAttendance(s.id, d.iso)}
                            disabled={!canDo('att')}
                            aria-label={`${s.name} ngày ${d.d}: ${label || 'trống'}`}
                          >
                            {label}
                          </button>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--f-num)', paddingRight: '8px' }}>
                      {totalWork}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Alerts & Suggestion Action */}
        {alerts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ul className="issues-list">
              {alerts.slice(0, 4).map((a, i) => (
                <li key={i} className="issue-item warn">
                  <i className="issue-dot" />
                  <span>
                    <b>{a.s}</b> · ngày {dmy(a.d)}: {a.msg}
                  </span>
                  <span />
                </li>
              ))}
              {alerts.length > 4 && (
                <li className="issue-item warn">
                  <i className="issue-dot" />
                  <span>và {alerts.length - 4} ô tương tự cần rà soát</span>
                  <span />
                </li>
              )}
            </ul>

            {canDo('att') && (
              <div style={{ marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={applyAttendanceSuggestions}
                  style={{ borderColor: 'var(--ochre)', color: 'var(--ochre)' }}
                >
                  <CheckCheck size={14} />
                  <span>Áp dụng đề xuất: ngày lễ → L, chủ nhật → 200%</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Salary Table Card */}
      <section className="card-box">
        <h2 className="card-title">
          <span>Bảng lương tháng 9/2026</span>
          <small>thưởng KPI không chia theo ngày công · giảm trừ bản thân {mil(DEDUCT_SELF)}</small>
        </h2>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th className="num">Công</th>
                <th className="num">Lương theo công</th>
                <th className="num">Lễ, CN</th>
                <th className="num">KPI</th>
                <th className="num">BHXH NLĐ</th>
                <th className="num">Thuế TNCN</th>
                <th className="num">Tạm ứng</th>
                <th className="num">Thực lĩnh</th>
                <th className="num">File cũ</th>
              </tr>
            </thead>
            <tbody>
              {payrollCalculations.map(({ staff: s, calc: p }) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {s.role} · lương {mil(s.base)}
                      {!s.insSalary && <span style={{ color: 'var(--warn)', marginLeft: '4px' }}>· chưa đóng BHXH</span>}
                    </div>
                  </td>
                  <td className="num">
                    <div>{p.work}</div>
                    {s.oldDays !== undefined && s.oldDays !== p.work && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>cũ {s.oldDays}</div>
                    )}
                  </td>
                  <td className="num">{fmt(p.byDays)}</td>
                  <td className="num">{fmt(p.extra)}</td>
                  <td className="num">{fmt(s.kpi)}</td>
                  <td className="num">{fmt(p.ins)}</td>
                  <td className="num">
                    <div>{fmt(p.tax)}</div>
                    {s.oldTax !== undefined && s.oldTax !== p.tax && (
                      <div style={{ fontSize: '11px', color: 'var(--bad)' }}>cũ {fmt(s.oldTax)}</div>
                    )}
                  </td>
                  <td className="num">
                    <input
                      type="number"
                      value={s.advance}
                      min="0"
                      step="100000"
                      disabled={!canDo('att')}
                      onChange={(e) => updateStaffAdvance(s.id, Number(e.target.value))}
                      style={{ width: '120px', textAlign: 'right', padding: '4px 8px' }}
                      aria-label={`Tạm ứng ${s.name}`}
                    />
                  </td>
                  <td className="num" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--teal)' }}>
                    {fmt(p.net)}
                  </td>
                  <td className="num" style={{ color: 'var(--muted)' }}>
                    {s.oldNet ? fmt(s.oldNet) : '—'}
                  </td>
                </tr>
              ))}

              <tr className="total">
                <td>Tổng cộng</td>
                <td />
                <td className="num">{fmt(sumTotal('byDays'))}</td>
                <td className="num">{fmt(sumTotal('extra'))}</td>
                <td className="num">{fmt(state.staff.reduce((a, s) => a + (s.kpi || 0), 0))}</td>
                <td className="num">{fmt(sumTotal('ins'))}</td>
                <td className="num">{fmt(sumTotal('tax'))}</td>
                <td className="num">{fmt(state.staff.reduce((a, s) => a + (s.advance || 0), 0))}</td>
                <td className="num" style={{ color: 'var(--teal)' }}>{fmt(sumTotal('net'))}</td>
                <td className="num" style={{ color: 'var(--muted)' }}>{fmt(state.staff.reduce((a, s) => a + (s.oldNet || 0), 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.45 }}>
          Biểu thuế 5 bậc và mức giảm trừ lấy theo file lương hiện tại của khách và quy định tính thuế; VPM rà lại trước khi áp dụng chi trả thực tế. Tạm ứng nhập theo từng người thay cho dòng ghi chú "đã trừ 6 tr ứng T9" ghi tay.
        </p>
      </section>
    </div>
  );
};
