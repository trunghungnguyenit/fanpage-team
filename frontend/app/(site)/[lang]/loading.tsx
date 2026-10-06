// Khung chờ hiện trong lúc trang lấy nội dung từ backend.
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="animate-pulse">
      <span className="sr-only">Loading…</span>
      <div className="h-17 border-b border-line" />
      <div className="mx-auto max-w-300 px-5 pt-11">
        <div className="h-8 w-48 rounded-full bg-muted" />
        <div className="mt-6 h-16 max-w-xl rounded-2xl bg-muted" />
        <div className="mt-3 h-16 max-w-md rounded-2xl bg-muted" />
        <div className="mt-8 h-24 max-w-lg rounded-2xl bg-muted" />
        <div className="mt-8 flex gap-3">
          <div className="h-14 w-60 rounded-2xl bg-muted" />
          <div className="h-14 w-48 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
