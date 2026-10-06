import { useEffect } from "react";

/**
 * Chạy `load` khi component hiện ra hoặc khi `load` đổi (ví dụ đổi bộ lọc).
 * `load` được gọi sau khi render xong (không đồng bộ trong effect), nên có thể cập nhật state thoải mái.
 * `load` phải ổn định (bọc bằng useCallback) để không chạy lại sau mỗi lần render.
 */
export function useLoader(load: () => Promise<void>) {
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => (active ? load() : undefined));
    return () => {
      active = false;
    };
  }, [load]);
}
