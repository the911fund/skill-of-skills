import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// Total duration: 90 + 135 + 120 + 330 + 105 = 780 frames = 26 seconds
const TOTAL_FRAMES = 780;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MainVideoSquare"
        component={MainVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
