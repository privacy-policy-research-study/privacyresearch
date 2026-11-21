
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { visualPolicy } from "./data/policyData.js";
import "./VerifyPresentation.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDF_URL = `${import.meta.env.BASE_URL}spotify-policy.pdf`;

const GREEN = "#1DB954";

/*
  SOURCE REFERENCES

  Each OPP-115 category contains relevant sections
  of Spotify's original privacy policy.

  Page numbers are starting-page suggestions.
  Check them against your exact PDF before using
  them as final research citations.

  No highlighting or automatic text searching.
*/

const SOURCE_REFERENCES = {
  1: [
    {
      title: "Personal Data Spotify Collects",
      section: "Section 3",
      description:
        "Read about account information, listening activity, and other data collected by Spotify.",
      page: 8,
    },
    {
      title: "How Spotify Uses Personal Data",
      section: "Section 4",
      description:
        "Read why Spotify processes personal information, including providing and personalizing its services.",
      page: 16,
    },
  ],

  2: [
    {
      title: "Disclosing Personal Data",
      section: "Section 5",
      description:
        "Read about the categories of recipients with whom Spotify shares personal information.",
      page: 21,
    },
    {
      title: "Service Providers and Partners",
      section: "Section 5",
      description:
        "Explore sharing with service providers, business partners, and other recipients.",
      page: 23,
    },
  ],

  3: [
    {
      title: "Your Privacy Rights and Controls",
      section: "Section 2",
      description:
        "Read about the privacy choices and rights available to Spotify users.",
      page: 4,
    },
    {
      title: "Advertising Preferences",
      section: "Section 2",
      description:
        "Explore the controls Spotify describes for tailored advertising.",
      page: 7,
    },
  ],

  4: [
    {
      title: "Accessing Personal Data",
      section: "Section 2",
      description:
        "Read about requesting access to personal information.",
      page: 4,
    },
    {
      title: "Correcting and Deleting Data",
      section: "Section 2",
      description:
        "Read about correction, deletion, and other personal data rights.",
      page: 5,
    },
  ],

  5: [
    {
      title: "Data Retention",
      section: "Section 6",
      description:
        "Read how Spotify determines how long different categories of personal data are kept.",
      page: 28,
    },
  ],

  6: [
    {
      title: "Keeping Personal Data Safe",
      section: "Section 8",
      description:
        "Read about the technical and organizational measures Spotify describes for protecting data.",
      page: 29,
    },
  ],

  7: [
    {
      title: "Changes to the Privacy Policy",
      section: "Section 12",
      description:
        "Read how Spotify may change its privacy policy and notify users.",
      page: 31,
    },
  ],

  8: [
    {
      title: "Advertising Controls",
      section: "Section 2",
      description:
        "Read the policy's discussion of tailored advertising choices.",
      page: 7,
    },
    {
      title: "Cookie and Tracking Information",
      section: "Privacy and Cookie Controls",
      description:
        "Review the policy for cookie controls and tracking-related information.",
      page: 7,
    },
  ],

  9: [
    {
      title: "International Data Transfers",
      section: "Section 7",
      description:
        "Read how Spotify describes transfers of personal data between countries.",
      page: 29,
    },
    {
      title: "Children and Age Requirements",
      section: "Section 9",
      description:
        "Read about minimum age requirements and children's privacy.",
      page: 30,
    },
  ],

  10: [
    {
      title: "Third-Party Links",
      section: "Section 10",
      description:
        "Read what Spotify says about websites and services operated by third parties.",
      page: 30,
    },
    {
      title: "Contacting Spotify",
      section: "Section 13",
      description:
        "Find information about contacting Spotify with privacy questions.",
      page: 31,
    },
  ],
};

/*
  ORIGINAL PDF VIEWER

  Renders the PDF exactly as it appears.
  No highlights, overlays, or text modifications.
*/

function OriginalPDFViewer({ pdf, pageNumber, zoom }) {
  const canvasRef = useRef(null);

  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pdf || !pageNumber) return;

    let cancelled = false;
    let renderTask = null;

    async function renderPage() {
      setRendering(true);
      setError("");

      try {
        const page = await pdf.getPage(pageNumber);

        if (cancelled) return;

        const viewport = page.getViewport({
          scale: 1.35 * zoom,
        });

        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
        });

        await renderTask.promise;
      } catch (err) {
        if (
          !cancelled &&
          err?.name !== "RenderingCancelledException"
        ) {
          console.error(err);
          setError("Unable to display this PDF page.");
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;

      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNumber, zoom]);

  return (
    <div className="verify-pdf-area">
      {rendering && (
        <p
          style={{
            padding: "14px",
            textAlign: "center",
            color: "#666",
          }}
        >
          Loading original PDF page...
        </p>
      )}

      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "750px",
          background: "#e9ece9",
          padding: "12px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          <canvas
            ref={canvasRef}
            className="verify-pdf-canvas"
            style={{
              display: "block",
              maxWidth: "none",
              background: "#fff",
              boxShadow:
                "0 3px 16px rgba(0,0,0,0.12)",
            }}
          />
        </div>
      </div>

      {error && (
        <p className="verify-error">{error}</p>
      )}
    </div>
  );
}

