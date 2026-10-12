This PR builds Ryan Tan's résumé-based portfolio and prepares the ICT3113 build–check–ship loop. The site includes the six required sections, real contact links, GitHub cards with empty/error states, a session-persistent dark-mode toggle, and back-to-top after the hero scrolls away.

Closes #1.

## Independent checking

A separate Codex checker received only R1–R9, contact details, and a running URL. It wrote TypeScript/Playwright tests in [Ryan-Portfolio-tests](https://github.com/Knight-RT/Ryan-Portfolio-tests). Site CI pins reviewed checker commit `4f6bb59e0b8c6dce1732ecde013a9b4069593bfe`.

All nine local Chromium tests passed. Strict checker TypeScript validation passed. Desktop, 375px mobile, and dark-mode browser previews produced no JavaScript errors or mobile horizontal overflow.

## Review and deployment

GitHub Pages is configured to use Actions. Merging this PR to main publishes only `public/`. Main's ruleset requires a PR, an up-to-date branch, and passing `functional-tests`; deletion/force push are blocked and no bypass actors are configured.

Ryan remains the human merge gate. The approval count is zero because a sole contributor cannot approve their own PR. Add an independent eligible reviewer if an enforced approval is required.

Personal content is adapted from the supplied résumé; the PDF is not committed. Résumé projects without supplied public source URLs use contact links. Local tools, reports, and checker staging are ignored. This setup assembles the initial lab workflow; it does not claim to have completed the student's later issue iterations or reflection answers.
