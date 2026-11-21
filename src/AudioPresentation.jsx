import { useEffect, useRef, useState } from "react";
import { visualPolicy } from "./data/policyData.js";
import "./AudioPresentation.css";

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const categories = visualPolicy.categories || [];

// Narration scripts for the ten recorded sections.
const SECTION_ONE = [
  "Spotify collects account details and information about how you use its services.",
  "When you create a Spotify account, you provide personal information such as your email address and date of birth.",
  "As you use Spotify, it also collects information about your activity. This includes your listening history, searches, playlists, and interactions with the service.",
  "Spotify also collects device and technical information.",
  "But why does Spotify collect this information?",
  "According to its privacy policy, Spotify uses personal data to operate its service, personalize recommendations, improve its services, support advertising, and fulfill other purposes described in the policy.",
  "In simple terms, Spotify collects both the information you provide and information about how you use the service. This helps Spotify operate and personalize your experience."
];


const OTHER_SECTIONS = [
  [
    "Spotify shares certain personal information with service providers, business partners, and other recipients.",
    "For example, service providers help Spotify operate and maintain its services.",
    "Spotify may also share information with advertising partners and other business partners for purposes described in its privacy policy.",
    "Some information can be visible to other Spotify users. This includes your profile name and playlists that you choose to make public.",
    "However, not all information is shared in the same way.",
    "The type of personal information shared, and the reason for sharing it, depend on who receives the information and the purpose of the sharing.",
    "In simple terms, Spotify shares certain information to support its services and business activities, while some information may also be visible to other users through public features."
  ],
  [
    "Spotify provides settings that allow you to control certain uses of your personal information and how some of your activity is shared.",
    "For example, you can manage privacy settings and advertising preferences through available account controls.",
    "Spotify also offers a feature called Private Session, which allows you to listen without sharing that listening activity through certain social features.",
    "Depending on the feature, you can control whether your listening activity or recently played artists are visible to others.",
    "You can also manage notification preferences and certain social sharing settings.",
    "However, the available controls depend on the specific feature and how Spotify uses the information.",
    "In simple terms, Spotify gives users several ways to manage privacy, advertising preferences, and the visibility of certain listening activities."
  ],
  [
    "Spotify provides ways for users to access, correct, and request the deletion of their personal information.",
    "For example, you can request a copy of personal data that Spotify holds about you.",
    "You can also correct certain account details, including information that can be updated directly through your account settings.",
    "Spotify also describes how users can request the deletion of personal data.",
    "However, not every request is handled in exactly the same way.",
    "The availability of these rights and how requests are processed depend on the circumstances and applicable requirements described in Spotify's privacy policy.",
    "In simple terms, Spotify provides options to access your information, correct certain details, and request deletion of personal data."
  ],
  [
    "Spotify keeps different types of personal information for different periods of time.",
    "How long information is stored depends on the type of data and the reason Spotify needs it.",
    "For example, Spotify's privacy policy explains that search-query data generally expires after 90 days, although other retention rules may apply.",
    "Streaming history, on the other hand, can be retained for the lifetime of a user's account.",
    "Some information may also remain stored until a user removes it or takes another relevant action.",
    "In certain circumstances, Spotify may retain information for longer periods to meet legal obligations or address safety-related concerns.",
    "In simple terms, Spotify does not keep every type of information for the same amount of time. Some data is retained briefly, while other information may remain for as long as an account exists."
  ],
  [
    "Spotify uses technical and organizational safeguards to help protect users' personal information.",
    "These measures include encryption, pseudonymization, and controls that limit access to certain data.",
    "Spotify also describes policies and procedures related to information security and data retention.",
    "However, no online service or security system can guarantee complete protection against every possible risk.",
    "Users also have a role in protecting their accounts.",
    "For example, Spotify recommends choosing a strong password, keeping that password private, and signing out after using a shared device.",
    "In simple terms, Spotify uses security measures to help protect personal data, while users can take additional steps to help keep their accounts secure."
  ],
  [
    "Spotify may update its privacy policy from time to time.",
    "These updates can reflect changes to its services, practices, or other circumstances.",
    "When Spotify makes material changes to its privacy policy, it says it will provide prominent notice as appropriate.",
    "For example, users may receive a notification within the Spotify service.",
    "Spotify may also communicate important changes through email or a notification on a user's device.",
    "The method of notification depends on the nature of the change and the circumstances.",
    "In simple terms, Spotify's privacy policy can change over time, and the company describes ways it may notify users when important changes occur."
  ],
  [
    "Spotify uses cookies and provides controls related to certain advertising and tracking activities.",
    "For example, users can manage available cookie preferences and tailored advertising settings.",
    "These controls allow users to make choices about certain uses of their information for advertising purposes.",
    "Spotify's California Notice at Collection also describes recognized browser opt-out preference signals.",
    "One example is Global Privacy Control, which is a browser-based signal that communicates a user's preference to opt out of certain data-sharing activities.",
    "Some privacy choices may need to be set again when using a different browser or device.",
    "In simple terms, Spotify describes ways users can manage cookie and advertising preferences, including certain recognized browser-based opt-out signals."
  ],
  [
    "Spotify operates internationally, which means personal information may be transferred between different countries.",
    "When personal data is transferred internationally, Spotify describes legal safeguards intended to protect that information.",
    "Spotify also has rules about who can use its services.",
    "For example, the standard Spotify service has minimum age requirements that depend on the applicable circumstances.",
    "Some younger users may need permission from a parent or legal guardian.",
    "Spotify also offers services and account arrangements designed for particular audiences.",
    "These include Spotify Kids and Managed Accounts, which have separate privacy arrangements.",
    "In simple terms, Spotify describes safeguards for international data transfers and applies different privacy and age-related rules depending on the service and the user."
  ],
  [
    "Spotify's privacy policy also provides information about external websites and how users can contact the company with privacy-related questions.",
    "For example, Spotify may include links to websites or services operated by other organizations.",
    "These external services have their own privacy practices, which may be different from Spotify's.",
    "Spotify also provides contact information for users who want to ask questions or raise concerns about how their personal information is handled.",
    "Users can contact Spotify's privacy team using the contact details provided in its privacy policy.",
    "In simple terms, Spotify explains that third-party websites have their own privacy practices and provides ways for users to get in touch about privacy-related matters."
  ]
];
const ALL_TRANSCRIPTS = [SECTION_ONE, ...OTHER_SECTIONS];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