export default function VerifyPresentation() {
  const categories = visualPolicy.categories || [];


  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedIndex, setSelectedIndex] =
    useState(null);

  const [referenceIndex, setReferenceIndex] =
    useState(0);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [zoom, setZoom] = useState(1);

  // Load the original Spotify PDF.
  useEffect(() => {
    let cancelled = false;

    const task = pdfjsLib.getDocument({
      url: PDF_URL,
      useSystemFonts: true,
      disableFontFace: true,
    });

    task.promise
      .then((document) => {
        if (!cancelled) {
          setPdf(document);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);

          setLoadError(
            `Unable to load the original PDF: ${err.message}`
          );

          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      task.destroy();
    };
  }, []);

  const category =
    selectedIndex === null
      ? null
      : categories[selectedIndex];

  const references = category
    ? SOURCE_REFERENCES[category.id] || []
    : [];

  const selectedReference =
    references[referenceIndex] || null;

  function selectCategory(index) {
    if (selectedIndex === index) { closeViewer(); return; }
    const item = categories[index];

    const firstReference =
      SOURCE_REFERENCES[item.id]?.[0];

    setSelectedIndex(index);
    setReferenceIndex(0);
    setCurrentPage(firstReference?.page || 1);
    setZoom(1);
  }

  function selectReference(index) {
    const reference = references[index];

    if (!reference) return;

    setReferenceIndex(index);
    setCurrentPage(reference.page);
  }

  function previousReference() {
    if (referenceIndex > 0) {
      selectReference(referenceIndex - 1);
    }
  }

  function nextReference() {
    if (referenceIndex < references.length - 1) {
      selectReference(referenceIndex + 1);
    }
  }

  function changePage(delta) {
    if (!pdf) return;

    setCurrentPage((page) =>
      Math.max(
        1,
        Math.min(pdf.numPages, page + delta)
      )
    );
  }

  function changeZoom(delta) {
    setZoom((value) =>
      Math.max(
        0.6,
        Math.min(
          2,
          Number((value + delta).toFixed(1))
        )
      )
    );
  }

  function closeViewer() {
    setSelectedIndex(null);
    setReferenceIndex(0);
    setCurrentPage(1);
    setZoom(1);
  }

  const smallButtonStyle = {
    padding: "10px 15px",
    border: "1px solid #d8e4da",
    borderRadius: "10px",
    background: "#fff",
    color: "#222",
    fontSize: "14px",
    fontWeight: 650,
    cursor: "pointer",
  };

  const greenButtonStyle = {
    ...smallButtonStyle,
    background: GREEN,
    borderColor: GREEN,
    color: "#111",
    fontWeight: 750,
  };

  return (
    <main className="verify-policy-page">
      {/* PAGE HEADER */}
      <header className="verify-policy-header">
        <p className="verify-policy-label">
          PRIVACY POLICY VERIFICATION
        </p>

        <h1>Spotify Privacy Policy</h1>

        <p>
          Compare simplified privacy explanations with
          Spotify's original Privacy Policy.
        </p>
      </header>

      {/* INTRODUCTION */}
      <section className="verify-intro">
        <h2>Check the Original Source</h2>

        <p>
          Select a privacy topic to explore the relevant
          sections of Spotify's original policy.
          Read the source directly and compare it
          with the simplified explanation.
        </p>
      </section>

      {/* TEN OPP-115 CATEGORY CARDS */}
      <div className="verify-section-list">
        {categories.map((item, index) => (
          <div key={item.id} className="verify-accordion-item">
          <div
            className={`verify-section-card ${
              selectedIndex === index
                ? "verify-selected"
                : ""
            }`}
          >
            <div className="verify-section-info">
              <span className="verify-section-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
            </div>

            <button
              type="button"
              className="verify-button"
              aria-expanded={selectedIndex === index}
              aria-controls={selectedIndex === index ? `evidence-${item.id}` : undefined}
              onClick={() => selectCategory(index)}
            >
              {selectedIndex === index
                ? "Verify ▲"
                : "Verify ▼"}
            </button>
          </div>
      {/* SOURCE COMPARISON */}
      {selectedIndex === index && category && (
        <section
          className="verify-evidence-section"
          id={`evidence-${item.id}`}
        >
          <div className="verify-evidence-header">
            <div>
              <p className="verify-evidence-label">
                ORIGINAL POLICY COMPARISON
              </p>

              <h2>{category.title}</h2>
            </div>

            <button
              type="button"
              className="verify-close-button"
              onClick={closeViewer}
            >
              Close ✕
            </button>
          </div>

          {/* SOURCE REFERENCE SELECTOR */}
          <div
            style={{
              background: "#f5faf6",
              border: "1px solid #dbe9de",
              borderRadius: "18px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "15px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#111",
                }}
              >
                Original Policy References
              </h3>

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#16843c",
                }}
              >
                {referenceIndex + 1} of{" "}
                {references.length}
              </span>
            </div>

            {/* CLICKABLE SOURCE CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >
              {references.map((reference, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectReference(index)}
                  aria-pressed={
                    referenceIndex === index
                  }
                  style={{
                    padding: "17px",
                    borderRadius: "13px",
                    border:
                      referenceIndex === index
                        ? `2px solid ${GREEN}`
                        : "1px solid #d7e4da",
                    background:
                      referenceIndex === index
                        ? "#eaf8ee"
                        : "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#16843c",
                      marginBottom: "8px",
                    }}
                  >
                    SOURCE {String(index + 1).padStart(2, "0")}
                  </span>

                  <strong
                    style={{
                      display: "block",
                      color: "#111",
                      fontSize: "15px",
                      marginBottom: "8px",
                    }}
                  >
                    {reference.title}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#555",
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    {reference.section}
                  </span>

                  <span
                    style={{
                      display: "block",
                      color: "#16843c",
                      fontSize: "13px",
                      fontWeight: 700,
                      marginTop: "9px",
                    }}
                  >
                    Suggested PDF page {reference.page}
                  </span>
                </button>
              ))}
            </div>

            {/* SOURCE NAVIGATION */}
            {references.length > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                <button
                  type="button"
                  onClick={previousReference}
                  disabled={referenceIndex === 0}
                  style={{
                    ...smallButtonStyle,
                    opacity:
                      referenceIndex === 0 ? 0.45 : 1,
                    cursor:
                      referenceIndex === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ← Previous Source
                </button>

                <button
                  type="button"
                  onClick={nextReference}
                  disabled={
                    referenceIndex === references.length - 1
                  }
                  style={{
                    ...greenButtonStyle,
                    opacity:
                      referenceIndex === references.length - 1
                        ? 0.45
                        : 1,
                    cursor:
                      referenceIndex === references.length - 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Next Source →
                </button>
              </div>
            )}
          </div>

          {/* SIDE-BY-SIDE COMPARISON */}
          <div className="verify-comparison">
            {/* LEFT: SIMPLIFIED EXPLANATION */}
            <div className="verify-explanation-box">
              <h3>Simplified Explanation</h3>

              <p>{category.summary}</p>

              <h3>Original Source</h3>

              <p>
                <strong>
                  {selectedReference?.title}
                </strong>
              </p>

              <p>{selectedReference?.section}</p>

              <p>
                {selectedReference?.description}
              </p>

              <p className="verify-page-number">
                Suggested starting page:{" "}
                {selectedReference?.page}
              </p>

              <p className="verify-evidence-note">
                The PDF is displayed without highlighting
                or modifications. Read the original text
                and surrounding context to assess whether
                it supports the simplified explanation.
                Page references are starting points and
                should be checked against the PDF.
              </p>
            </div>

            {/* RIGHT: ORIGINAL PDF */}
            <div className="verify-pdf-box">
              <div className="verify-pdf-toolbar">
                <span>
                  Spotify Privacy Policy
                </span>

                <span>
                  Page {currentPage}
                  {pdf ? ` of ${pdf.numPages}` : ""}
                </span>
              </div>

              {/* PDF PAGE AND ZOOM CONTROLS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  padding: "12px",
                  background: "#f7f8f7",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => changePage(-1)}
                    disabled={!pdf || currentPage <= 1}
                    style={smallButtonStyle}
                    aria-label="Previous PDF page"
                  >
                    ←
                  </button>

                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {currentPage}
                    {pdf ? ` / ${pdf.numPages}` : ""}
                  </span>

                  <button
                    type="button"
                    onClick={() => changePage(1)}
                    disabled={
                      !pdf ||
                      currentPage >= pdf.numPages
                    }
                    style={smallButtonStyle}
                    aria-label="Next PDF page"
                  >
                    →
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => changeZoom(-0.2)}
                    style={smallButtonStyle}
                    aria-label="Zoom out"
                  >
                    −
                  </button>

                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {Math.round(zoom * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={() => changeZoom(0.2)}
                    style={smallButtonStyle}
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                </div>
              </div>

              {loading && (
                <p
                  style={{
                    padding: "25px",
                    textAlign: "center",
                  }}
                >
                  Loading Spotify's original PDF...
                </p>
              )}

              {loadError && (
                <p className="verify-error">
                  {loadError}
                </p>
              )}

              {pdf && (
                <OriginalPDFViewer
                  pdf={pdf}
                  pageNumber={Math.max(
                    1,
                    Math.min(pdf.numPages, currentPage)
                  )}
                  zoom={zoom}
                />
              )}


            </div>
          </div>
        </section>
      )}

          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="verify-policy-footer">
        <p>
          This page helps readers compare
          simplified privacy information with Spotify's
          original Privacy Policy. Source references are
          navigation aids, not automatic verification
          judgments.
        </p>
      </footer>
    </main>
  );
}
