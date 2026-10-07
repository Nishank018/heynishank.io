import { ImageResponse } from "next/og";

export const alt = "Nishank Gupta — AI Engineer in training and Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
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
          padding: "90px",
          background: "#0a0a0a",
          color: "#f5f5f2",
          border: "2px solid #343434",
        }}
      >
        <div style={{ color: "#ed9868", fontSize: 24, fontFamily: "monospace" }}>
          PERSONAL PORTFOLIO
        </div>
        <div style={{ marginTop: 32, fontSize: 72, fontWeight: 600 }}>Nishank Gupta</div>
        <div style={{ marginTop: 18, fontSize: 32, color: "#aaa" }}>
          AI Engineer in training · Full Stack Developer
        </div>
        <div style={{ marginTop: 38, fontSize: 22, color: "#aaa", fontFamily: "monospace" }}>
          Lucknow, India
        </div>
      </div>
    ),
    size,
  );
}