// Estimated passage tracking: exact synchronization requires ElevenLabs timestamps.
function estimateActivePassage(lines, time, duration) {
  if (!lines.length || !(duration > 0)) return -1;
  const weights = lines.map(({ text }) => Math.max(3, text.trim().split(/\s+/).length));
  const total = weights.reduce((sum, n) => sum + n, 0);
  const position = Math.min(0.999999, Math.max(0, time / duration)) * total;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (position < cumulative) return i;
  }
  return weights.length - 1;
}

function LiveTranscript({ lines, activeIndex, selectedIndex }) {
  const panel = useRef(null);
  useEffect(() => {
    const container = panel.current;
    if (!container) return;
    if (activeIndex < 0) { container.scrollTop = 0; return; }
    const current = container.querySelector('[aria-current="true"]');
    if (!current) return;
    const top = current.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTop = Math.max(0, top - container.clientHeight / 3);
  }, [activeIndex, selectedIndex]);
  return <section className="audio-transcript" aria-label="Narration transcript">
    <h2>Transcript</h2>
    <p>{lines.length ? "Read along with the narration. Highlighting is approximate." : "The transcript will appear when this section is recorded."}</p>
    <div className="audio-transcript-scroll" ref={panel} tabIndex={0} aria-label="Scrollable transcript">
      {lines.map((line, i) => <div key={i} className={`audio-transcript-line ${i === activeIndex ? "audio-transcript-current" : ""}`} aria-current={i === activeIndex ? "true" : undefined}>
        <span className="audio-transcript-speaker">Narrator</span>
        <p>{line.text}</p>
      </div>)}
    </div>
  </section>;
}

