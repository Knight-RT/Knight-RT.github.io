# ICT3113 Week 06: Shipping with Codex

Adapted from `ict3113_week06_shipping_with_agents.py`. This is a lab guide, not an executable Python script. Prompts below are exercises for you to run deliberately; their presence does not authorize executing them now.

## Learning outcomes

1. Use Codex to build a portfolio and inspect its deployment pipeline.
2. Write concise `AGENTS.md` instructions and distinguish guidance from enforced controls.
3. Work through GitHub Issues, branches, pull requests, and human review.
4. Have a separate checker write functional tests from a specification, then require those tests in CI.
5. Explain the benefits and limits of separating agents' contexts, especially when they use the same model.

The workflow stays the same: issue → builder → independent checker → human review → merge → deployment.

## 0. Setup for this project

Use the Codex desktop app with `D:\Github\Portfolio\Ryan-Portfolio` as the builder project. The IDE extension or CLI is an alternative; this guide assumes the desktop app and Windows PowerShell.

You need GitHub access, Codex access through your configured account, Git, GitHub CLI, a supported Node.js LTS release, Python 3, and a browser. Node and Python are tools for the website and tests, not requirements to install the desktop app. Check available tools before installing anything.

**Terminal — read-only checks:**

```powershell
git --version
gh --version
node --version
npm --version
python --version
git remote -v
git branch --show-current
gh auth status
```

If GitHub CLI is not authenticated, run `gh auth login` and complete the sign-in yourself. Check repository-local Git author settings before making commits; avoid changing global settings unnecessarily.

**Updated repository check:** `origin` is configured as `https://github.com/Knight-RT/Ryan-Portfolio.git`, and local `main` tracks `origin/main`. Use `Knight-RT` for `<USER>` and `Ryan-Portfolio` for `<SITE_REPO>`. Both site and checker repositories are now public with Ryan's authorization. GitHub CLI (`gh`) is not on PATH in this session; use the GitHub browser interface or authenticated API for issues, PRs, and settings. Do not create duplicate repositories. The site also includes a dependency-free Node preview server, so Python is optional locally.

**Prompt — builder:**

> Inspect this existing repository, its branch, working tree, and remotes. Reuse it for this lab. If the GitHub remote is missing, ask me for the existing repository URL before configuring origin. Verify the repository owner, visibility, default branch, and authentication. Preserve existing files and changes. Report what is ready and what needs setup.

In this guide, `<USER>` means the verified GitHub owner and `<SITE_REPO>` means the actual repository name, expected to be `Ryan-Portfolio`. Use public repositories for the original lab's cross-repository test arrangement. Verify visibility and hosting availability rather than changing visibility automatically.

### How to use this guide

- **Prompt:** paste into the appropriate Codex chat.
- **Terminal:** a command you may run yourself or explicitly ask Codex to run.
- **Browser:** a GitHub setting you inspect or configure.
- **Checkpoint:** evidence you verify before continuing.

Read diffs, workflows, and test results. A successful agent response is not proof of a successful deployment.

## 1. Build and deploy the portfolio

### 1.1 Establish builder instructions

