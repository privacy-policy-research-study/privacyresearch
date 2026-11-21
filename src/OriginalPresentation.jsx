
import { useEffect, useRef } from "react";

// Display the professor's original HTML without changing its content or styling.
export default function OriginalPresentation() {
  const iframeRef = useRef(null);
  const source = `${import.meta.env.BASE_URL}spotify-privacy-policy.html`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer;

    const resize = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        const height = Math.max(
          doc.body?.scrollHeight || 0,
          doc.documentElement?.scrollHeight || 0
        );

        if (height > 0) {
          iframe.style.height = `${height}px`;
        }
      } catch {
        // Keep the fallback height if the document is inaccessible.
      }
    };

    const onLoad = () => {
      resize();

      const doc = iframe.contentDocument;
      if (doc?.body && typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(resize);
        observer.observe(doc.body);
      }
    };

    iframe.addEventListener("load", onLoad);

    if (iframe.contentDocument?.readyState === "complete") {
      onLoad();
    }

    return () => {
      iframe.removeEventListener("load", onLoad);
      observer?.disconnect();
    };
  }, []);

  return (
    <main style={{ width: "100%", background: "#fff" }}>
      <iframe
        ref={iframeRef}
        title="Spotify Privacy Policy — Original"
        src={source}
        scrolling="no"
        style={{
          display: "block",
          width: "100%",
          height: "100vh",
          border: 0,
          overflow: "hidden",
        }}
      />
    </main>
  );
}
