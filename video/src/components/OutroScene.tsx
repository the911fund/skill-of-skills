import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 10, stiffness: 80 },
  });

  const urlOpacity = interpolate(frame, [8, 20], [0, 1], {
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
        background: "linear-gradient(135deg, #1e40af 0%, #0f172a 100%)",
      }}
    >
      {/* CTA */}
      <h2
        style={{
          transform: `scale(${scale})`,
          fontSize: 56,
          fontWeight: 700,
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          textAlign: "center",
        }}
      >
        Try it now
      </h2>

      {/* URL */}
      <p
        style={{
          opacity: urlOpacity,
          fontSize: 36,
          color: "#93c5fd",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: "20px 0 0 0",
          textAlign: "center",
        }}
      >
        skills.911fund.io
      </p>
    </AbsoluteFill>
  );
};
