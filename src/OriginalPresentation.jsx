// Display the professor-provided HTML exactly as supplied, without modifying its markup or styling.
// The surrounding study app still controls randomization, survey routing, and completion.
export default function OriginalPresentation() {
  const source = `${import.meta.env.BASE_URL}spotify-privacy-policy.html`;
  return (
    <main style={{ width: "100%", background: "#fff" }}>
      <iframe
        title="Spotify Privacy Policy — Original"
        src={source}
        style={{ display: "block", width: "100%", height: "100vh", border: 0 }}
      />
    </main>
  );
}
