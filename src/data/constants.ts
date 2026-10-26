import { Role, RoleDefinition, OpexCategoryMap, TransactionTypeMap, AccountMap } from '../types';

export const TODAY = "2026-10-16";
export const OPEN_DATE = "2026-08-01";
export const KEY = "sogoc-bkd-v1";

export const OPEN_BAL: Record<string, number> = {
  QUY: -1487000,
  ACB: 0,
  BT: 0
};

export const ACC: AccountMap = {
  QUY: "Sổ quỹ văn phòng",
  ACB: "TK ACB Trần Thị Ngọc Giàu",
  BT: "Bù trừ thu nhập (không qua quỹ)"
};

export const TYPES: TransactionTypeMap = {
  THU_KH: {l: "Thu khách trả nợ", dir: "in"},
  THU_TV: {l: "Thu tư vấn trả nợ", dir: "in"},
  HOA_HONG: {l: "Hoa hồng BKD", dir: "in"},
  DFAM_CAP: {l: "DFAM cấp vốn", dir: "in"},
  THU_KHAC: {l: "Thu khác", dir: "in"},
  OPEX: {l: "Chi phí vận hành", dir: "out"},
  UNG_PHI: {l: "Ứng phí hộ khách", dir: "out"},
  HOAN_UNG: {l: "Hoàn ứng tháng trước", dir: "out"},
  CHUYEN_DFAM: {l: "Chuyển tiền về DFAM", dir: "out"},
  TAM_UNG: {l: "Tạm ứng nhân sự", dir: "out"}
};

export const CATS: OpexCategoryMap = {
  LUONG: "Lương, thưởng",
  VP: "Văn phòng & vận hành",
  SUKIEN: "Sự kiện, hội thảo, quảng cáo",
  CSKH: "Chăm sóc khách hàng",
  NOIBO: "Nội bộ & tiếp khách",
  KHAC: "Chi khác"
};

export const ROLES: Record<Role, string> = {
  operator: "🟢 Nhập liệu (Operator)",
  admin: "🟡 Kế toán trưởng (Supervisor)",
  master: "👑 Sếp Mavryk (Master)",
  tien: "Tiên · Nhập liệu",
  vpm: "VPM · Kiểm soát",
  giau: "Chị Giàu · Duyệt"
};

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  operator: { 
    id: "operator", 
    name: "Nhập liệu", 
    title: "Operator", 
    description: "Tạo bản nháp chứng từ thu/chi, hợp đồng, phiếu quà, đề xuất kế hoạch đệ trình" 
  },
  admin: { 
    id: "admin", 
    name: "Kế toán trưởng", 
    title: "Supervisor", 
    description: "Đối chiếu biến động Webhook ngân hàng ACB, rà soát chứng từ gốc, sơ duyệt giao dịch, kiểm soát khóa sổ" 
  },
  master: { 
    id: "master", 
    name: "Sếp Mavryk", 
    title: "Master", 
    description: "Quyền tối cao: Phê duyệt cuối cùng ghi vào Sổ Cái (Posted), phê duyệt ngân sách & kế hoạch" 
  },
  tien: { 
    id: "operator", 
    name: "Tiên (Operator)", 
    title: "Nhập liệu", 
    description: "Ghi nhận giao dịch nháp, phiếu xuất nhập quà, thêm hợp đồng" 
  },
  vpm: { 
    id: "admin", 
    name: "VPM (Supervisor)", 
    title: "Kiểm soát", 
    description: "Rà soát chứng từ, đối chiếu Webhook ngân hàng ACB, sơ duyệt giao dịch, khóa sổ" 
  },
  giau: { 
    id: "master", 
    name: "Chị Giàu (Master)", 
    title: "Phê duyệt", 
    description: "Phê duyệt cuối cùng ghi vào Sổ Cái, duyệt chi >= 2tr, duyệt ngân sách" 
  }
};

export const WORKFLOW_ROLES: Role[] = ['operator', 'admin', 'master'];

export const APPROVE_LIMIT = 2000000;
export const DISC_LIMIT = 0.30;
export const DEDUCT_SELF = 15500000;
export const DEDUCT_DEP = 6200000;

export const OLD = {
  overdueKH: 52254500,
  wageOct: 109000,
  otherAug: 47801000,
  fundOct: -9184500,
  receivableKH: 168694710
};
