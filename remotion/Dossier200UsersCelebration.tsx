import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const DURATION = 900;

const colors = {
  bg: "#03050b",
  blue: "#5ea4ff",
  blueDeep: "#0b2a4c",
  cyan: "#9fc8ff",
  white: "#f8fbff",
  muted: "rgba(226,232,240,0.68)",
  faint: "rgba(226,232,240,0.14)",
  panel: "rgba(255,255,255,0.07)",
  line: "rgba(148,163,184,0.22)",
  green: "#6ee7b7",
  amber: "#facc6b",
  slate: "#111827",
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const fade = (frame: number, start: number, duration = 22) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: ease });

const exit = (frame: number, start: number, duration = 22) =>
  interpolate(frame, [start, start + duration], [1, 0], { ...clamp, easing: ease });

const rise = (frame: number, start: number, distance = 34, duration = 28) =>
  interpolate(frame, [start, start + duration], [distance, 0], { ...clamp, easing: ease });

const Fonts = () => (
  <style>{`
    @font-face { font-family: DossierHeading; src: url(${staticFile("fonts/dossier-barlow-condensed-700.woff")}) format("woff"); font-weight: 700; }
    @font-face { font-family: DossierBody; src: url(${staticFile("fonts/dossier-lato-400.woff")}) format("woff"); font-weight: 400; }
    @font-face { font-family: DossierBody; src: url(${staticFile("fonts/dossier-lato-700.woff")}) format("woff"); font-weight: 700; }
  `}</style>
);

const Background = ({ pulse = 1 }: { pulse?: number }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, DURATION], [-90, 90], clamp);
  const sweep = interpolate(frame % 240, [0, 240], [-440, 1920], clamp);
  const glow = interpolate(Math.sin(frame / 34), [-1, 1], [0.55, 1]);

  return (
    <AbsoluteFill style={{ background: colors.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 20%, rgba(94,164,255,0.30), transparent 34%), radial-gradient(circle at 78% 22%, rgba(14,165,233,0.18), transparent 31%), linear-gradient(135deg,#03050b,#07111f 52%,#03050b)",
          opacity: pulse,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -100,
          transform: `translateX(${drift}px)`,
          opacity: 0.22,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: sweep,
          top: -220,
          width: 320,
          height: 1520,
          transform: "rotate(18deg)",
          background: "linear-gradient(90deg, transparent, rgba(94,164,255,0.12), transparent)",
          filter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -280,
          top: -260,
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: colors.blue,
          opacity: 0.12 * glow,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -260,
          bottom: -280,
          width: 760,
          height: 760,
          borderRadius: "50%",
          border: "1px solid rgba(94,164,255,0.24)",
        }}
      />
    </AbsoluteFill>
  );
};

const Logo = ({ compact = false }: { compact?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: compact ? 14 : 18 }}>
    <div
      style={{
        width: compact ? 46 : 58,
        height: compact ? 46 : 58,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        border: "1px solid rgba(94,164,255,0.48)",
        background: "rgba(94,164,255,0.14)",
        color: colors.cyan,
        fontSize: compact ? 16 : 20,
        fontWeight: 900,
        boxShadow: "0 0 34px rgba(94,164,255,0.16)",
      }}
    >
      D
    </div>
    <div style={{ fontFamily: "monospace", letterSpacing: compact ? 6 : 8, fontSize: compact ? 14 : 18, fontWeight: 900 }}>
      DOSSIER
    </div>
  </div>
);

const GlassPanel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      border: `1px solid ${colors.line}`,
      borderRadius: 34,
      background: "linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.035))",
      boxShadow: "0 30px 92px rgba(0,0,0,0.45)",
      backdropFilter: "blur(20px)",
      ...style,
    }}
  >
    {children}
  </div>
);

const FadeSlide: React.FC<{ from: number; children: React.ReactNode; x?: number; y?: number; style?: React.CSSProperties }> = ({
  from,
  children,
  x = 0,
  y = 34,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: fade(frame, from),
        transform: `translate(${rise(frame, from, x)}px, ${rise(frame, from, y)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Eyebrow = ({ children, color = colors.cyan }: { children: React.ReactNode; color?: string }) => (
  <div style={{ fontFamily: "monospace", letterSpacing: 8, color, fontWeight: 900, fontSize: 18 }}>{children}</div>
);

const BigType = ({ children, maxWidth = 1100 }: { children: React.ReactNode; maxWidth?: number }) => (
  <div
    style={{
      marginTop: 18,
      fontFamily: "DossierHeading, sans-serif",
      fontSize: 128,
      lineHeight: 0.88,
      letterSpacing: -3.6,
      fontWeight: 700,
      maxWidth,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Body = ({ children, maxWidth = 780 }: { children: React.ReactNode; maxWidth?: number }) => (
  <div style={{ marginTop: 26, color: colors.muted, fontSize: 30, lineHeight: 1.34, maxWidth }}>{children}</div>
);

const Counter = () => {
  const frame = useCurrentFrame();
  const value = Math.round(interpolate(frame, [0, 118], [9, 200], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const shimmer = interpolate(frame % 90, [0, 90], [-45, 145], clamp);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          fontFamily: "DossierHeading, sans-serif",
          fontSize: 300,
          lineHeight: 0.78,
          letterSpacing: -9,
          color: colors.white,
          textShadow: "0 0 54px rgba(94,164,255,0.24)",
        }}
      >
        {value}+
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(105deg, transparent ${shimmer - 18}%, rgba(159,200,255,0.62) ${shimmer}%, transparent ${shimmer + 18}%)`,
          mixBlendMode: "screen",
          opacity: 0.55,
        }}
      />
    </div>
  );
};

