import { useState } from "react";
import ChatPresentation from "./ChatPresentation";
import VerifyPresentation from "./VerifyPresentation";
import OriginalPresentation from "./OriginalPresentation";
import AudioPresentation from "./AudioPresentation";
import TextPresentation from "./TextPresentation";
import VisualPresentation from "./VisualPresentation";
import { surveyLinks } from "./studySurveyLinks";
import "./App.css";

// All six approved presentation components are imported unchanged.
const pages = {
  audio: AudioPresentation,
  visual: VisualPresentation,
  original: OriginalPresentation,
  text: TextPresentation,
  chat: ChatPresentation,
  verify: VerifyPresentation,
};
const formats = Object.keys(pages);
const assignmentKey = "privacy-study-assignment-v1";
const progressKey = "privacy-study-progress-v1";

function getAssignment() {
  const params = new URLSearchParams(window.location.search);
  // The old condition-specific links continue to work for testing.
  const requested = params.get("mode");
  if (Object.prototype.hasOwnProperty.call(pages, requested)) return requested;
  try {
    const existing = window.localStorage.getItem(assignmentKey);
    if (Object.prototype.hasOwnProperty.call(pages, existing)) return existing;
  } catch { /* Private browsing may block storage. */ }
  const random = new Uint32Array(1);
  window.crypto.getRandomValues(random);
  const selected = formats[random[0] % formats.length];
  try { window.localStorage.setItem(assignmentKey, selected); } catch { /* no storage */ }
  return selected;
}

function getInitialStage() {
  const stage = new URLSearchParams(window.location.search).get("stage");
  if (stage === "thanks") return "thanks";
  try {
    const saved = window.sessionStorage.getItem(progressKey);
    if (["welcome", "presentation", "survey"].includes(saved)) return saved;
  } catch { /* no storage */ }
  return "welcome";
}

export default function App() {
  const [mode] = useState(getAssignment);
  const [stage, setStage] = useState(getInitialStage);
  const Page = pages[mode];
  const surveyUrl = surveyLinks[mode];

  function advance(next) {
    try { window.sessionStorage.setItem(progressKey, next); } catch { /* no storage */ }
    setStage(next);
    window.scrollTo(0, 0);
  }

  if (stage === "thanks") return (
    <main className="study-intro-page"><section className="study-intro-card">
      <div className="study-intro-kicker">PRIVACY POLICY RESEARCH STUDY</div>
      <h1>Thank you for participating!</h1>
      <p>Thank you for taking part in this research study. Your time and contribution are appreciated.</p>
      <p>You may now close this window.</p>
    </section></main>
  );

  if (stage === "welcome") return (
    <main className="study-intro-page"><section className="study-intro-card" aria-labelledby="study-title">
      <div className="study-intro-kicker">PRIVACY POLICY RESEARCH STUDY</div>
      <h1 id="study-title">Welcome to the Privacy Policy Study</h1>
      <p>Thank you for taking part in this research study. This study explores how people understand information presented in the Spotify Privacy Policy.</p>
      <p>Please review the information carefully, at your own pace. After viewing the presentation, you will be asked to complete a survey.</p>
      <p>Participation is voluntary. Please follow the study information and consent instructions provided by the research team.</p>
      <button type="button" className="study-start-button" onClick={() => advance("presentation")}>Begin Study <span aria-hidden="true">→</span></button>
    </section></main>
  );

  if (stage === "survey") return (
    <main className="study-intro-page"><section className="study-intro-card">
      <div className="study-intro-kicker">PRIVACY POLICY RESEARCH STUDY</div>
      <h1>Next: Complete the Survey</h1>
      <p>Thank you for reviewing the privacy policy information. The next step is to complete a short research survey.</p>
      {surveyUrl ? (
        <a className="study-start-button study-action-link" href={surveyUrl}>Continue to Survey <span aria-hidden="true">→</span></a>
      ) : (
        <p><strong>The survey link for this format has not been configured yet.</strong> Please contact the research team.</p>
      )}
    </section></main>
  );

  return <div className="website">
    <a className="skip-link" href="#main">Skip to main content</a>
    <div id="main"><Page /></div>
    <footer className="study-completion-footer">
      <p>Finished reviewing the privacy policy?</p>
      <button type="button" className="study-start-button" onClick={() => advance("survey")}>I Have Finished Viewing <span aria-hidden="true">→</span></button>
    </footer>
  </div>;
}
