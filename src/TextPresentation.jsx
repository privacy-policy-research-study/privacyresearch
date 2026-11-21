
import { visualPolicy } from "./data/policyData.js";
import "./TextPresentation.css";

export default function TextPresentation() {
  const categories = visualPolicy.categories || [];

  return (
    <main className="text-policy-page">
      <header className="text-policy-header">
        <p className="text-policy-label">
          TEXT PRIVACY EXPLANATION
        </p>

        <h1>{visualPolicy.company} Privacy Policy</h1>

        <p className="text-policy-introduction">
          {visualPolicy.introduction ||
            "A clear, text-based explanation of the privacy policy."}
        </p>

        <p className="text-policy-description">
          This explanation covers ten privacy categories.
          Each section describes what Spotify says about
          collecting, using, sharing, and protecting
          personal information.
        </p>
      </header>

      <div className="text-policy-content">
        {categories.map((category, index) => (
          <section
            key={category.id}
            className="text-policy-section"
          >
            <p className="text-policy-section-number">
              SECTION {String(index + 1).padStart(2, "0")}
            </p>

            <h2>{category.title}</h2>

            <p className="text-policy-summary">
              {category.summary}
            </p>

            <h3>Key Points</h3>

            <ul>
              {(category.bullets || []).map(
                (bullet, bulletIndex) => (
                  <li key={bulletIndex}>
                    {bullet}
                  </li>
                )
              )}
            </ul>

            <h3>Detailed Explanation</h3>

            <p className="text-policy-details">
              {category.details ||
                "Additional information is not available yet."}
            </p>
          </section>
        ))}
      </div>


    </main>
  );
}
