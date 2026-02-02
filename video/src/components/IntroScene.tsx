import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    fps,
    frame,
    config: { damping: 12, stiffness: 100 },
  });

  const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [20, 40], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      }}
    >
      {/* Logo / Icon */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          fontSize: 100,
        }}
      >
        🔧
      </div>

      {/* Title */}
      <h1
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 72,
          fontWeight: 800,
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: "20px 0 0 0",
          textAlign: "center",
        }}
      >
        Skill of Skills
      </h1>

      {/* Subtitle */}
      <p
        style={{
          opacity: subtitleOpacity,
          fontSize: 32,
          color: "#94a3b8",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: "16px 0 0 0",
          textAlign: "center",
        }}
      >
        Introducing Maintenance Status
      </p>
    </AbsoluteFill>
  );
};
