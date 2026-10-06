/**
 * Giá trị giữ chỗ dạng "[...]" nghĩa là chưa có nội dung thật.
 * Giao diện ẩn các mục chỉ chứa giá trị giữ chỗ để trang trông hoàn chỉnh,
 * và tự hiện ra khi nội dung thật được điền vào database.
 */
export const isPlaceholder = (value: string) => /^\s*\[[^\]]*\]\s*$/.test(value);
