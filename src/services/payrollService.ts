import { Staff, AttendanceRecord } from '../types';
import { DEDUCT_SELF, DEDUCT_DEP } from '../data/constants';

export interface AttendanceDayInfo {
  iso: string; // YYYY-MM-DD
  d: number; // 1..31
  wd: number; // 0=Sun..6=Sat
  sun: boolean;
  sat: boolean;
  hol: boolean;
}

export interface AttendanceAlert {
  s: string;
  d: string;
  msg: string;
}

export interface SalaryBreakdown {
  std: number;
  work: number;
  holWork: number;
  sunWork: number;
  byDays: number;
  extra: number;
  gross: number;
  ins: number;
  taxable: number;
  tax: number;
  net: number;
}

export function getAttendanceDays(attMonth: string, holidays: string[]): AttendanceDayInfo[] {
  const [y, m] = attMonth.split("-").map(Number);
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const out: AttendanceDayInfo[] = [];

  for (let d = 1; d <= n; d++) {
    const iso = attMonth + "-" + String(d).padStart(2, "0");
    const wd = new Date(iso + "T00:00:00Z").getUTCDay();
    out.push({
      iso,
      d,
      wd,
      sun: wd === 0,
      sat: wd === 6,
      hol: holidays.includes(iso)
    });
  }

  return out;
}

export function calculateStandardDays(attMonth: string, holidays: string[]): number {
  const ds = getAttendanceDays(attMonth, holidays);
  return ds.length - ds.filter((x) => x.sun).length - 0.5 * ds.filter((x) => x.sat).length;
}

export function detectAttendanceAlerts(
  staffList: Staff[],
  attendance: Record<string, AttendanceRecord>,
  attMonth: string,
  holidays: string[]
): AttendanceAlert[] {
  const out: AttendanceAlert[] = [];
  const daysList = getAttendanceDays(attMonth, holidays);

  for (const d of daysList) {
    for (const s of staffList) {
      const v = (attendance[s.name] || { days: {} }).days[d.iso];
      if (d.hol && (v === 1 || v === 0.5)) {
        out.push({ s: s.name, d: d.iso, msg: "Ngày lễ đang chấm như ngày thường" });
      }
      if (d.sun && (v === 1 || v === 0.5)) {
        out.push({ s: s.name, d: d.iso, msg: "Chủ nhật chấm 1 – đi làm thì chọn 200%" });
      }
    }
  }

  return out;
}

export function calculatePIT(taxable: number): number {
  if (taxable <= 0) return 0;
  const brackets: [number, number][] = [
    [10e6, 0.05],
    [30e6, 0.10],
    [60e6, 0.20],
    [100e6, 0.30],
    [Infinity, 0.35]
  ];

  let tax = 0;
  let prev = 0;
  for (const [cap, rate] of brackets) {
    if (taxable > prev) {
      tax += (Math.min(taxable, cap) - prev) * rate;
    }
    prev = cap;
  }
  return Math.round(tax);
}

export function calculateSalary(
  staff: Staff,
  attRecord: AttendanceRecord | undefined,
  attMonth: string,
  holidays: string[],
  deductSelf = DEDUCT_SELF,
  deductDep = DEDUCT_DEP
): SalaryBreakdown {
  const a = (attRecord || { days: {} }).days;
  const std = calculateStandardDays(attMonth, holidays);
  const allow = (staff.allow.phone || 0) + (staff.allow.fuel || 0) + (staff.allow.meal || 0) + (staff.allow.travel || 0);
  const rate = (staff.base + allow) / std;

  let work = 0;
  let hol = 0;
  let holWork = 0;
  let sunWork = 0;

  for (const d of getAttendanceDays(attMonth, holidays)) {
    const v = a[d.iso];
    if (v === "L") hol += 1;
    else if (v === "X") holWork += 1;
    else if (v === 2) sunWork += 1;
    else if (typeof v === "number") work += v;
  }

  const byDays = rate * (work + hol);
  const extra = rate * (holWork * 3 + sunWork * 2);
  const gross = byDays + extra + (staff.kpi || 0);
  const ins = staff.insSalary * 0.105;
  const exempt = (byDays * allow) / (staff.base + allow || 1) + rate * (holWork * 2 + sunWork * 1);
  const taxable = Math.max(0, gross - ins - exempt - deductSelf - staff.deps * deductDep);
  const tax = calculatePIT(taxable);
  const net = gross - ins - tax - (staff.advance || 0);

  return {
    std,
    work: work + hol,
    holWork,
    sunWork,
    byDays,
    extra,
    gross,
    ins,
    taxable,
    tax,
    net
  };
}
