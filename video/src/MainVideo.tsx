import { AbsoluteFill, Series, Audio, staticFile } from "remotion";
import { IntroScene } from "./components/IntroScene";
import { ProblemScene } from "./components/ProblemScene";
import { SolutionScene } from "./components/SolutionScene";
import { BadgeShowcase } from "./components/BadgeShowcase";
import { OutroScene } from "./components/OutroScene";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a" }}>
      <Series>
        {/* Scene 1: Intro - 3 seconds (90 frames) */}
        <Series.Sequence durationInFrames={90}>
          <IntroScene />
          <Audio src={staticFile("intro.mp3")} volume={1} />
        </Series.Sequence>

        {/* Scene 2: The Problem - 4.5 seconds (135 frames) */}
        <Series.Sequence durationInFrames={135}>
          <ProblemScene />
          <Audio src={staticFile("problem.mp3")} volume={1} />
        </Series.Sequence>

        {/* Scene 3: The Solution - 4 seconds (120 frames) */}
        <Series.Sequence durationInFrames={120}>
          <SolutionScene />
          <Audio src={staticFile("solution.mp3")} volume={1} />
        </Series.Sequence>

        {/* Scene 4: Badge Showcase - 11 seconds (330 frames) */}
        <Series.Sequence durationInFrames={330}>
          <BadgeShowcase />
          <Audio src={staticFile("badges.mp3")} volume={1} />
        </Series.Sequence>

        {/* Scene 5: Outro / CTA - 3.5 seconds (105 frames) */}
        <Series.Sequence durationInFrames={105}>
          <OutroScene />
          <Audio src={staticFile("outro.mp3")} volume={1} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
