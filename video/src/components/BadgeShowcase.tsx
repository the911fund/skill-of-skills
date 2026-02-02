import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

type MaintenanceStatus = "Active" | "Maintained" | "Stale" | "Inactive";

interface BadgeInfo {
  status: MaintenanceStatus;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

const badges: BadgeInfo[] = [
  {
    status: "Active",
    icon: "🟢",
    color: "#22c55e",
    bgColor: "#052e16",
    description: "Updated within 30 days",
  },
  {
    status: "Maintained",
    icon: "🟡",
    color: "#eab308",
    bgColor: "#422006",
    description: "Updated within 90 days",
  },
  {
    status: "Stale",
    icon: "🟠",
    color: "#f97316",
    bgColor: "#431407",
    description: "90-180 days since update",
  },
  {
    status: "Inactive",
    icon: "🔴",
    color: "#ef4444",
    bgColor: "#450a0a",
    description: "Over 180 days since update",
  },
];

export const BadgeShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0, 25], [20, 0], {
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
        padding: 60,
      }}
    >
      {/* Title */}
      <h2
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 48,
          fontWeight: 700,
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: "0 0 40px 0",
          textAlign: "center",
        }}
      >
        Maintenance Status Levels
      </h2>

      {/* Badge Grid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {badges.map((badge, index) => (
          <BadgeRow key={badge.status} badge={badge} index={index} frame={frame} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const BadgeRow: React.FC<{ badge: BadgeInfo; index: number; frame: number }> = ({
  badge,
  index,
  frame,
}) => {
  const { fps } = useVideoConfig();
  // Stagger each badge by ~2.5 seconds (75 frames) to match audio narration
  const delay = 30 + index * 75;
  const localFrame = Math.max(0, frame - delay);

  const scale = spring({
    fps,
    frame: localFrame,
    config: { damping: 12, stiffness: 100 },
  });

  const slideX = interpolate(localFrame, [0, 20], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight effect when badge is "active" in narration
  const glowOpacity = interpolate(localFrame, [0, 30, 60, 75], [0, 0.5, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        transform: `translateX(${slideX}px) scale(${scale})`,
        opacity,
        backgroundColor: badge.bgColor,
        borderRadius: 16,
        padding: "16px 28px",
        border: `2px solid ${badge.color}40`,
        boxShadow: `0 0 ${30 * glowOpacity}px ${badge.color}`,
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: `${badge.color}20`,
          borderRadius: 8,
          padding: "8px 16px",
          minWidth: 160,
        }}
      >
        <span style={{ fontSize: 22 }}>{badge.icon}</span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: badge.color,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {badge.status}
        </span>
      </div>

      {/* Description */}
      <span
        style={{
          fontSize: 20,
          color: "#94a3b8",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {badge.description}
      </span>
    </div>
  );
};
