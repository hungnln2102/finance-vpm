import { 
  AppState, 
  Transaction, 
  GiftMovement, 
  GiftItem,
  BankWebhookLog,
  Proposal,
  CostAdjustment
} from '../types';
import { SEED_DATA } from '../data/seedData';
import { KEY, TODAY } from '../data/constants';
import { mon } from '../utils/formatters';

export function seedInitialGifts(txList: Transaction[]): { items: GiftItem[]; mv: GiftMovement[] } {
  const findId = (d: string) => (txList.find((t) => t.desc.trim().toLowerCase() === d) || {}).id || '';
  const items: GiftItem[] = [
    { id: 'Q01', name: 'Hộp bánh trung thu', unit: 'hộp', price: 271675 },
    { id: 'Q02', name: 'Quà bốc thăm hội thảo', unit: 'phần', price: 666364 },
    { id: 'Q03', name: 'Ấn phẩm, brochure', unit: 'cuốn', price: 14850 },
    { id: 'Q04', name: 'Tờ rơi thẻ', unit: 'tờ', price: 3208 },
    { id: 'Q05', name: 'Hashtag cầm tay', unit: 'cái', price: 76667 },
    { id: 'Q06', name: 'Túi đựng quà', unit: 'cái', price: 5350 }
  ];
  const mv: GiftMovement[] = [
    { d: '2026-09-02', item: 'Q01', qty: 40, kind: 'in', who: 'Mua lô bánh trung thu', tx: findId('bánh trung thu'), ex: true },
    { d: '2026-09-11', item: 'Q03', qty: 300, kind: 'in', who: 'In ấn phẩm', tx: findId('ấn phẩm'), ex: true },
    { d: '2026-09-16', item: 'Q04', qty: 120, kind: 'in', who: 'In 120 tờ rơi thẻ', tx: findId('in 120 tờ rơi thẻ'), ex: false },
    { d: '2026-09-18', item: 'Q05', qty: 3, kind: 'in', who: 'Mua hashtag', tx: findId('hastag'), ex: false },
    { d: '2026-09-18', item: 'Q06', qty: 20, kind: 'in', who: 'Mua túi đựng quà', tx: findId('túi đựng quà'), ex: true },
    { d: '2026-09-19', item: 'Q02', qty: 11, kind: 'in', who: 'Quà bốc thăm HT 19/9 (cọc 30% + phần còn lại)', tx: findId('quà ht 19/9'), ex: false },
    { d: '2026-09-08', item: 'Q01', qty: 12, kind: 'out', to: 'TV', who: 'Nguyễn Hữu Thạch', note: 'Tặng khách dịp trung thu', ex: true },
    { d: '2026-09-08', item: 'Q01', qty: 8, kind: 'out', to: 'TV', who: 'Thái Thị Thanh Thảo', note: 'Tặng khách dịp trung thu', ex: true },
    { d: '2026-09-12', item: 'Q01', qty: 10, kind: 'out', to: 'SK', who: 'Workshop trung thu', note: '', ex: true },
    { d: '2026-09-19', item: 'Q02', qty: 11, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: 'Bốc thăm 33 khách đăng ký', ex: false },
    { d: '2026-09-19', item: 'Q03', qty: 120, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: '', ex: true },
    { d: '2026-09-19', item: 'Q04', qty: 80, kind: 'out', to: 'SK', who: 'Hội thảo 19/9', note: '', ex: true },
    { d: '2026-09-25', item: 'Q06', qty: 6, kind: 'out', to: 'KH', who: 'Khách Cường', note: 'Gói quà tặng', ex: true }
  ];
  return { items, mv };
}

export function seedInitialWebhooks(): BankWebhookLog[] {
  return [];
}

