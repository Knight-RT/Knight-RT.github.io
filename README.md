# Ryan Tan · Portfolio

A responsive portfolio based on Ryan's résumé, built with plain HTML, CSS,
and vanilla JavaScript for ICT3113 Week 06: Shipping with Agents.

- [Site repository](https://github.com/Knight-RT/Ryan-Portfolio)
- [Independent checker](https://github.com/Knight-RT/Ryan-Portfolio-tests)
- [Setup issue](https://github.com/Knight-RT/Ryan-Portfolio/issues/1)
- Expected Pages URL after the first reviewed merge:
  https://knight-rt.github.io/Ryan-Portfolio/

## Run locally

Use Node.js 22 or later. No site dependencies or build step are needed.

```powershell
node scripts/serve.mjs
```

Open http://127.0.0.1:8000. `npm start` is equivalent when npm is installed.
Stop with Ctrl+C. Python is an alternative:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory public
```

## Edit content

Update `public/profile.js` for biography, links, skills, education, experience,
and projects. Content is based on the supplied résumé; the résumé PDF itself is
not copied into this repository. Highlights with no public source URL use an
honest "Ask about this project" contact link. Replace those links when source
repositories or public demos become available.

`public/index.html` defines the six sections; `styles.css` defines the responsive
layout. `app.js` renders the profile and GitHub cards, manages a tab-session
dark mode (dark by default in a fresh session), and shows back-to-top once the hero has scrolled out of view.

GitHub requests are unauthenticated; failures, empty responses, and nullable
repository fields have separate states. Dynamic text uses DOM textContent.
Google Fonts is optional: the CSS includes local fallback font stacks.

## Run the independent tests

Clone the checker into a separate folder outside this site checkout. Keep its
Codex chat separate and give it only SPEC.md, issue text, and a running URL.

```powershell
git clone https://github.com/Knight-RT/Ryan-Portfolio-tests.git
cd Ryan-Portfolio-tests
npm ci
npx playwright install chromium
$env:BASE_URL = 'http://127.0.0.1:8000'
npm test
```

Run the site server in another terminal. BASE_URL can also point to the deployed
Pages URL, including `/Ryan-Portfolio/`. The checker uses deterministic API
fixtures and does not read the site's source.

## Review and ship

1. Open an issue with observable acceptance criteria.
2. Work on a `codex/` branch and open a PR closing the issue.
3. Review the diff, independent test results, and browser behaviour.
4. The human decides to merge. Main requires a PR and passing `functional-tests`.
5. A push to main deploys only `public/` through GitHub Pages Actions.

The test workflow pins the checker repository to a reviewed commit SHA. Review
updates to that SHA and workflow changes explicitly. New tests do not enter CI
until the pin is updated. Workflow source and selected tests remain part of the
human review; separate repositories do not make them tamper-proof.

The main ruleset has no bypass actors, blocks deletion/force push, and requires
the functional check with an up-to-date branch. Required approving reviews are
zero because a sole contributor cannot approve their own PR; the manual human
review is a process gate. Add an eligible independent reviewer and require an
approval if you want GitHub to enforce that additional gate.

## Lab material

- [Codex lab guide](docs/ict3113-week06-codex.md)
- [Setup evidence and reflection prompts](docs/LAB-STATUS.md)
- Project guidance: AGENTS.md. Guidance shapes behaviour; GitHub rules and CI
  enforce the merge requirements.

Generated local tools, checker checkout, browser cache, and reports are ignored.
They are not part of the deployed site or the site repository's commits.

