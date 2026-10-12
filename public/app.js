(() => {
  'use strict';
  const profile = window.PORTFOLIO_PROFILE;
  const githubUrl = `https://github.com/${encodeURIComponent(profile.github)}`;
  const storageKey = 'ryan-portfolio-dark';
  const toggle = document.querySelector('#theme-toggle');

  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    toggle.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#16221e' : '#f5f3ed';
  }
  try { applyTheme(sessionStorage.getItem(storageKey) !== 'false'); }
  catch { applyTheme(true); }
  toggle.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark');
    applyTheme(dark);
    try { sessionStorage.setItem(storageKey, String(dark)); } catch { /* Toggle still works without storage. */ }
  });

  function externalLink(label, url) {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = url;
    if (url.startsWith('https://')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    return link;
  }
  function safeHttps(value) {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
    catch { return null; }
  }
  function pending(label) {
    const span = document.createElement('span');
    span.className = 'pending-link';
    span.textContent = `${label} coming soon`;
    return span;
  }
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : '';
  const linkedin = safeHttps(profile.linkedin);
  document.querySelectorAll('[data-name]').forEach(el => { el.textContent = profile.name; });
  document.title = `${profile.name} — Portfolio`;
  document.querySelector('#tagline').textContent = profile.tagline;
  document.querySelector('#bio').textContent = profile.bio;
  document.querySelector('#year').textContent = new Date().getFullYear();
  document.querySelectorAll('[data-github-link]').forEach(el => { el.href = githubUrl; });
  document.querySelectorAll('[data-contact-links]').forEach(container => {
    container.append(email ? externalLink('Email ↗', `mailto:${email}`) : pending('Email'));
    container.append(externalLink('GitHub ↗', githubUrl));
    container.append(linkedin ? externalLink('LinkedIn ↗', linkedin) : pending('LinkedIn'));
  });
  if (email && linkedin) {
    document.querySelector('#profile-note').hidden = true;
    document.querySelector('#contact > p.muted').textContent = 'Have a project in mind? Let’s connect.';
  }
  document.querySelector('#skills-label').textContent = profile.skillsLabel;
  ['education', 'experience'].forEach(kind => {
    (profile[kind] || []).forEach(item => {
      const entry = document.createElement('div'); entry.className = 'background-entry';
      const date = document.createElement('span'); date.className = 'background-date'; date.textContent = item.date;
      const title = document.createElement('h4'); title.textContent = item.title;
      const detail = document.createElement('p'); detail.textContent = item.detail;
      entry.append(date, title, detail); document.querySelector(`#${kind}-list`).append(entry);
    });
  });
  profile.skills.forEach((skill, index) => {
    const li = document.createElement('li');
    const number = document.createElement('span');
    number.className = 'skill-number'; number.textContent = String(index + 1).padStart(2, '0');
    const text = document.createElement('span'); text.textContent = skill;
    li.append(number, text); document.querySelector('#skill-list').append(li);
  });
  profile.projects.forEach((project, index) => {
    const card = document.createElement('article'); card.className = 'project-card';
    const visual = document.createElement('div'); visual.className = 'project-visual'; visual.setAttribute('aria-hidden', 'true');
    const number = document.createElement('span'); number.textContent = `PROJECT / ${String(index + 1).padStart(2, '0')}`;
    const visualTitle = document.createElement('strong'); visualTitle.textContent = project.title;
    const visualDetail = document.createElement('small'); visualDetail.textContent = project.tags.join(' · ');
    visual.append(number, visualTitle, visualDetail);
    const content = document.createElement('div');
    const meta = document.createElement('span'); meta.className = 'project-meta'; meta.textContent = project.label;
    const title = document.createElement('h3'); title.textContent = project.title;
    const description = document.createElement('p'); description.textContent = project.description;
    const tags = document.createElement('div'); tags.className = 'tags';
    project.tags.forEach(tag => { const el = document.createElement('span'); el.className = 'tag'; el.textContent = tag; tags.append(el); });
    content.append(meta, title, description, tags);
    const url = project.url === '#contact' ? '#contact' : safeHttps(project.url);
    if (url) { const link = externalLink(project.linkLabel || 'View project ↗', url); link.className = 'text-link'; content.append(link); }
    card.append(visual, content); document.querySelector('#project-list').append(card);
  });

  const topButton = document.querySelector('#back-to-top');
  const hero = document.querySelector('#hero');
  function updateTopButton() { topButton.hidden = hero.getBoundingClientRect().bottom > 0; }
  window.addEventListener('scroll', updateTopButton, { passive: true });
  window.addEventListener('resize', updateTopButton);
  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  updateTopButton();

  async function loadRepos() {
    const status = document.querySelector('#repo-status');
    const list = document.querySelector('#repo-list');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(profile.github)}/repos?sort=updated&per_page=12`, { signal: controller.signal });
      if (!response.ok) throw new Error('GitHub request failed');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Unexpected GitHub response');
      const repos = data.filter(repo => !repo.private && typeof repo.name === 'string' && safeHttps(repo.html_url));
      if (repos.length === 0) { status.textContent = 'No public repositories yet. Check back soon.'; return; }
      repos.forEach(repo => {
        const card = document.createElement('article'); card.className = 'repo-card';
        const title = document.createElement('h3');
        const link = externalLink(repo.name, safeHttps(repo.html_url));
        const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
        title.append(link, arrow);
        const description = document.createElement('p'); description.textContent = repo.description || 'No description provided.';
        const details = document.createElement('div'); details.className = 'repo-details';
        const language = document.createElement('span'); language.textContent = repo.language || 'Language not specified';
        const stars = document.createElement('span');
        const count = Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0;
        stars.textContent = `★ ${count}`; stars.setAttribute('aria-label', `${count} stars`);
        details.append(language, stars); card.append(title, description, details); list.append(card);
      });
      status.hidden = true;
    } catch {
      list.replaceChildren();
      status.textContent = 'Could not load repositories from GitHub. Please try again later or visit my GitHub profile.';
    } finally { clearTimeout(timeout); }
  }
  loadRepos();
})();

