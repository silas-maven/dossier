import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type DossierHowToVideoProps = {
  title: string;
  subtitle: string;
};

const VIDEO_FRAMES = 2220;

const colors = {
  bg: "#03050b",
  blue: "#5ea4ff",
  blueDeep: "#102a48",
  cyan: "#9fc8ff",
  white: "#f8fbff",
  muted: "rgba(226,232,240,0.66)",
  faint: "rgba(226,232,240,0.16)",
  panel: "rgba(255,255,255,0.07)",
  line: "rgba(148,163,184,0.22)",
  green: "#6ee7b7",
  amber: "#facc6b",
  danger: "#fb7185",
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const fileTypes = ["PDF", "DOCX", "TXT", "Markdown", "RTF"];
const providers = ["OpenAI", "Anthropic", "Gemini", "OpenRouter", "Mistral", "Groq"];

const fade = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: ease });

const slide = (frame: number, start: number, distance = 30, duration = 26) =>
  interpolate(frame, [start, start + duration], [distance, 0], { ...clamp, easing: ease });

const exitFade = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [1, 0], { ...clamp, easing: ease });

const Background = ({ intensity = 1 }: { intensity?: number }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, VIDEO_FRAMES], [-80, 80], clamp);
  const glow = interpolate(Math.sin(frame / 28), [-1, 1], [0.55, 1]);

  return (
    <AbsoluteFill style={{ background: colors.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 16% 16%, rgba(94,164,255,0.28), transparent 34%), radial-gradient(circle at 78% 24%, rgba(14,165,233,0.16), transparent 30%), linear-gradient(135deg,#03050b,#07111f 52%,#03050b)",
          opacity: intensity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -90,
          transform: `translateX(${drift}px)`,
          opacity: 0.2,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -280,
          top: -240,
          width: 820,
          height: 820,
          borderRadius: "50%",
          background: colors.blue,
          opacity: 0.11 * glow,
          filter: "blur(34px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -250,
          bottom: -270,
          width: 720,
          height: 720,
          borderRadius: "50%",
          border: "1px solid rgba(94,164,255,0.22)",
        }}
      />
    </AbsoluteFill>
  );
};

const Logo = ({ compact = false }: { compact?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: compact ? 14 : 18 }}>
    <div
      style={{
        width: compact ? 44 : 52,
        height: compact ? 44 : 52,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        border: "1px solid rgba(94,164,255,0.45)",
        background: "rgba(94,164,255,0.12)",
        color: colors.cyan,
        fontSize: compact ? 15 : 18,
        fontWeight: 900,
      }}
    >
      D
    </div>
    <div
      style={{
        fontFamily: "monospace",
        letterSpacing: compact ? 6 : 7,
        fontSize: compact ? 14 : 18,
        fontWeight: 900,
      }}
    >
      DOSSIER
    </div>
  </div>
);

const GlassPanel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      border: `1px solid ${colors.line}`,
      borderRadius: 34,
      background: "linear-gradient(145deg, rgba(255,255,255,0.105), rgba(255,255,255,0.036))",
      boxShadow: "0 28px 88px rgba(0,0,0,0.42)",
      backdropFilter: "blur(18px)",
      ...style,
    }}
  >
    {children}
  </div>
);

const FadeSlide: React.FC<{
  from: number;
  children: React.ReactNode;
  x?: number;
  y?: number;
  style?: React.CSSProperties;
}> = ({ from, children, x = 0, y = 32, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: fade(frame, from),
        transform: `translate(${slide(frame, from, x)}px, ${slide(frame, from, y)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Eyebrow = ({ children, color = colors.cyan }: { children: React.ReactNode; color?: string }) => (
  <div style={{ fontFamily: "monospace", letterSpacing: 7, color, fontWeight: 900, fontSize: 18 }}>
    {children}
  </div>
);

const Headline = ({ children, maxWidth = 980 }: { children: React.ReactNode; maxWidth?: number }) => (
  <div
    style={{
      marginTop: 22,
      fontSize: 78,
      lineHeight: 1,
      letterSpacing: -2.2,
      fontWeight: 950,
      maxWidth,
    }}
  >
    {children}
  </div>
);

const BodyCopy = ({ children, maxWidth = 760 }: { children: React.ReactNode; maxWidth?: number }) => (
  <div style={{ marginTop: 24, fontSize: 29, lineHeight: 1.36, color: colors.muted, maxWidth }}>
    {children}
  </div>
);

const SceneChrome = ({ progress }: { progress: number }) => (
  <>
    <div style={{ position: "absolute", left: 92, top: 76 }}>
      <Logo compact />
    </div>
    <div
      style={{
        position: "absolute",
        left: 92,
        bottom: 72,
        width: 580,
        height: 6,
        borderRadius: 99,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.max(3, Math.min(100, progress * 100))}%`,
          height: "100%",
          borderRadius: 99,
          background: `linear-gradient(90deg, ${colors.blue}, ${colors.green})`,
        }}
      />
    </div>
  </>
);

