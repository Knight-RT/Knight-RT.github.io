# Ryan-Portfolio

Personal portfolio for Knight-RT. Use plain HTML/CSS and small amounts of
vanilla JavaScript. Site files live in public/. No framework or build step.

## Conventions
- Required sections: hero, about, skills, projects, repos, contact.
- Keep the site responsive with no horizontal overflow at 375px.
- Keep personal content in public/profile.js; never invent achievements or links.
- Use accessible controls and respect reduced-motion preferences.
- Use relative asset URLs for GitHub Pages project paths.
- Deploy public/ through GitHub Actions after reviewed changes reach main.

## Working agreements
- Preserve existing work. Use codex/ branches and issue-linked pull requests.
- Explain what changed, validation, and any incomplete requirements.
- The human reviews and decides when to merge and ship.
- Independent tests live in Knight-RT/Ryan-Portfolio-tests. Do not edit their
  expectations to make an implementation pass; clarify the specification first.
- Review workflow changes and checker commit updates explicitly.

