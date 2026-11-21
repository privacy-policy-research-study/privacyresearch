
import { useState } from "react";
import { visualPolicy } from "./data/policyData";
import "./VisualPresentation.css";

const IMAGE_URL = `${import.meta.env.BASE_URL}spotify-infographic.jpg`;


// Positions are percentages of the infographic image.
// These match the 5-column, 2-row JPEG layout.
const CARD_BUTTONS = [
  { id: 1, left: 3, top: 50.8, width: 17.5, height: 4 },
  { id: 2, left: 22.5, top: 50.8, width: 17.5, height: 4 },
  { id: 3, left: 42.3, top: 50.8, width: 17.5, height: 4 },
  { id: 4, left: 61.8, top: 50.8, width: 17.5, height: 4 },
  { id: 5, left: 81.5, top: 50.8, width: 16, height: 4 },
  { id: 6, left: 3, top: 82.7, width: 17.5, height: 4 },
  { id: 7, left: 22.5, top: 82.7, width: 17.5, height: 4 },
  { id: 8, left: 42.3, top: 82.7, width: 17.5, height: 4 },
  { id: 9, left: 61.8, top: 82.7, width: 17.5, height: 4 },
  { id: 10, left: 81.5, top: 82.7, width: 16, height: 4 },
];

// Draft research-team attention ratings; approve before participant use.
const ATTENTION = { 1: 4, 2: 5, 3: 3, 4: 3, 5: 4, 6: 3, 7: 2, 8: 4, 9: 4, 10: 2 };
const LABELS = ["Very low", "Low", "Moderate", "High", "Very high"];
function Attention({ id }) {
  const level = ATTENTION[id];
  return <div style={{marginTop: 12, color: "#17231b"}}>
    <strong>{level}/5 · {LABELS[level-1]} attention</strong>
    <div aria-label={`${level} out of 5`} role="img" style={{display:"flex", gap:5, marginTop:8}}>
      {[1,2,3,4,5].map(n => <span key={n} style={{height:8, flex:1, borderRadius:4, background:n<=level ? (level>=4 ? "#b45309" : "#16843c") : "#dce4df"}} />)}
    </div>
    {level >= 4 && <p style={{fontWeight:700, color:"#92400e"}}>This topic needs your attention.</p>}
  </div>;
}

export default function VisualPresentation() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageError, setImageError] = useState(false);

  const category = visualPolicy.categories.find(
    (item) => item.id === selectedCategory
  );

  const overlayStyle = (position) => ({
    position: "absolute",
    left: `${position.left}%`,
    top: `${position.top * 1199 / 1065}%`,
    width: `${position.width}%`,
    height: `${position.height}%`,
    display: "block",
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    zIndex: 2,
  });

  return (
    <main className="spotify-visual-page-refined">
      <header className="spotify-visual-header">
        <p className="spotify-visual-eyebrow">VISUAL PRIVACY EXPLANATION</p>
        <h1>Spotify Privacy Policy</h1>
        <p>Explore the privacy policy infographic. Select a topic to view its details.</p>
      </header>
      {imageError ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            background: "#f1f8f3",
            borderRadius: "16px",
          }}
        >
          <h2>Infographic not found</h2>
          <p>
            Make sure your JPEG is saved as
            <strong> public/spotify-infographic.jpg</strong>
          </p>

        </div>
      ) : (
        <div className="spotify-visual-infographic-frame">
          <img
            src={IMAGE_URL}
            alt="Spotify Privacy Policy infographic showing the ten OPP-115 categories"
            onError={() => setImageError(true)}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />

          {/* Clickable View Details buttons */}
          {CARD_BUTTONS.map((position) => {
            const item = visualPolicy.categories.find(
              (entry) => entry.id === position.id
            );

            return (
              <button
                key={position.id}
                type="button"
                aria-label={`View details for ${item?.title || "category"}`}
                title={`View details: ${item?.title || position.id}`}
                onClick={() => setSelectedCategory(position.id)}
                style={overlayStyle(position)}
              />
            );
          })}


        </div>
      )}

      {/* Category details dialog */}
      {category && (
        <div
          role="presentation"
          onClick={() => setSelectedCategory(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={category.title}
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxSizing: "border-box",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "25px",
                  color: "#111111",
                }}
              >
                {category.title}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                aria-label="Close details"
                style={{
                  border: "none",
                  background: "#f0f0f0",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <Attention id={category.id}/>
            <p
              style={{
                color: "#333333",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              {category.summary}
            </p>

            <ul
              style={{
                paddingLeft: "22px",
                color: "#222222",
                lineHeight: 1.8,
              }}
            >
              {category.bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>

            <p
              style={{
                color: "#333333",
                lineHeight: 1.8,
              }}
            >
              {category.details}
            </p>

            <p
              style={{
                fontSize: "13px",
                color: "#666666",
              }}
            >
              Source: {category.sourceSection}
            </p>

            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "12px",
                background: "#1ed760",
                color: "#111111",
                border: "none",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
