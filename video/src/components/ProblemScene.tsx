import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();

  const questionOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const questionScale = interpolate(frame, [0, 20], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const marksOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const painOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const marks = ["❓", "🤔", "❓"];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        padding: 80,
      }}
    >
      {/* Main Question */}
      <h2
        style={{
          opacity: questionOpacity,
          transform: `scale(${questionScale})`,
          fontSize: 56,
          fontWeight: 700,
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          lineHeight: 1.3,
          textAlign: "center",
        }}
      >
        Is that tool still maintained?
      </h2>

      {/* Animated question marks */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginTop: 30,
          opacity: marksOpacity,
        }}
      >
        {marks.map((mark, i) => {
          const delay = i * 5;
          const y = interpolate(frame - 30 - delay, [0, 10], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <span
              key={i}
              style={{
                fontSize: 48,
                transform: `translateY(${y}px)`,
              }}
            >
              {mark}
            </span>
          );
        })}
      </div>

      {/* Pain point */}
      <p
        style={{
          fontSize: 28,
          color: "#94a3b8",
          fontFamily: "system-ui, -apple-system, sans-serif",
          marginTop: 40,
          opacity: painOpacity,
          textAlign: "center",
        }}
      >
        Checking GitHub commit dates manually is tedious...
      </p>
    </AbsoluteFill>
  );
};
