// Professional content adapted from the résumé supplied by Ryan.
// Empty contact values produce honest, visible pending messages.
window.PORTFOLIO_PROFILE = Object.freeze({
  name: 'Ryan Tan',
  github: 'Knight-RT',
  tagline: 'Software engineering student. Web developer. Curious problem solver.',
  bio: 'I’m a Software Engineering student at the Singapore Institute of Technology, with practical experience in frontend and backend web development and game design. I enjoy turning complex requirements into useful interfaces, dependable services, and systems that are easier to maintain.',
  email: 'ryan.tan.0310@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ryan-tan0310/',
  skills: ['HTML, CSS & JavaScript', 'React & TypeScript', 'PHP & Python', 'C#, C++ & Unity', 'SQL & databases', 'Git & collaboration'],
  skillsLabel: 'Tools I’ve used across web, software, and game projects',
  education: [
    { title: 'BSc in Software Engineering', detail: 'Singapore Institute of Technology', date: '2024 – Present' },
    { title: 'Diploma in Game Design and Development', detail: 'Game mechanics, AI for games, and interactive systems', date: '2018 – 2021' },
  ],
  experience: [
    { title: 'Venuexplorer', date: 'March – June 2024', detail: 'Frontend & backend development for a venue marketplace, vendor dashboards, and account data.' },
    { title: 'Spotworks', date: 'October 2020 – April 2021', detail: 'Website SEO, account database development, and API integration for a 360-degree room application.' },
  ],
  projects: [
    {
      title: 'AI-assisted job aggregation.',
      description: 'Implemented the cover-letter generation workflow and contributed TOTP authentication, upload validation, and deployment support for a secure job aggregation platform.',
      label: 'Full stack · Security',
      url: '#contact',
      linkLabel: 'Ask about this project ↗',
      tags: ['Next.js', 'FastAPI', 'PostgreSQL', 'Docker'],
    },
    {
      title: 'Forecasting rental inventory.',
      description: 'Built an inventory prediction engine with linear regression and decision-tree strategies, integrating forecasting into PostgreSQL-backed car and equipment workflows.',
      label: 'Software design · Prediction',
      url: '#contact',
      linkLabel: 'Ask about this project ↗',
      tags: ['ASP.NET Core MVC', 'C#', 'PostgreSQL'],
    },
    {
      title: 'A more transparent food guide.',
      description: 'Contributed React interfaces for an AI food and menu scanner, refining result presentation, reference-image attribution, and accessibility.',
      label: 'Frontend · AI interfaces',
      url: '#contact',
      linkLabel: 'Ask about this project ↗',
      tags: ['React', 'TypeScript', 'Express', 'OpenAI API'],
    },
  ],
});