export function seedInitialProposals(): Proposal[] {
  return [
    {
      id: 'PROP-01',
      code: 'KH-2026-10-01',
      title: 'Kế hoạch Tổ chức Hội thảo Khách hàng & Ra mắt Gói Bảo hiểm VIP Tháng 10',
      creator: 'Nguyễn Thị Thảo',
      creatorEmail: 'thao.nguyen@vpmfinance.vn',
      department: 'Kinh doanh & Phát triển Khách hàng',
      amount: 12500000,
      date: '2026-10-14',
      description: 'Tổ chức workshop chuyên đề "Bảo hiểm Có Giàu - Tích lũy & Thịnh vượng", dự kiến thu hút 35 khách hàng tiềm năng tại Khách sạn Mường Thanh.',
      status: 'pending_master',
      resendSentAt: '2026-10-14 09:30',
      ccEmails: ['thao.nguyen@vpmfinance.vn', 'ketoan@vpmfinance.vn'],
      threads: [
        {
          id: 'TH-01',
          sender: 'Nguyễn Thị Thảo (Operator)',
          role: 'operator',
          content: 'Em đã gửi hồ sơ dự toán chi tiết kèm danh sách khách mời qua email. Kính nhờ Sếp và Kế toán trưởng xem xét phê duyệt ngân sách.',
          createdAt: '2026-10-14 09:30'
        },
        {
          id: 'TH-02',
          sender: 'VPM (Supervisor)',
          role: 'admin',
          content: 'Kế toán đã rà soát chứng từ báo giá địa điểm (8.5tr) và quà tặng bốc thăm (4tr). Đã đủ định mức Opex tháng 10. Chuyển tiếp lên Sếp Mavryk phê duyệt.',
          createdAt: '2026-10-14 14:15'
        },
        {
          id: 'TH-03',
          sender: 'Sếp Mavryk (Master)',
          role: 'master',
          content: 'Kế hoạch tốt. Tuy nhiên cần yêu cầu khách sạn cam kết màn hình LED và tea-break đạt chuẩn. Thảo liên hệ chốt lại rồi anh duyệt chuyển khoản đợt 1.',
          createdAt: '2026-10-14 16:45',
          isInboundReply: true
        }
      ]
    },
    {
      id: 'PROP-02',
      code: 'KH-2026-10-02',
      title: 'Đề xuất In ấn bổ sung Bộ Sales Kit & Quà tặng Tri ân Tư vấn viên',
      creator: 'Trần Văn Nam',
      creatorEmail: 'nam.tran@vpmfinance.vn',
      department: 'Văn phòng & Vận hành',
      amount: 5800000,
      date: '2026-10-12',
      description: 'In ấn 200 cuốn brochure mới, 50 áo đồng phục thương hiệu và 30 túi quà tặng cho đợt tuyển dụng TV mới.',
      status: 'approved',
      resendSentAt: '2026-10-12 10:00',
      ccEmails: ['nam.tran@vpmfinance.vn'],
      threads: [
        {
          id: 'TH-04',
          sender: 'Trần Văn Nam',
          role: 'operator',
          content: 'Đã hoàn tất báo giá nhà in rẻ hơn 10% so với quý trước. Kính đệ trình Sếp.',
          createdAt: '2026-10-12 10:00'
        },
        {
          id: 'TH-05',
          sender: 'Sếp Mavryk (Master)',
          role: 'master',
          content: 'Đồng ý phê duyệt. Kế toán chi tạm ứng theo hợp đồng in ấn.',
          createdAt: '2026-10-12 11:30'
        }
      ]
    }
  ];
}

export function seedInitialCostAdjustments(): CostAdjustment[] {
  return [
    {
      id: 'ADJ-01',
      month: '2026-10',
      category: 'SUKIEN',
      oldBudget: 3000000,
      newBudget: 8000000,
      reason: 'Bổ sung ngân sách cho Hội thảo VIP và Workshop trung thu',
      approvedBy: 'Sếp Mavryk',
      status: 'approved',
      createdAt: '2026-10-10'
    }
  ];
}

export function loadInitialState(): AppState {
  try {
    localStorage.removeItem('sogoc-bkd-v1');
    localStorage.removeItem('sogoc-bkd-v1-ui');
  } catch (e) {}

  let saved: any = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {
    saved = null;
  }

  const currentMonth = mon(TODAY);
  const base: AppState = JSON.parse(JSON.stringify(SEED_DATA));
  base.tx = Array.isArray(SEED_DATA.tx) && SEED_DATA.tx.length > 0 ? SEED_DATA.tx : [];
  base.gifts = seedInitialGifts([]);
  base.budget = { [currentMonth]: {} };
  base.locks = {};
  base.close = {};
  base.log = [];
  base.webhooks = seedInitialWebhooks();
  base.proposals = seedInitialProposals();
  base.costAdjustments = seedInitialCostAdjustments();

  if (saved && saved.v === 1 && saved.state) {
    const merged = Object.assign(base, saved.state);
    if (!merged.tx || merged.tx.length === 0) {
      merged.tx = Array.isArray(SEED_DATA.tx) && SEED_DATA.tx.length > 0 ? SEED_DATA.tx : [];
    }
    if (!merged.webhooks) merged.webhooks = [];
    merged.webhooks = merged.webhooks.filter((w: BankWebhookLog) => !w.id.startsWith('WH-'));
    if (!merged.proposals || merged.proposals.length === 0) merged.proposals = seedInitialProposals();
    if (!merged.costAdjustments || merged.costAdjustments.length === 0) merged.costAdjustments = seedInitialCostAdjustments();
    return merged;
  }
  return base;
}
