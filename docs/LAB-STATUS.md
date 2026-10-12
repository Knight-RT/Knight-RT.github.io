# Lab setup status

This file records setup evidence. It is not a completed student reflection.

## Roles
- Builder: Codex chat in Ryan-Portfolio.
- Checker: fresh Codex agent context supplied only the specification, working in
  a separate checker repository. It has not been given the portfolio source.
- Human gate: Ryan reviews the issue, PR, tests, and decides whether to merge.

## Personal content
Name, professional background, education, experience, skills, email, LinkedIn,
and three project highlights are adapted from the résumé supplied by Ryan.
The PDF remains outside the repository. Project source links were not provided
and those projects are not in the public repository list, so highlights link to
contact with the label "Ask about this project" rather than invented source URLs.

## Reflection prompts
1. List each requirement/test. Which assertions come from the spec, and which
   assumptions needed clarification?
2. Describe one difference in interpretation between builder and checker.
3. What did context separation provide, and what shared-model mistakes remain?
4. Which gate caught a problem? Cite the actual evidence rather than inventing it.

Setup results and repository links will be appended after verification.

## Verified setup
- Site: https://github.com/Knight-RT/Knight-RT.github.io (public with permission).
- Checker: https://github.com/Knight-RT/Ryan-Portfolio-tests (public).
- Setup issue: https://github.com/Knight-RT/Knight-RT.github.io/issues/1.
- Reviewed checker commit: 4f6bb59e0b8c6dce1732ecde013a9b4069593bfe.
- Separate checker checkout: D:\Github\Portfolio\Ryan-Portfolio-tests. Add that
  folder as its own Codex project for future checker chats.
- All nine Chromium acceptance tests passed locally; checker TypeScript passed.
- Desktop, dark, and 375px mobile previews had no JavaScript errors; mobile
  document horizontal overflow was false.
- GitHub Pages uses workflow-based publishing. The first deployment requires
  the human-reviewed setup PR to reach main.
- Main ruleset 24939291 is active: required PR, required `functional-tests`
  from GitHub Actions, strict/up-to-date branch checks, resolved review threads,
  no deletion or force push, and no bypass actors. GitHub confirms the current
  account cannot bypass it. Independent approving review count is zero for the
  sole-contributor workflow; human merge review is still a process requirement.

### What review caught
The checker's first R4 fixture name contained the word "null", which collided
with its guard against displaying literal null/undefined API values. The
checker corrected the fixture name and reran the unchanged requirements.
Test review also extended contact assertions to both required sections and
corrected URL navigation to preserve a GitHub Pages project path.

### Boundary and limits
The checker used a fresh agent context and never read site source. Its staging
repository is an ignored nested checkout, so this is context separation, not
enforced filesystem isolation. For future work, use the separate checker
project/checkout and pass only SPEC.md, issue text, and the browser URL.

This is the initial setup. The lab's later test-first issue iteration and your
reflection answers still need your own observed evidence. No agent has merged
the site PR or claimed a deployment before the human's review.
