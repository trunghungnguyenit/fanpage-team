import { ImageResponse } from "next/og";

export const alt = "HTCode";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Chỉ dùng chữ Latin vì font mặc định của ImageResponse không có dấu tiếng Việt.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "white",
          background: "linear-gradient(145deg, #2b5be8, #1f45c2)",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", opacity: 0.85 }}>
          MVP &amp; product studio
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, marginTop: 24 }}>HTCode</div>
      </div>
    ),
    size,
  );
}
