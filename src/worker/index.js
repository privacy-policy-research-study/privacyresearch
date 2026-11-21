
const encoder = new TextEncoder();

function toHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return toHex(
    new Uint8Array(
      await crypto.subtle.sign("HMAC", key, encoder.encode(value))
    )
  );
}

function secureHeaders() {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY"
  };
}

function loginPage(error = false) {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Privacy Policy Explorer — Research Access</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f3f7f6;
      min-height: 100vh; display: grid; place-items: center; margin: 0; }
    main { background: white; padding: 32px; border-radius: 16px;
      max-width: 360px; width: 85%; box-shadow: 0 8px 32px #0001; }
    h1 { font-size: 24px; }
    input, button { width: 100%; padding: 12px; margin-top: 12px;
      box-sizing: border-box; border-radius: 8px; font-size: 16px; }
    input { border: 1px solid #aaa; }
    button { background: #176b55; color: white; border: 0; cursor: pointer; }
    .error { color: #b42318; }
  </style>
</head>
<body>
  <main>
    <h1>Privacy Policy Explorer</h1>
    <p>Enter the study password to continue.</p>
    ${error ? '<p class="error">Incorrect password. Please try again.</p>' : ""}
    <form method="POST" action="/__login">
      <input type="password" name="password" placeholder="Study password"
        autocomplete="current-password" required>
      <button type="submit">Enter Study</button>
    </form>
  </main>
</body>
</html>`, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", ...secureHeaders() }
  });
}

export default {
  async fetch(request, env) {
    if (!env.STUDY_PASSWORD || !env.SESSION_SECRET) {
      return new Response("Website access is not configured.", { status: 503 });
    }

    const url = new URL(request.url);

    if (url.pathname === "/__login" && request.method === "POST") {
      const form = await request.formData();
      const password = form.get("password");

      if (typeof password !== "string" || password !== env.STUDY_PASSWORD) {
        return loginPage(true);
      }

      const expires = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
      const value = String(expires);
      const signature = await sign(value, env.SESSION_SECRET);

      return new Response(null, {
        status: 303,
        headers: {
          Location: "/",
          "Set-Cookie": `study_session=${value}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`,
          ...secureHeaders()
        }
      });
    }

    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)study_session=([^;]+)/);

    if (match) {
      const [expiry, signature] = match[1].split(".");
      const now = Math.floor(Date.now() / 1000);

      if (
        /^\d+$/.test(expiry || "") &&
        /^[a-f0-9]{64}$/.test(signature || "") &&
        Number(expiry) > now
      ) {
        const expected = await sign(expiry, env.SESSION_SECRET);

        // Constant-time signature comparison
        let difference = 0;
        for (let i = 0; i < expected.length; i++) {
          difference |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
        }

        if (difference === 0) {
          const response = await env.ASSETS.fetch(request);
          const headers = new Headers(response.headers);
          Object.entries(secureHeaders()).forEach(([key, value]) =>
            headers.set(key, value)
          );
          return new Response(response.body, {
            status: response.status,
            headers
          });
        }
      }
    }

    return loginPage();
  }
};
