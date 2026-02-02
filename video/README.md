# Skill of Skills - Marketing Video

Remotion-based marketing video for the Maintenance Status feature with TTS narration.

## Quick Start

```bash
cd video

# Install dependencies
npm install

# Open Remotion Studio (preview & edit)
npm run studio

# Render MP4 video (1080p)
npm run render

# Render square format (Instagram/social)
npm run render:square
```

## Video Details

- **Duration**: 26 seconds (780 frames @ 30fps)
- **Resolution**: 1920x1080 (16:9) or 1080x1080 (square)
- **Audio**: TTS narration using macOS Samantha voice
- **Size**: ~1.8 MB

## Video Structure

| Scene | Duration | Content | Audio |
|-------|----------|---------|-------|
| 1. Intro | 3s | Logo + "Introducing Maintenance Status" | TTS intro |
| 2. Problem | 4.5s | "Is that tool still maintained?" | TTS problem |
| 3. Solution | 4s | "Now you know instantly" | TTS solution |
| 4. Badge Showcase | 11s | All 4 badges animating with glow | TTS badge descriptions |
| 5. Outro | 3.5s | CTA with skills.911fund.io | TTS CTA |

## Project Structure

```
video/
├── src/
│   ├── components/
│   │   ├── IntroScene.tsx
│   │   ├── ProblemScene.tsx
│   │   ├── SolutionScene.tsx
│   │   ├── BadgeShowcase.tsx
│   │   └── OutroScene.tsx
│   ├── MainVideo.tsx
│   ├── Root.tsx
│   └── index.ts
├── public/
│   ├── intro.mp3
│   ├── problem.mp3
│   ├── solution.mp3
│   ├── badges.mp3
│   └── outro.mp3
├── out/
│   └── maintenance-feature.mp4
├── package.json
├── remotion.config.ts
└── README.md
```

## Regenerate Audio

To regenerate TTS audio with different voice/content:

```bash
cd video/public

# Generate new audio (macOS)
say -v Samantha -o intro.aiff "Your new intro text"
ffmpeg -y -i intro.aiff -acodec libmp3lame -ab 192k intro.mp3
rm intro.aiff

# Available voices: say -v '?'
```

## Customization

- **Edit scene content**: Modify files in `src/components/`
- **Adjust timing**: Change `durationInFrames` in `src/MainVideo.tsx`
- **Change colors/animations**: Edit individual scene files
- **Replace audio**: Add new MP3 files to `public/` folder

## Output

Rendered videos are saved to `out/` folder (gitignored).