export default function AudioPresentation() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [audioError, setAudioError] = useState(false);
  const playerRef = useRef(null);
  const playNextRef = useRef(false);
  const selectedCategory = categories[selectedIndex];
  const audioSrc = `${import.meta.env.BASE_URL}audio/section-${selectedIndex + 1}.mp3`;
  const transcript = (ALL_TRANSCRIPTS[selectedIndex] || []).map(text => ({ text }));
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const isPaused = !isPlaying;

  function handleMetadata(event) {
    const value = event.currentTarget.duration;
    setDuration(Number.isFinite(value) ? value : 0);
    event.currentTarget.playbackRate = speed;
    if (Number.isFinite(value) && value > 0) {
      setActiveIndex(estimateActivePassage(transcript, event.currentTarget.currentTime, value));
    }
  }
  function handleTimeUpdate(event) {
    setCurrentTime(event.currentTarget.currentTime);
    const lines = (ALL_TRANSCRIPTS[selectedIndex] || []).map(text => ({ text }));
    setActiveIndex(estimateActivePassage(lines, event.currentTarget.currentTime, event.currentTarget.duration));
  }
  function togglePlayback() {
    const audio = playerRef.current;
    if (!audio || audioError) return;
    if (audio.paused) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }
  function skipSeconds(seconds) {
    const audio = playerRef.current;
    if (!audio) return;
    const end = Number.isFinite(audio.duration) ? audio.duration : Infinity;
    audio.currentTime = Math.max(0, Math.min(end, audio.currentTime + seconds));
    setCurrentTime(audio.currentTime);
  }
  function changeSection(index, autoPlay = false) {
    playNextRef.current = autoPlay;
    playerRef.current?.pause();
    setSelectedIndex(index);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setActiveIndex(-1);
    setAudioError(false);
  }
  function changeSpeed(value) {
    const next = Number(value);
    setSpeed(next);
    if (playerRef.current) playerRef.current.playbackRate = next;
  }
  useEffect(() => {
    const audio = playerRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
    if (playNextRef.current) {
      playNextRef.current = false;
      // Playback follows a user-initiated play, so browsers normally permit continuation.
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [selectedIndex, speed]);

  function handleEnded() {
    setIsPlaying(false);
    setActiveIndex(-1);
    if (selectedIndex < categories.length - 1) {
      changeSection(selectedIndex + 1, true);
    }
  }

  return (
    <main className="audio-policy-page">
      <header className="audio-policy-header">
        <p className="audio-policy-label">
          PRIVACY POLICY AUDIO
        </p>

        <h1>Spotify Privacy Policy</h1>

        <p>
          Listen to the privacy policy explained in ten sections.
          The next recording plays automatically.
        </p>
      </header>

      <style>{`
        .audio-policy-page .audio-listen-layout {
          display: grid; grid-template-columns: minmax(280px, 0.9fr) minmax(340px, 1.1fr);
          gap: 22px; align-items: start; margin-top: 18px;
        }
        .audio-policy-page .audio-listen-left { min-width: 0; display: flex; flex-direction: column; gap: 18px; }
        .audio-policy-page .audio-player { padding: 20px !important; min-height: 0 !important; margin: 0 !important; }
        .audio-policy-page .audio-player-artwork { display: none !important; }
        .audio-policy-page .audio-player h2 { margin: 6px 0 !important; font-size: 1.25rem !important; }
        .audio-policy-page .audio-now-playing { margin: 0 0 4px !important; }
        .audio-policy-page .audio-player-subtitle { margin: 4px 0 10px !important; }
        .audio-policy-page .audio-player-controls { margin: 12px 0 !important; }
        .audio-policy-page .audio-policy-header { padding-bottom: 12px !important; }
        .audio-policy-page .audio-section-list { margin: 0 !important; }
        .audio-policy-page .audio-transcript {
          margin: 0 !important; min-width: 0; padding: 24px !important;
          position: sticky; top: 16px;
        }
        .audio-policy-page .audio-transcript-scroll {
          max-height: min(72vh, 750px) !important; min-height: 380px;
          overflow-y: auto; scroll-behavior: smooth;
        }
        .audio-policy-page .audio-transcript-line { transition: background .2s, border-color .2s; border-radius: 10px; }
        .audio-policy-page .audio-transcript-line.audio-transcript-current {
          background: rgba(30, 215, 96, .17) !important;
          border-left: 4px solid #1ed760 !important;
          padding-left: 14px !important;
        }
        @media (max-width: 780px) {
          .audio-policy-page .audio-listen-layout { grid-template-columns: 1fr; }
          .audio-policy-page .audio-transcript { position: static; }
          .audio-policy-page .audio-transcript-scroll { min-height: 280px; max-height: 55vh !important; }
        }
      `}</style>
      <div className="audio-listen-layout">
        <div className="audio-listen-left">
      <section className="audio-player">
        <audio key={selectedIndex} ref={playerRef} preload="metadata" src={audioSrc} onLoadedMetadata={handleMetadata} onDurationChange={handleMetadata} onTimeUpdate={handleTimeUpdate} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={handleEnded} onError={() => setAudioError(true)} />
        <div className="audio-player-artwork">♫</div>

        <p className="audio-now-playing">
          NOW PLAYING · SECTION{" "}
          {String(selectedIndex + 1).padStart(2, "0")}

        </p>

        <h2>
          {selectedCategory?.title || "Privacy Policy"}
        </h2>

        <p className="audio-player-subtitle">
          Spotify Privacy Policy Explained
        </p>

        <div
          className="audio-progress-track"
          role="progressbar"
          aria-label="Recording progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="audio-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="audio-progress-labels">
          <span>{Math.round(progress)}% complete</span>
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>

        {audioError && <p role="alert">Recording not found. Check that this section’s MP3 is in public/audio/.</p>}
        <div className="audio-player-controls">
          <button
            type="button"
            className="audio-skip-button"
            onClick={() => skipSeconds(-10)}
              disabled={audioError}
            aria-label="Rewind 10 seconds"
          >
            ↶ <span>10</span>
          </button>

          <button
            type="button"
            className="audio-play-button"
            onClick={togglePlayback}
              disabled={audioError}
          >
            {isPlaying && !isPaused
              ? "❚❚ Pause"
              : "▶ Play"}
          </button>

          <button
            type="button"
            className="audio-skip-button"
            onClick={() => skipSeconds(10)}
              disabled={audioError}
            aria-label="Forward 10 seconds"
          >
            ↷ <span>10</span>
          </button>
        </div>

        <div className="audio-speed-control">
          <label htmlFor="audio-speed">
            Playback speed
          </label>

          <select
            id="audio-speed"
            value={speed}
            onChange={(event) =>
              changeSpeed(event.target.value)
            }
          >
            {SPEEDS.map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="audio-section-list">
        <h2>Choose a Privacy Section</h2>

        <p>Select any section to hear its explanation. Playback continues to the next section automatically.</p>

        <div className="audio-track-list">
          {categories.map((category, index) => (
            <button
              key={category.id || index}
              type="button"
              className={`audio-track ${
                selectedIndex === index
                  ? "audio-track-active"
                  : ""
              }`}
              onClick={() => changeSection(index)}
            >
              <span className="audio-track-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="audio-track-title">
                {category.title}
              </span>

              <span className="audio-track-action">
                {selectedIndex === index
                  ? "Selected"
                  : "Listen →"}
              </span>
            </button>
          ))}
        </div>
      </section>
        </div>
        <LiveTranscript lines={transcript} activeIndex={activeIndex} selectedIndex={selectedIndex} />
      </div>

    </main>
  );
}
