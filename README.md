# Spotify Privacy Policy Study — Participant-Only Website

This project contains six independent participant experiences. **Do not send participants the GitHub repository or a list of all six links.** Send each participant only their assigned direct URL.

## GitHub Pages deployment (new or existing repository)

1. Create a GitHub repository (public is simplest for Pages). **Do not upload the ZIP itself.**
2. Upload the **contents** of the `privacy-policy-explorer` folder, retaining `src/`, `public/`, `.github/workflows/deploy.yml`, and root configuration files. The `.github` folder is hidden on Macs; ensure the workflow exists in GitHub after uploading.
3. In GitHub go to **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. In **Actions**, wait for the workflow **Deploy study website to GitHub Pages** to succeed. If the workflow doesn't appear, add `.github/workflows/deploy.yml` via GitHub's **Add file → Create new file** path.
5. Your URL is `https://YOUR-USERNAME.github.io/YOUR-REPO/`. Assign a version with one of the query strings below. **Do not distribute this table to participants.**

- `?mode=audio`
- `?mode=visual`
- `?mode=original`
- `?mode=text`
- `?mode=chat`
- `?mode=verify`

The root URL deliberately displays only a neutral study-link message, not a directory of conditions. No participant page offers navigation to other conditions.

## Local preview

```sh
npm ci
npm run dev
```

## Notes for research team

- The audio experience is preserved from the provided project.
- The infographic's attention ratings appear **only in the details pop-up**. Attention ratings are draft research-team judgments and require approval before use.
- The original-policy condition embeds the provided Spotify policy PDF with Spotify-style branding; it is not a pixel-exact reproduction of Spotify's live policy webpage.
- The chat condition uses a client-side policy-based answer selector. It does not use an online AI service and therefore works on static GitHub Pages.
- Before recruitment, verify all six links in a private browser and confirm the original-policy PDF and audio files load. GitHub Pages deployment is separate from uploading source files.
- Never upload `.env`, `.dev.vars`, `.netlify`, or `node_modules`.
