/**
 * Formatting and date utility functions
 */

export const fmt = (n: number | null | undefined): string => {
  return (Math.round(n ?? 0) || 0).toLocaleString("vi-VN");
};

export const fm = (n: number | null | undefined): string => {
  const num = n ?? 0;
  return (num < 0 ? "−" : "") + fmt(Math.abs(num));
};

export const mil = (n: number | null | undefined): string => {
  const num = n ?? 0;
  return (num / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tr";
};

export const dmy = (s?: string | null): string => {
  if (!s) return "";
  const day = s.slice(8, 10);
  const month = s.slice(5, 7);
  const year = s.slice(0, 4);
  return day + "/" + month + (year !== "2026" ? "/" + year : "");
};

export const mon = (s: string): string => {
  return s.slice(0, 7);
};

export const days = (a: string, b: string): number => {
  return Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
};

export const esc = (s: any): string => {
  return String(s ?? "")
    .replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c] || c));
};

export const monthLabel = (m: string): string => {
  return "Tháng " + Number(m.slice(5)) + "/" + m.slice(0, 4);
};

export const lastDay = (m: string): string => {
  const [y, mm] = m.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, mm, 0)).getUTCDate();
  return m + "-" + String(daysInMonth).padStart(2, "0");
};

export const prevMonth = (m: string): string => {
  const [y, mm] = m.split("-").map(Number);
  return mm === 1 ? (y - 1) + "-12" : y + "-" + String(mm - 1).padStart(2, "0");
};
