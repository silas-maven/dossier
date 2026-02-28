import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dossier CV Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #03050b 0%, #0f172a 50%, #1e293b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
            background: "#0f172a",
            border: "3px solid rgba(248,250,252,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 700,
            color: "#f8fafc",
            marginBottom: 24,
          }}
        >
          D
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#f8fafc",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Dossier CV Builder
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(248,250,252,0.6)",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Free, local-first CV builder with professional templates and PDF export
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 32,
          }}
        >
          {["ATS-Friendly", "Local-First", "Free", "PDF Export"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                borderRadius: 9999,
                border: "1px solid rgba(248,250,252,0.15)",
                background: "rgba(248,250,252,0.06)",
                color: "rgba(248,250,252,0.7)",
                fontSize: 16,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
