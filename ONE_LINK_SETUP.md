# One-link randomized study setup

Participant entry: https://privacy-policy-research-study.github.io/privacy_policy/

## Confirmed survey routing
- Text -> Formats=1
- Visual -> Formats=2
- Audio -> Formats=3
- Chat -> Formats=4
- Verify -> Formats=5
- Original -> Formats=6

All six links point to the same Qualtrics survey (SV_ehbFyBWWNK0h2Um) with different `Formats` parameters. The exact mapping is in `src/studySurveyLinks.js`.

## Deploy
1. Upload the CONTENTS of `privacy-policy-explorer` to the existing `privacy-policy-research-study/privacy_policy` GitHub repository, replacing matching files. Do not upload the ZIP as a single file. Preserve the existing `.github/workflows/deploy.yml` if present.
2. Wait for the GitHub Actions deployment to succeed.
3. Test all six researcher-only `?mode=` links and the single participant entry link before recruitment.
4. In Qualtrics, configure the end-of-survey redirect to `https://privacy-policy-research-study.github.io/privacy_policy/?stage=thanks` if your Qualtrics account supports redirects. The website cannot detect Qualtrics submission by itself.
5. Verify that the `Formats` URL parameter is captured in Qualtrics as Embedded Data, and review the welcome/consent wording with your research team.

The random assignment is uniform and stored in the participant's browser. It is not quota-balanced across participants or devices. Returning in the same browser keeps the same assignment. Existing `?mode=` links remain for researcher testing; the main URL is the participant-facing link.

The six presentation JSX and CSS components are unchanged.
