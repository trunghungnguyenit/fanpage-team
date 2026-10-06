import type { IconName } from "@/components/icons";
import type { ChannelKind } from "@/lib/site";

/** Tùy chọn có khóa ổn định và nhãn theo ngôn ngữ (ngân sách, thời gian bắt đầu). */
export interface OptionItem {
  key: string;
  label: string;
}

/**
 * Toàn bộ nội dung giao diện theo một ngôn ngữ, lấy từ database qua backend
 * (xem `lib/content.ts`). Gồm chữ giao diện (bảng `site_texts`) và các danh mục có bảng riêng.
 */
export interface Dictionary {
  // ---- Danh mục có bảng riêng ----
  svc: { key: string; icon: IconName; title: string; desc: string }[];
  mdl: {
    key: string;
    isFeatured: boolean;
    defaultServiceKey: string | null;
    situation: string;
    title: string;
    desc: string;
    points: string[];
  }[];
  budgets: OptionItem[];
  timelines: OptionItem[];
  steps: { key: string; title: string; dur: string; desc: string; role: string; out: string[] }[];
  faqs: { q: string; a: string }[];
  /** Kênh liên hệ đã điền trong bảng `contact_channels`. */
  channels: { id: number; kind: ChannelKind; label: string; value: string; url: string }[];

  // ---- Chữ giao diện (bảng `site_texts`) ----
  address: string;
  all: string;
  allCtaH: string;
  allH: string;
  allP: string;
  allSvc: string;
  allTitle: string;
  back: string;
  backHome: string;
  bestMvp: string;
  briefShort: string;
  budget: string;
  clearFilters: string;
  closeH: string;
  closeP: string;
  ctaPrimary: string;
  ctaSecondary: string;
  deliverables: string;
  discoveryFree: string;
  doneB: string;
  doneT: string;
  email: string;
  errEmail: string;
  errName: string;
  errSvc: string;
  faq: string;
  faqH: string;
  featuredTag: string;
  h1a: string;
  h1b: string;
  h1c: string;
  home: string;
  kicker: string;
  lede: string;
  legal: string;
  modelLabel: string;
  models: string;
  modelsH: string;
  modelsP: string;
  more: string;
  msg: string;
  msgPh: string;
  name: string;
  namePh: string;
  ndaShort: string;
  next: string;
  noResults: string;
  notSure: string;
  orReach: string;
  phoneZalo: string;
  privacy: string;
  process: string;
  processH: string;
  processP: string;
  q1: string;
  q1sub: string;
  q2: string;
  q3: string;
  reassure: string[];
  reassureClose: string[];
  reply24: string;
  results: string;
  resultsOne: string;
  retainerP: string;
  retainerT: string;
  searchPh: string;
  sendBrief: string;
  sent: string;
  service: string;
  serviceL: string;
  services: string;
  servicesH: string;
  servicesP: string;
  showing: string;
  similar: string;
  sortFeat: string;
  sortL: string;
  sortNew: string;
  soundsLikeUs: string;
  start: string;
  startProject: string;
  stats: string[];
  step: string;
  submit: string;
  sumModel: string;
  sumSvc: string;
  techL: string;
  trust: string[];
  ui: {
    theme: string;
    language: string;
    menu: string;
    close: string;
    caseStudy: string;
    notFoundTitle: string;
    notFoundBack: string;
    metaTitle: string;
    skip: string;
    submitting: string;
    submitError: string;
  };
  viewAll: string;
  visitSite: string;
  why: {
    k: string;
    title: string;
    items: string[];
  }[];
  whyH: string;
  whyK: string;
  whyP: string;
  work: string;
  workH: string;
  workP: string;
  you: string;
  yourRole: string;
}