const ProblemPill = ({ label, index }: { label: string; index: number }) => {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 54 + index * 24);
  const ty = slide(frame, 54 + index * 24, 20);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${ty}px)`,
        padding: "18px 22px",
        borderRadius: 999,
        color: index === 2 ? colors.amber : colors.white,
        background: index === 2 ? "rgba(250,204,107,0.11)" : "rgba(255,255,255,0.075)",
        border: `1px solid ${index === 2 ? "rgba(250,204,107,0.35)" : colors.line}`,
        fontSize: 24,
        fontWeight: 850,
      }}
    >
      {label}
    </div>
  );
};

const OpeningScene = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(spring({ frame, fps: 30, config: { damping: 18, stiffness: 80 } }), [0, 1], [0.94, 1], clamp);
  const fadeOut = exitFade(frame, 360);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Background intensity={0.88} />
      <SceneChrome progress={0.03} />
      <FadeSlide from={14} style={{ position: "absolute", left: 92, top: 210 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}>
          <Eyebrow>THE CV BUILDER PROBLEM</Eyebrow>
          <Headline maxWidth={1180}>Most CV tools slow jobseekers down.</Headline>
          <BodyCopy maxWidth={900}>
            Start from scratch. Hit a paywall. Export something that looks good, but may not survive automated screening.
          </BodyCopy>
        </div>
      </FadeSlide>
      <div style={{ position: "absolute", left: 92, bottom: 170, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {["Blank-page rebuilds", "Useful features locked", "Templates that do not parse cleanly"].map((label, index) => (
          <ProblemPill key={label} label={label} index={index} />
        ))}
      </div>
      <FadeSlide from={82} x={90} y={0} style={{ position: "absolute", right: 120, top: 236 }}>
        <GlassPanel style={{ width: 500, padding: 30 }}>
          <div style={{ fontFamily: "monospace", letterSpacing: 5, color: colors.danger, fontSize: 15 }}>
            COMMON FLOW
          </div>
          <div style={{ marginTop: 26, display: "grid", gap: 16 }}>
            {["Paste everything again", "Guess the ATS result", "Pay before export"].map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  color: index === 2 ? colors.amber : colors.muted,
                  fontSize: 25,
                  fontWeight: 800,
                }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 99, background: index === 2 ? colors.amber : colors.faint }} />
                {item}
              </div>
            ))}
          </div>
        </GlassPanel>
      </FadeSlide>
    </AbsoluteFill>
  );
};

const PromiseScene = ({ title, subtitle }: DossierHowToVideoProps) => {
  const frame = useCurrentFrame();
  const reveal = fade(frame, 18);
  const cardLift = spring({ frame: Math.max(0, frame - 74), fps: 30, config: { damping: 18, stiffness: 70 } });

  return (
    <AbsoluteFill>
      <Background />
      <SceneChrome progress={0.16} />
      <FadeSlide from={12} style={{ position: "absolute", left: 92, top: 210 }}>
        <Eyebrow color={colors.green}>FREE CV BUILDER</Eyebrow>
        <Headline maxWidth={1050}>{title}</Headline>
        <BodyCopy maxWidth={880}>{subtitle}</BodyCopy>
      </FadeSlide>
      <FadeSlide from={70} x={80} y={0} style={{ position: "absolute", right: 112, top: 185 }}>
        <GlassPanel
          style={{
            width: 520,
            height: 610,
            overflow: "hidden",
            padding: 18,
            transform: `translateY(${interpolate(cardLift, [0, 1], [34, 0], clamp)}px) rotate(-1deg)`,
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 26, overflow: "hidden" }}>
            <Img
              src={staticFile("video-assets/templates-real.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.88 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 42%, rgba(3,5,11,0.94))" }} />
            <div style={{ position: "absolute", left: 28, right: 28, bottom: 34 }}>
              <div style={{ display: "inline-flex", padding: "9px 14px", borderRadius: 999, color: colors.green, border: "1px solid rgba(110,231,183,0.35)", background: "rgba(16,185,129,0.15)", fontSize: 17, fontWeight: 900 }}>
                Parser-friendly templates
              </div>
              <div style={{ marginTop: 18, fontSize: 34, fontWeight: 950, lineHeight: 1.04 }}>
                Choose the look when the story needs it.
              </div>
            </div>
          </div>
        </GlassPanel>
      </FadeSlide>
      <div style={{ position: "absolute", left: 92, bottom: 175, display: "flex", gap: 14, opacity: reveal }}>
        {["Free", "Fast", "Parser-friendly", "Review-only AI"].map((item) => (
          <div key={item} style={{ padding: "13px 18px", borderRadius: 999, border: `1px solid ${colors.line}`, background: colors.panel, fontSize: 21, fontWeight: 850 }}>
            {item}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ImportFlow = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [74, 206], [0, 1], clamp);

  return (
    <GlassPanel style={{ width: 650, padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "monospace", letterSpacing: 5, fontSize: 16, color: colors.muted }}>IMPORT CV</div>
        <div style={{ padding: "8px 12px", borderRadius: 999, background: "rgba(110,231,183,0.12)", color: colors.green, fontSize: 15, fontWeight: 900 }}>
          Editable after import
        </div>
      </div>
      <div style={{ marginTop: 22, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {fileTypes.map((type, index) => (
          <div
            key={type}
            style={{
              opacity: fade(frame, 18 + index * 5),
              padding: "9px 12px",
              borderRadius: 999,
              background: "rgba(94,164,255,0.12)",
              border: "1px solid rgba(94,164,255,0.28)",
              color: colors.cyan,
              fontSize: 15,
              fontWeight: 850,
            }}
          >
            {type}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
        {["Alex_Morgan_CV.pdf", "Read source text", "Map sections", "Ready to edit"].map((item, index) => {
          const active = progress > index * 0.24;
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                borderRadius: 18,
                background: active ? "rgba(94,164,255,0.16)" : "rgba(255,255,255,0.045)",
                border: `1px solid ${active ? "rgba(94,164,255,0.38)" : "rgba(255,255,255,0.07)"}`,
                color: active ? colors.white : colors.muted,
                fontSize: 22,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: active ? colors.blue : "transparent",
                  border: `1px solid ${active ? colors.blue : "rgba(255,255,255,0.22)"}`,
                  boxShadow: active ? "0 0 24px rgba(94,164,255,0.55)" : "none",
                }}
              />
              {item}
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};

const EditorScreenshot = () => (
  <GlassPanel style={{ width: 720, height: 456, padding: 18, overflow: "hidden" }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 24, overflow: "hidden", background: "#07111f" }}>
      <Img
        src={staticFile("video-assets/editor-preview-real.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 64%, rgba(3,5,11,0.86))" }} />
      <div style={{ position: "absolute", left: 22, bottom: 22, fontSize: 24, fontWeight: 950 }}>Structured into editable sections</div>
    </div>
  </GlassPanel>
);

const ImportScene = () => (
  <AbsoluteFill>
    <Background />
    <SceneChrome progress={0.34} />
    <FadeSlide from={8} style={{ position: "absolute", left: 92, top: 150 }}>
      <Eyebrow>START WITH THE CV YOU HAVE</Eyebrow>
      <Headline maxWidth={870}>Import once. Keep it editable.</Headline>
      <BodyCopy maxWidth={760}>
        Dossier turns source CV files into reusable sections instead of locking you into a static PDF.
      </BodyCopy>
    </FadeSlide>
    <FadeSlide from={48} x={70} y={0} style={{ position: "absolute", right: 98, top: 132 }}>
      <ImportFlow />
    </FadeSlide>
    <FadeSlide from={140} y={50} style={{ position: "absolute", left: 92, bottom: 112 }}>
      <EditorScreenshot />
    </FadeSlide>
  </AbsoluteFill>
);

const TemplateRail = () => {
  const frame = useCurrentFrame();
  const pan = interpolate(frame, [60, 260], [0, -250], clamp);

  return (
    <GlassPanel style={{ width: 840, height: 520, padding: 18, overflow: "hidden" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 25, overflow: "hidden", background: "#07111f" }}>
        <Img
          src={staticFile("video-assets/templates-real.png")}
          style={{
            width: "118%",
            height: "118%",
            objectFit: "cover",
            objectPosition: "center top",
            transform: `translateX(${pan}px)`,
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(3,5,11,0.18), transparent 44%, rgba(3,5,11,0.74))" }} />
        <div style={{ position: "absolute", left: 24, bottom: 24, display: "flex", gap: 10 }}>
          {["Parser-friendly", "Creative", "Corporate", "Human-first"].map((tag, index) => (
            <div
              key={tag}
              style={{
                opacity: fade(frame, 94 + index * 14),
                padding: "10px 14px",
                borderRadius: 999,
                background: index === 0 ? "rgba(110,231,183,0.14)" : "rgba(255,255,255,0.09)",
                border: `1px solid ${index === 0 ? "rgba(110,231,183,0.35)" : colors.line}`,
                color: index === 0 ? colors.green : colors.white,
                fontWeight: 900,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
};

const TemplatesScene = () => (
  <AbsoluteFill>
    <Background />
    <SceneChrome progress={0.5} />
    <FadeSlide from={0} style={{ position: "absolute", left: 92, top: 142 }}>
      <Eyebrow>CHOOSE THE RIGHT SYSTEM</Eyebrow>
      <Headline maxWidth={820}>Templates should match the role.</Headline>
      <BodyCopy maxWidth={720}>
        Keep it clean for application portals, or use a more visual layout when a human recruiter will review it directly.
      </BodyCopy>
    </FadeSlide>
    <FadeSlide from={54} x={90} y={0} style={{ position: "absolute", right: 82, top: 214 }}>
      <TemplateRail />
    </FadeSlide>
    <FadeSlide from={160} style={{ position: "absolute", left: 92, bottom: 132 }}>
      <GlassPanel style={{ padding: "22px 26px", width: 600 }}>
        <div style={{ fontSize: 25, fontWeight: 950 }}>Role-first template guidance</div>
        <div style={{ marginTop: 10, color: colors.muted, fontSize: 20, lineHeight: 1.35 }}>
          Pick by industry, layout, and review channel before editing the content.
        </div>
      </GlassPanel>
    </FadeSlide>
  </AbsoluteFill>
);

const AiReviewPanel = () => {
  const frame = useCurrentFrame();
  const score = Math.round(interpolate(frame, [40, 130], [48, 91], clamp));

  return (
    <GlassPanel style={{ width: 650, padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "monospace", letterSpacing: 5, fontSize: 16, color: colors.muted }}>AI REVIEW</div>
        <div style={{ color: colors.green, fontWeight: 900 }}>Session-only key</div>
      </div>
      <div style={{ marginTop: 26, display: "flex", alignItems: "end", gap: 18 }}>
        <div style={{ fontSize: 102, lineHeight: 0.85, fontWeight: 950, color: colors.blue }}>{score}</div>
        <div style={{ marginBottom: 8, fontSize: 24, color: colors.muted }}>role-fit score</div>
      </div>
      <div style={{ marginTop: 28, display: "grid", gap: 15 }}>
        {["Keyword gaps", "Weak bullets", "Missing skills", "Recruiter readability"].map((item, index) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, opacity: fade(frame, 76 + index * 16) }}>
            <div style={{ width: 24, height: 24, borderRadius: 999, background: index < 2 ? "rgba(250,204,107,0.14)" : "rgba(110,231,183,0.14)", border: `1px solid ${index < 2 ? colors.amber : colors.green}` }} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, display: "flex", gap: 9, flexWrap: "wrap" }}>
        {providers.map((provider) => (
          <div key={provider} style={{ borderRadius: 999, padding: "9px 13px", border: `1px solid ${colors.line}`, color: colors.muted, fontSize: 15 }}>
            {provider}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};

const DiffCard = ({ label, from, accent }: { label: string; from: number; accent: string }) => {
  const frame = useCurrentFrame();
  return (
    <GlassPanel
      style={{
        opacity: fade(frame, from),
        transform: `translateY(${slide(frame, from, 20)}px)`,
        width: 360,
        padding: 22,
        borderRadius: 24,
      }}
    >
      <div style={{ fontFamily: "monospace", letterSpacing: 4, color: accent, fontSize: 13 }}>{label}</div>
      <div style={{ marginTop: 16, height: 12, width: "88%", borderRadius: 99, background: "rgba(226,232,240,0.35)" }} />
      <div style={{ marginTop: 11, height: 12, width: "70%", borderRadius: 99, background: "rgba(226,232,240,0.2)" }} />
      <div style={{ marginTop: 19, display: "flex", gap: 8 }}>
        {["Apply", "Edit", "Skip"].map((action, index) => (
          <div
            key={action}
            style={{
              padding: "8px 11px",
              borderRadius: 999,
              background: index === 0 ? colors.blue : "rgba(255,255,255,0.07)",
              color: index === 0 ? "#06101f" : colors.white,
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {action}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};

const AiScene = () => (
  <AbsoluteFill>
    <Background />
    <SceneChrome progress={0.69} />
    <FadeSlide from={8} style={{ position: "absolute", left: 92, top: 130 }}>
      <Eyebrow>TAILOR TO THE JOB</Eyebrow>
      <Headline maxWidth={820}>AI suggests. You approve.</Headline>
      <BodyCopy maxWidth={760}>
        Use your own AI key to review keywords, weak bullets, missing skills, and role-fit gaps. Nothing is applied automatically.
      </BodyCopy>
    </FadeSlide>
    <FadeSlide from={58} x={80} y={0} style={{ position: "absolute", right: 110, top: 138 }}>
      <AiReviewPanel />
    </FadeSlide>
    <div style={{ position: "absolute", left: 92, bottom: 128, display: "flex", gap: 18 }}>
      <DiffCard label="SUGGESTION 01" from={160} accent={colors.amber} />
      <DiffCard label="SUGGESTION 02" from={194} accent={colors.green} />
      <DiffCard label="SUGGESTION 03" from={228} accent={colors.blue} />
    </div>
  </AbsoluteFill>
);

const PdfExportPreview = () => {
  const frame = useCurrentFrame();
  const seal = spring({ frame: Math.max(0, frame - 86), fps: 30, config: { damping: 14, stiffness: 100 } });
  const scale = interpolate(seal, [0, 1], [1.28, 1], clamp);
  const opacity = interpolate(seal, [0, 1], [0, 1], clamp);

  return (
    <GlassPanel style={{ width: 610, height: 590, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: colors.muted, fontFamily: "monospace", letterSpacing: 4, fontSize: 13 }}>
        <span>REAL APP PREVIEW</span>
        <span>PDF EXPORT</span>
      </div>
      <div style={{ position: "relative", marginTop: 16, height: 508, borderRadius: 18, background: "#08111f", overflow: "hidden" }}>
        <Img
          src={staticFile("video-assets/pdf-preview-element-real.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        />
        <div
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            opacity,
            transform: `scale(${scale}) rotate(-6deg)`,
            transformOrigin: "center",
            border: `3px solid ${colors.green}`,
            color: "#047857",
            background: "rgba(240,253,250,0.86)",
            borderRadius: 999,
            padding: "11px 16px",
            fontSize: 16,
            fontWeight: 950,
            letterSpacing: 2,
          }}
        >
          EXPORTED
        </div>
      </div>
    </GlassPanel>
  );
};

const ExportChecklist = () => {
  const frame = useCurrentFrame();
  const bar = interpolate(frame, [70, 176], [0, 1], clamp);
  return (
    <GlassPanel style={{ width: 600, padding: 30 }}>
      <div style={{ fontFamily: "monospace", letterSpacing: 5, fontSize: 16, color: colors.muted }}>EXPORT</div>
      <div style={{ marginTop: 22, fontSize: 46, fontWeight: 950, lineHeight: 1.04 }}>Clean PDF. Selectable text. Ready to send.</div>
      <div style={{ marginTop: 28, height: 16, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${bar * 100}%`, height: "100%", background: `linear-gradient(90deg, ${colors.blue}, ${colors.green})`, borderRadius: 999 }} />
      </div>
      <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {["Free export", "Text-based", "Parser-friendly"].map((item) => (
          <div key={item} style={{ padding: "12px 16px", borderRadius: 999, background: "rgba(94,164,255,0.12)", border: "1px solid rgba(94,164,255,0.3)", color: colors.cyan, fontWeight: 850 }}>
            {item}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};

const ExportScene = () => (
  <AbsoluteFill>
    <Background />
    <SceneChrome progress={0.84} />
    <FadeSlide from={8} style={{ position: "absolute", left: 92, top: 126 }}>
      <Eyebrow>EXPORT WITHOUT THE LOCK-IN</Eyebrow>
      <Headline maxWidth={820}>Send a recruiter-ready PDF.</Headline>
      <BodyCopy maxWidth={720}>
        Keep the polish, preserve text readability, and use a CV designed for recruiters and automated screening systems.
      </BodyCopy>
    </FadeSlide>
    <FadeSlide from={54} x={80} y={0} style={{ position: "absolute", right: 112, top: 92 }}>
      <PdfExportPreview />
    </FadeSlide>
    <FadeSlide from={132} style={{ position: "absolute", left: 92, bottom: 128 }}>
      <ExportChecklist />
    </FadeSlide>
  </AbsoluteFill>
);

const ClosingScene = () => {
  const frame = useCurrentFrame();
  const wordScale = spring({ frame: Math.max(0, frame - 170), fps: 30, config: { damping: 13, stiffness: 90 } });

  return (
    <AbsoluteFill>
      <Background intensity={0.92} />
      <SceneChrome progress={1} />
      <FadeSlide from={46} style={{ position: "absolute", left: 92, top: 260 }}>
        <Eyebrow color={colors.green}>FROM ROUGH CV TO APPLICATION-READY</Eyebrow>
        <Headline maxWidth={1160}>Move faster without giving up control.</Headline>
        <BodyCopy maxWidth={850}>
          Dossier helps you build, review, and export an parser-friendly CV without forcing an account or a paid builder workflow.
        </BodyCopy>
      </FadeSlide>
      <div style={{ position: "absolute", left: 92, bottom: 190, display: "flex", gap: 18 }}>
        {["Build it.", "Review it.", "Export it.", "Free."].map((word, index) => (
          <div
            key={word}
            style={{
              opacity: fade(frame, 150 + index * 22),
              transform: `scale(${index === 3 ? interpolate(wordScale, [0, 1], [0.86, 1], clamp) : 1}) translateY(${slide(frame, 150 + index * 22, 22)}px)`,
              padding: "18px 24px",
              borderRadius: 999,
              background: index === 3 ? colors.blue : colors.panel,
              border: `1px solid ${index === 3 ? colors.blue : colors.line}`,
              color: index === 3 ? "#06101f" : colors.white,
              fontSize: 34,
              fontWeight: 950,
            }}
          >
            {word}
          </div>
        ))}
      </div>
      <FadeSlide from={118} x={90} y={0} style={{ position: "absolute", right: 110, top: 180 }}>
        <GlassPanel style={{ width: 520, padding: 30 }}>
          <div style={{ fontFamily: "monospace", letterSpacing: 5, color: colors.cyan, fontSize: 15 }}>WHY IT EXISTS</div>
          <div style={{ marginTop: 22, display: "grid", gap: 18 }}>
            {["Free tool for jobseekers", "Parser-friendly templates", "AI edits stay review-only"].map((item, index) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, fontWeight: 850, opacity: fade(frame, 146 + index * 18) }}>
                <span style={{ width: 17, height: 17, borderRadius: 999, background: index === 0 ? colors.green : colors.blue }} />
                {item}
              </div>
            ))}
          </div>
        </GlassPanel>
      </FadeSlide>
    </AbsoluteFill>
  );
};

export const DossierHowToVideo = (props: DossierHowToVideoProps) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: colors.white }}>
      <Audio src={staticFile("video-assets/dossier-narration.mp3")} volume={(frame) => interpolate(frame, [0, fps, VIDEO_FRAMES - fps, VIDEO_FRAMES], [0, 1, 1, 0], clamp)} />
      <Sequence from={0} durationInFrames={390} premountFor={30}>
        <OpeningScene />
      </Sequence>
      <Sequence from={360} durationInFrames={210} premountFor={30}>
        <PromiseScene {...props} />
      </Sequence>
      <Sequence from={540} durationInFrames={510} premountFor={30}>
        <ImportScene />
      </Sequence>
      <Sequence from={1010} durationInFrames={310} premountFor={30}>
        <TemplatesScene />
      </Sequence>
      <Sequence from={1260} durationInFrames={465} premountFor={30}>
        <AiScene />
      </Sequence>
      <Sequence from={1695} durationInFrames={330} premountFor={30}>
        <ExportScene />
      </Sequence>
      <Sequence from={1965} durationInFrames={255} premountFor={30}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