const OrbitDots = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", right: 92, top: 120, width: 640, height: 640 }}>
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          style={{
            position: "absolute",
            inset: ring * 82,
            borderRadius: "50%",
            border: "1px solid rgba(94,164,255,0.18)",
            transform: `rotate(${frame * (0.12 + ring * 0.04)}deg)`,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((dot) => {
            const angle = dot * 60 + ring * 20;
            const radius = 320 - ring * 82;
            return (
              <div
                key={dot}
                style={{
                  position: "absolute",
                  left: radius + Math.cos((angle * Math.PI) / 180) * radius - 6,
                  top: radius + Math.sin((angle * Math.PI) / 180) * radius - 6,
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: dot % 3 === 0 ? colors.green : colors.blue,
                  boxShadow: "0 0 28px rgba(94,164,255,0.75)",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const MiniMetric = ({ label, value, delay }: { label: string; value: string; delay: number }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: fade(frame, delay),
        transform: `translateY(${rise(frame, delay, 18)}px)`,
        padding: "22px 24px",
        borderRadius: 24,
        border: `1px solid ${colors.line}`,
        background: "rgba(255,255,255,0.065)",
      }}
    >
      <div style={{ color: colors.green, fontSize: 38, fontWeight: 900 }}>{value}</div>
      <div style={{ marginTop: 8, color: colors.muted, fontSize: 18, fontWeight: 700 }}>{label}</div>
    </div>
  );
};

const CommunityScene = () => {
  const frame = useCurrentFrame();
  const sceneExit = exit(frame, 205);
  return (
    <AbsoluteFill style={{ opacity: sceneExit }}>
      <Background pulse={0.95} />
      <div style={{ position: "absolute", left: 92, top: 76 }}><Logo compact /></div>
      <OrbitDots />
      <FadeSlide from={8} style={{ position: "absolute", left: 92, top: 220 }}>
        <Eyebrow color={colors.green}>COMMUNITY SIGNAL</Eyebrow>
        <Counter />
        <div style={{ marginTop: 18, fontFamily: "DossierHeading, sans-serif", fontSize: 74, lineHeight: 0.95, letterSpacing: -1.4 }}>
          users have tried Dossier
        </div>
        <Body maxWidth={780}>A free, local-first CV builder for jobseekers who need application-ready documents without rebuilding everything from scratch.</Body>
      </FadeSlide>
      <div style={{ position: "absolute", right: 112, bottom: 108, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, width: 710 }}>
        <MiniMetric value="ATS" label="strong templates" delay={72} />
        <MiniMetric value="PDF" label="clean export" delay={88} />
        <MiniMetric value="BYOK" label="AI review ready" delay={104} />
      </div>
    </AbsoluteFill>
  );
};

const DeviceFrame: React.FC<{ src: string; label: string; style?: React.CSSProperties; objectPosition?: string }> = ({ src, label, style, objectPosition = "center top" }) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 38) * 8;
  return (
    <GlassPanel style={{ padding: 18, overflow: "hidden", transform: `translateY(${float}px)`, ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 26, overflow: "hidden", background: "#08101d" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition, opacity: 0.92 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 48%, rgba(3,5,11,0.92))" }} />
        <div style={{ position: "absolute", left: 24, bottom: 22, right: 24 }}>
          <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(110,231,183,0.34)", background: "rgba(16,185,129,0.14)", color: colors.green, fontSize: 15, fontWeight: 900 }}>
            LIVE APP
          </div>
          <div style={{ marginTop: 12, fontSize: 30, fontWeight: 950, lineHeight: 1.05 }}>{label}</div>
        </div>
      </div>
    </GlassPanel>
  );
};

const WorkflowScene = () => {
  const frame = useCurrentFrame();
  const sceneExit = exit(frame, 236);
  return (
    <AbsoluteFill style={{ opacity: sceneExit }}>
      <Background />
      <div style={{ position: "absolute", left: 92, top: 76 }}><Logo compact /></div>
      <FadeSlide from={0} style={{ position: "absolute", left: 92, top: 148 }}>
        <Eyebrow>FROM ROUGH CV TO READY PDF</Eyebrow>
        <BigType maxWidth={920}>One flow. No storage gate.</BigType>
        <Body maxWidth={760}>Pick a template, import your CV, review improvements, then export a clean text-based PDF.</Body>
      </FadeSlide>
      <FadeSlide from={48} x={80} y={0} style={{ position: "absolute", right: 92, top: 108 }}>
        <DeviceFrame src="video-assets/templates-real.png" label="Template gallery" style={{ width: 560, height: 620, transform: "rotate(1.5deg)" }} />
      </FadeSlide>
      <FadeSlide from={96} x={-40} y={45} style={{ position: "absolute", left: 492, bottom: 86 }}>
        <DeviceFrame src="video-assets/editor-preview-real.png" label="Editable builder" style={{ width: 610, height: 356, transform: "rotate(-1deg)" }} />
      </FadeSlide>
      <div style={{ position: "absolute", left: 92, bottom: 112, display: "grid", gap: 14, width: 330 }}>
        {["Import", "Structure", "Review", "Export"].map((step, index) => (
          <div
            key={step}
            style={{
              opacity: fade(frame, 70 + index * 22),
              padding: "18px 20px",
              borderRadius: 22,
              border: `1px solid ${colors.line}`,
              background: index === 2 ? "rgba(94,164,255,0.16)" : "rgba(255,255,255,0.065)",
              fontSize: 24,
              fontWeight: 900,
              color: index === 2 ? colors.cyan : colors.white,
            }}
          >
            <span style={{ color: colors.green, fontFamily: "monospace", marginRight: 12 }}>0{index + 1}</span>{step}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ReviewCard = ({ delay, title, body, status }: { delay: number; title: string; body: string; status: "Apply" | "Edit" | "Skip" }) => {
  const frame = useCurrentFrame();
  const accent = status === "Apply" ? colors.green : status === "Edit" ? colors.blue : colors.amber;
  return (
    <div
      style={{
        opacity: fade(frame, delay),
        transform: `translateX(${rise(frame, delay, 42)}px)`,
        padding: "22px 24px",
        borderRadius: 24,
        border: `1px solid ${colors.line}`,
        background: "rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
        <div style={{ color: colors.white, fontSize: 24, fontWeight: 950 }}>{title}</div>
        <div style={{ padding: "8px 12px", borderRadius: 999, background: `${accent}22`, border: `1px solid ${accent}66`, color: accent, fontSize: 15, fontWeight: 900 }}>{status}</div>
      </div>
      <div style={{ marginTop: 10, color: colors.muted, fontSize: 18, lineHeight: 1.35 }}>{body}</div>
    </div>
  );
};

const AIReviewScene = () => {
  const frame = useCurrentFrame();
  const score = Math.round(interpolate(frame, [42, 132], [68, 91], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const sceneExit = exit(frame, 222);
  return (
    <AbsoluteFill style={{ opacity: sceneExit }}>
      <Background />
      <div style={{ position: "absolute", left: 92, top: 76 }}><Logo compact /></div>
      <FadeSlide from={0} style={{ position: "absolute", left: 92, top: 154 }}>
        <Eyebrow color={colors.green}>REVIEW BEFORE YOU APPLY</Eyebrow>
        <BigType maxWidth={860}>AI helps. You stay in control.</BigType>
        <Body maxWidth={770}>Bring your own AI key, check keywords and role-fit gaps, then apply only the edits you trust.</Body>
      </FadeSlide>
      <FadeSlide from={42} x={80} y={0} style={{ position: "absolute", right: 92, top: 122 }}>
        <GlassPanel style={{ width: 610, padding: 34 }}>
          <div style={{ fontFamily: "monospace", letterSpacing: 6, color: colors.muted, fontSize: 16 }}>ATS + ROLE FIT</div>
          <div style={{ marginTop: 20, display: "flex", alignItems: "end", gap: 20 }}>
            <div style={{ color: colors.amber, fontSize: 120, lineHeight: 0.84, fontWeight: 950 }}>{score}</div>
            <div style={{ color: colors.muted, fontSize: 24, marginBottom: 8 }}>review score</div>
          </div>
          <div style={{ marginTop: 24, height: 14, borderRadius: 999, background: "rgba(255,255,255,0.09)", overflow: "hidden" }}>
            <div style={{ width: `${score}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${colors.blue}, ${colors.green})` }} />
          </div>
          <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
            <ReviewCard delay={82} title="Keyword gap" body="Add exact target-role phrases where evidence already exists." status="Edit" />
            <ReviewCard delay={108} title="Weak bullet" body="Rewrite one task bullet into outcome-focused recruiter language." status="Apply" />
            <ReviewCard delay={134} title="Unsupported claim" body="No invented metrics, tools, employers, dates, or certifications." status="Skip" />
          </div>
        </GlassPanel>
      </FadeSlide>
    </AbsoluteFill>
  );
};

const ExportScene = () => {
  const frame = useCurrentFrame();
  const stamp = spring({ frame: Math.max(0, frame - 112), fps: 30, config: { damping: 12, stiffness: 96 } });
  const sceneExit = exit(frame, 186);
  return (
    <AbsoluteFill style={{ opacity: sceneExit }}>
      <Background />
      <div style={{ position: "absolute", left: 92, top: 76 }}><Logo compact /></div>
      <FadeSlide from={0} style={{ position: "absolute", left: 92, top: 166 }}>
        <Eyebrow>APPLICATION READY</Eyebrow>
        <BigType maxWidth={850}>Export clean. Move faster.</BigType>
        <Body maxWidth={760}>Readable for recruiters. Structured for automated screening. Still yours to edit.</Body>
      </FadeSlide>
      <FadeSlide from={40} x={80} y={0} style={{ position: "absolute", right: 146, top: 118 }}>
        <GlassPanel style={{ width: 560, height: 690, padding: 22, overflow: "hidden" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 26, overflow: "hidden", background: "#f8fafc" }}>
            <Img src={staticFile("video-assets/pdf-preview-element-real.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            <div
              style={{
                position: "absolute",
                right: 34,
                bottom: 46,
                transform: `scale(${interpolate(stamp, [0, 1], [1.8, 1], clamp)}) rotate(-8deg)`,
                opacity: interpolate(stamp, [0, 1], [0, 1], clamp),
                padding: "13px 18px",
                borderRadius: 14,
                border: `4px solid ${colors.green}`,
                color: colors.green,
                fontSize: 30,
                fontWeight: 950,
                letterSpacing: 2,
              }}
            >
              EXPORTED
            </div>
          </div>
        </GlassPanel>
      </FadeSlide>
      <div style={{ position: "absolute", left: 92, bottom: 128, display: "flex", gap: 14 }}>
        {["Text-based PDF", "ATS-safe", "No account gate"].map((tag, index) => (
          <div key={tag} style={{ opacity: fade(frame, 76 + index * 14), padding: "14px 18px", borderRadius: 999, border: `1px solid ${colors.line}`, background: colors.panel, color: index === 1 ? colors.green : colors.white, fontSize: 21, fontWeight: 900 }}>
            {tag}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FinalScene = () => {
  const frame = useCurrentFrame();
  const scale = spring({ frame: Math.max(0, frame - 10), fps: 30, config: { damping: 18, stiffness: 72 } });
  return (
    <AbsoluteFill>
      <Background pulse={1.08} />
      <div style={{ position: "absolute", left: 92, top: 76 }}><Logo compact /></div>
      <FadeSlide from={8} style={{ position: "absolute", left: 92, top: 210 }}>
        <Eyebrow color={colors.green}>200+ USERS</Eyebrow>
        <div style={{ transform: `scale(${interpolate(scale, [0, 1], [0.96, 1], clamp)})`, transformOrigin: "left center" }}>
          <BigType maxWidth={1260}>Built. Reviewed. Exported.</BigType>
          <Body maxWidth={840}>Thanks to everyone using Dossier to turn rough CVs into application-ready CVs.</Body>
        </div>
      </FadeSlide>
      <FadeSlide from={70} y={60} style={{ position: "absolute", left: 92, right: 92, bottom: 116 }}>
        <GlassPanel style={{ padding: "28px 34px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 34, fontWeight: 950 }}>Dossier</div>
          <div style={{ display: "flex", gap: 12 }}>
            {["Free", "Local-first", "ATS-strong", "AI review-ready"].map((item) => (
              <div key={item} style={{ padding: "12px 16px", borderRadius: 999, border: `1px solid ${colors.line}`, color: item === "ATS-strong" ? colors.green : colors.white, background: "rgba(255,255,255,0.055)", fontSize: 18, fontWeight: 900 }}>{item}</div>
            ))}
          </div>
        </GlassPanel>
      </FadeSlide>
    </AbsoluteFill>
  );
};

export const Dossier200UsersCelebration = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ width, height, color: colors.white, fontFamily: "DossierBody, Lato, sans-serif", overflow: "hidden" }}>
      <Fonts />
      <Sequence from={0} durationInFrames={240}><CommunityScene /></Sequence>
      <Sequence from={220} durationInFrames={270}><WorkflowScene /></Sequence>
      <Sequence from={470} durationInFrames={250}><AIReviewScene /></Sequence>
      <Sequence from={700} durationInFrames={220}><ExportScene /></Sequence>
      <Sequence from={862} durationInFrames={38}><FinalScene /></Sequence>
    </AbsoluteFill>
  );
};
