import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const checkScale = spring({
    fps,
    frame: frame - 10,
    config: { damping: 8, stiffness: 80 },
  });

  const textOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [25, 45], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subTextOpacity = interpolate(frame, [50, 70], [0, 1], {
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
        background: "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)",
      }}
    >
      {/* Success checkmark */}
      <div
        style={{
          transform: `scale(${checkScale})`,
          fontSize: 100,
        }}
      >
        ✅
      </div>

      {/* Solution text */}
      <h2
        style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          fontSize: 56,
          fontWeight: 700,
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: "20px 0 0 0",
          textAlign: "center",
        }}
      >
        Now you know instantly
      </h2>

      {/* Subtitle */}
      <p
        style={{
          opacity: subTextOpacity,
          fontSize: 28,
          color: "#86efac",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: "20px 0 0 0",
          textAlign: "center",
        }}
      >
        Maintenance badges show health at a glance
      </p>
    </AbsoluteFill>
  );
};
