export interface BriefInput {
  /** khóa các dịch vụ đã chọn */
  svc: string[];
  /** khóa hình thức hợp tác; `null` nghĩa là "chưa chắc" */
  model: string | null;
  /** khóa ngân sách */
  budget: string;
  /** khóa thời gian bắt đầu */
  timeline: string;
  name: string;
  email: string;
  phone: string;
  msg: string;
}

export type BriefField = "svc" | "name" | "email";

export type BriefResult = { ok: true } | { ok: false; errors: Partial<Record<BriefField, true>> };

/** Lựa chọn mặc định trong form: ngân sách "chưa rõ", bắt đầu "trong 1 tháng". */
export const BLANK_BRIEF: BriefInput = {
  svc: [],
  model: null,
  budget: "unsure",
  timeline: "within-1-month",
  name: "",
  email: "",
  phone: "",
  msg: "",
};

export const EMAIL_RE = /^\S+@\S+\.\S+$/;
