PRIVACY POLICY EXPLORER — four presentation updates

Copy the patch into your existing project, not into an empty folder.
In Terminal:
cd ~/Desktop/privacy-policy-explorer
cp -R src ~/Desktop/privacy-src-backup-$(date +%Y%m%d-%H%M%S)
unzip -o ~/Downloads/privacy-update-v2.zip -d .
npm run dev

Audio: improved browser voice selection and simpler two-speaker narration, default 1x. Live transcript highlights each spoken sentence and scrolls inside its own panel. Quality depends on device. Optional fixed neural audio (requires network, Python, ffmpeg, edge-tts; sends only narration text to third-party speech service):
  brew install ffmpeg
  python3 -m venv .audio-venv
  source .audio-venv/bin/activate
  pip install edge-tts
  python scripts/generate-audio.py
Recorded mode now requires sentence timings in public/audio/transcript-timings.json for highlighting. Regenerate existing recordings using the updated script; it creates both MP3 files and timings. Custom human recordings require matching manually aligned sentence timestamps. Listen and approve every recording before use. Neural generation is optional and has not been executed here.

Verify: original PDF evidence and references remain, now inline under selected topic; click again to close.
Visual: proposed 1–5 attention scores, not official Spotify ratings or validated risks. Obtain professor approval before using with participants. Scores are in ATTENTION in VisualPresentation.jsx.
Original: native HTML extracted from the supplied July 1 2026 PDF, with corrected font ligatures. Browser print headers, website navigation and footer omitted. PDF page breaks can split tables and lists; review text and table formatting against the original before using as control. Original PDF is untouched.

Check local URLs: use the URL printed by Vite, add /?mode=verify, /?mode=visual, /?mode=audio or /?mode=original.

When approved, stop dev server (Ctrl+C) and run:
python3 scripts/build-updated.py
Upload contents of each github-websites/{audio,verify,visual,original} folder to the corresponding existing repository root; commit and test deployed links. Text and Chat are not rebuilt. App.jsx is restored automatically after build. This patch does not change App.jsx, Text, Chat, original PDF, infographic or API configuration.