Codex recognizes `AGENTS.md` as project instructions. Instructions can apply at different directory levels, so check for inherited or more specific instructions. These guide agent behaviour; they do not enforce GitHub merge policy. See [official AGENTS.md documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

**Prompt — builder:**

> Add a concise root AGENTS.md based on the following conventions, a suitable .gitignore, and useful setup notes in the existing README. Preserve the license. Use a codex/ branch and show the diff. Do not push or merge until I authorize publishing the prepared change.

**Suggested builder `AGENTS.md`:**

```markdown
# Ryan-Portfolio
Build a personal portfolio with plain HTML/CSS and small amounts of vanilla JS.
Site files live in public/. No framework or build step.
Sections: #hero #about #skills #projects #repos #contact.
Keep the page responsive with no horizontal overflow at 375px.
Deploy public/ through GitHub Actions to GitHub Pages after changes reach main.

## Working agreements
- Preserve existing work; use codex/ branches for changes.
- Implement the issue's acceptance criteria and explain validation.
- Do not invent personal details or project achievements; request missing content.
- Human review decides whether a change merges and ships.
- Do not alter independently maintained checker tests to make a site change pass.
```

After creating instructions, start a fresh builder chat in the same project so the next task begins with them. Check the actual default branch and substitute it for `main` throughout if needed.

### 1.2 Build the site and deployment workflow

**Prompt — builder:**

> Following AGENTS.md, build a professional portfolio in public/. Ask for my name, tagline, bio, skills, project highlights, email, GitHub username, and LinkedIn URL where missing. Include #hero, #about, #skills, #projects, #repos, and #contact. Hero and contact contain email, GitHub, and LinkedIn links. Fetch my public repositories from https://api.github.com/users/<USER>/repos?sort=updated&per_page=12 using vanilla JS. Render cards with name, description, language, stars, and link, and clear messages for an empty result or failed request. Handle nullable API fields. Keep the site usable at 375px.
>
> Prepare .github/workflows/deploy.yml to publish public/ to GitHub Pages on push to main, plus manual dispatch. Check the local site and explain the workflow. Prepare changes on a codex/ branch for review; do not merge or publish automatically.

### 1.3 Review and go live

Check the workflow's trigger, `public/` upload path, and permissions: `contents: read`, `pages: write`, and `id-token: write`. Check links, mobile layout, and repository error handling locally. Use relative asset paths so project-site hosting works under a repository URL path.

**Browser:** repository Settings → Pages → choose GitHub Actions as the source. Then authorize the initial reviewed commit/PR publication and merge. Subsequent work uses pull requests.

**Checkpoint:** record the successful Actions run and the actual deployment URL returned by GitHub. A project site is typically `https://<USER>.github.io/<SITE_REPO>/`; do not assume that URL if custom-domain or user-site settings differ.

## 2. Run improvements through issues and pull requests

### 2.1 Configure the merge gate

**Browser:** create an active branch ruleset targeting the default branch. Restrict deletions, block force pushes, and require pull requests. Inspect bypass permissions: a rule with a bypass path does not guarantee that every change is reviewed.

A required PR and a required approving review are different controls. Require an approving review when another eligible reviewer is available. If you are the sole contributor, review your own diff deliberately and document that this is a human process gate; you cannot count your own PR approval as an independent approving review.

**Checkpoint:** inspect effective rules and bypass settings. You do not need to attempt a destructive push to prove the configuration.

### 2.2 File an issue with observable acceptance criteria

**Prompt — builder:**

> Create a GitHub issue titled "Add a dark-mode toggle" with these acceptance criteria: a navigation button named "Toggle dark mode" toggles the dark class on body. The initial mode for a fresh browser session is dark. The selected mode survives reload and same-tab navigation for that tab's session. A new browser session starts in dark mode. Return the issue URL and number.

This makes "kept for the session" testable. Keep the original ambiguous wording in your notes if you want to discuss how it was clarified.

### 2.3 Implement and review

**Prompt — builder:**

> Work on issue #<actual-number>. Read its acceptance criteria, create a codex/ branch, implement and validate the change, commit and push, and open a PR with Closes #<actual-number>. Report checks and known limitations. Leave merge and release approval to me.

**Checkpoint:** inspect the PR, run the behaviour, and decide whether to merge. Record the deployment run after merging.

## 3. Independent checker in a separate project

### 3.1 Start a fresh checker context

Create a separate public `<SITE_REPO>-tests` repository and add its separate local folder as a Codex project. Start a new chat there. Do not fork the builder chat, use a builder worktree as the checker, attach implementation files, or paste builder diffs. A worktree separates file changes but still contains the site's source.

The checker receives only its role instructions, specification, issue text, and running-site URL. A fresh chat avoids inherited builder conversation context. This is a workflow boundary, not a security boundary: instructions alone cannot prevent access to source elsewhere on the machine or internet. For enforced isolation, restrict the checker's environment and filesystem access too.

**Prompt — checker:**

> Set up this separate public <SITE_REPO>-tests repository with AGENTS.md, SPEC.md, .gitignore, and README. You are the checker. Work only from the specification and issue text I supply; do not access the site's source repository, implementation files, diffs, or builder chat. You may interact with the running website in a browser. Do not edit the site. Ask about unclear acceptance criteria before inventing expectations.

**Suggested checker `AGENTS.md`:**

```markdown
# Independent portfolio checker
Use Playwright with TypeScript and Chromium.
Run against BASE_URL; fail clearly if it is missing.
Write tests only from SPEC.md and supplied issue text.
Do not read or fetch site source, diffs, or builder conversation history.
Do not edit the site. Interact only with its running browser interface.
Give every test a requirement ID from SPEC.md.
Report ambiguity rather than assuming implementation details.
Commit package-lock.json so CI can run npm ci.
```

### 3.2 Supply a specification

Copy this into the checker repository, substituting verified identity details. Requirement IDs are more stable than line-number references.

**`SPEC.md`:**

```markdown
# Portfolio specification
R1: Exactly one section exists for each ID: hero, about, skills,
    projects, repos, contact.
R2: At viewport width 375px, the document has no horizontal overflow.
R3: Hero and contact each contain working-format email, GitHub,
    and LinkedIn links matching the supplied owner's details.
R4: On a successful repository response, repos displays a card for
    each returned repository, showing name, description, primary language,
    star count, and repository link. Null descriptions/languages are handled.
R5: An empty repository response displays a clear empty-state message.
R6: A failed repository request displays a clear failure message.
R7: A nav button named "Toggle dark mode" toggles the dark class on body.
R8: A fresh browser session starts in dark mode. The chosen mode survives
    reload and same-tab navigation for that tab's session. A new browser
    session starts in dark mode.
```

Include the actual issue text and number. Clarify any conflict between the issue and SPEC before implementation or testing continues.

### 3.3 Write and inspect tests

**Prompt — checker:**

> Set up Playwright with TypeScript and Chromium, an npm test script, and a committed lockfile. Write tests mapped to R1–R8 using BASE_URL. Use browser request interception with deterministic GitHub API fixtures for populated, empty, and failed responses, without reading site source. Verify nullable fields. Test the toggle through its accessible button and observe body classes. Verify session behaviour with reload and a fresh browser context. Run tests, report requirement coverage and assumptions, then commit and push.

Review that the mobile test sets a 375px viewport and compares document scrollWidth with clientWidth. Inspect that cards, empty state, and failure state are tested separately: a test that accepts any of them on every run can miss a broken fetch. Review session expectations and ensure one behaviour is not masking another failure.

### 3.4 Run locally

**Terminal 1 — builder repository:**

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory public
```

**Terminal 2 — checker repository:**

```powershell
npm ci
npx playwright install chromium
$env:BASE_URL = 'http://127.0.0.1:8000'
npm test
```

Set BASE_URL to the deployed project URL to test the live site. Keep its trailing slash for project-relative paths. Stop the local server with Ctrl+C when finished.

**Checkpoint:** classify every failure as implementation wrong, test wrong, or specification unclear. Clarify the spec first when necessary; do not simply ask the builder to satisfy an unjustified assertion.

### 3.5 Add the checker to CI

**Prompt — builder:**

> Prepare a PR adding .github/workflows/test.yml for pull_request events targeting main. Use a job named functional-tests with contents: read. Check out the PR site and the public <USER>/<SITE_REPO>-tests repository into checker/. Pin the checker to the reviewed full commit SHA I supply, so the expected tests do not change silently. Set up a supported Node LTS version and Python, run npm ci and install Playwright Chromium with its dependencies in checker/, serve public/ on port 8000, wait for a successful HTTP response with a bounded retry loop, and run npm test with BASE_URL=http://127.0.0.1:8000. Upload failure reports. Do not use pull_request_target or secrets for these browser tests. Open a PR and leave merging to me.

The builder may write CI plumbing, but you review the checker repository, its pinned revision, and the workflow. Separate test repositories do not prevent a builder PR from disabling a workflow or selecting different tests; human review remains essential.

**Browser:** once the workflow has run successfully and its PR is merged, add `functional-tests` to the ruleset's required checks. Review enforcement and bypass permissions again. If repository ownership allows it, protect workflow changes with an eligible independent code owner/reviewer.

**Checkpoint:** capture a passing check and evidence that failing checks block ordinary merging. Required checks alone do not replace reviewing the workflow and test content.

### 3.6 Run the full loop again

1. File another issue, such as a back-to-top button whose visibility depends on scrolling past the hero. Define exactly what "past" means and the button's accessible name.
2. Supply only the issue/specification update to the checker. Have it write and commit the new test first.
3. Run against the current site and verify failure for the expected reason.
4. Supply the issue to the builder and have it open an implementation PR.
5. Update the CI checker pin to the newly reviewed test commit in that PR or a coordinated setup PR. Existing PRs keep using the old pin until it is updated.
6. Inspect CI results, diff, and behaviour. Resolve ambiguity through the issue and spec before adjusting code or tests.
7. Review and merge; verify the deployment.

## 4. Write-up and evidence

Answer the original lab's reflection questions:

1. List the checker's tests and identify spec-based expectations versus assumptions.
2. Describe a requirement the builder and checker interpreted differently, or the closest case. Include the clarification.
3. Explain what separate contexts gave you and what same-model errors they did not prevent. Record the actual models used rather than assuming they match.
4. Explain which gate caught a problem: human review, repository rules, or functional tests. If none did, state what a deliberate faulty change would likely trigger.

Record repository URLs, issue and PR links, reviewed checker SHAs, test reports, Actions runs, deployed URL, and ruleset evidence. Use actual observations; do not invent results for exercises you have not run.

## Conversion notes

- Claude Code sessions become Codex builder/checker chats in separate projects.
- CLAUDE.md becomes AGENTS.md, with role-specific instructions.
- Existing Ryan-Portfolio is reused instead of creating another site repository.
- Local commands use Windows PowerShell; Ubuntu CI still uses its normal shell.
- The independent checker, GitHub review gate, deployment, and reflection exercise remain.
- Session persistence is clarified, API states are tested deterministically, and checker revisions are pinned for reproducibility.
- This conversion prepares the guide only. Repository publication, settings changes, deployment, and coursework execution are separate actions.

Official references: [project instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md) and [desktop app documentation](https://learn.chatgpt.com/docs/app). Account access and interface details can change; use these sources when setup differs.
