// Loads every /data/*.yaml file and renders the whole page from it.
// Edit the YAML files to change content — this file shouldn't need touching.

const DATA_FILES = {
  site: "data/site.yaml",
  profile: "data/profile.yaml",
  experience: "data/experience.yaml",
  projects: "data/projects.yaml",
  skills: "data/skills.yaml",
  education: "data/education.yaml",
};

const SECTION_LABELS = {
  about: "About",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
  contact: "Contact",
};

async function loadYaml(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const text = await res.text();
  return jsyaml.load(text);
}

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text) node.textContent = opts.text;
  if (opts.html) node.innerHTML = opts.html;
  Object.entries(opts.attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
  children.forEach((c) => c && node.appendChild(c));
  return node;
}

function applyTheme(site) {
  const root = document.documentElement;
  root.style.setProperty("--accent", site.accent || "#7c5cff");
  root.style.setProperty("--accent2", site.accent2 || "#22d3ee");
  document.title = site.browser_title || "Portfolio";
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", site.browser_title || "Portfolio");
}

function buildNav(sections) {
  const nav = document.getElementById("navLinks");
  sections.forEach((key) => {
    if (!SECTION_LABELS[key]) return;
    const a = el("a", { text: SECTION_LABELS[key], attrs: { href: `#${key}` } });
    nav.appendChild(a);
  });
}

function toggleSections(allSections) {
  const known = Object.keys(SECTION_LABELS);
  known.forEach((key) => {
    if (!allSections.includes(key)) {
      const node = document.getElementById(key);
      if (node) node.style.display = "none";
    }
  });
}

function renderHero(profile) {
  document.getElementById("heroLocation").textContent = profile.location || "";
  document.getElementById("heroName").textContent = profile.name || "";
  document.getElementById("heroRole").textContent = profile.role || "";
  document.getElementById("heroTagline").textContent = profile.tagline || "";

  const highlights = document.getElementById("heroHighlights");
  (profile.highlights || []).forEach((h) => highlights.appendChild(el("span", { text: h })));

  const resumeBtn = document.getElementById("heroResumeBtn");
  if (profile.resume_file) {
    resumeBtn.setAttribute("href", profile.resume_file);
  } else {
    resumeBtn.style.display = "none";
  }

  const social = document.getElementById("heroSocial");
  const s = profile.social || {};
  if (s.github) social.appendChild(el("a", { text: "GitHub", attrs: { href: s.github, target: "_blank", rel: "noopener" } }));
  if (s.linkedin) social.appendChild(el("a", { text: "LinkedIn", attrs: { href: s.linkedin, target: "_blank", rel: "noopener" } }));
  if (s.email) social.appendChild(el("a", { text: "Email", attrs: { href: s.email } }));
}

function renderAbout(profile) {
  document.getElementById("aboutSummary").textContent = profile.summary || "";
}

function renderExperience(items) {
  const wrap = document.getElementById("experienceTimeline");
  items.forEach((job) => {
    const list = el("ul", { class: "timeline-list" },
      (job.bullets || []).map((b) => el("li", { text: b }))
    );
    const tech = el("div", { class: "pill-row" },
      (job.tech || []).map((t) => el("span", { class: "pill", text: t }))
    );
    const item = el("div", { class: "timeline-item reveal" }, [
      el("div", { class: "timeline-head" }, [
        el("div", {}, [
          el("span", { class: "timeline-role", text: job.role + " " }),
          el("span", { class: "timeline-org", text: `· ${job.company}` }),
        ]),
        el("span", { class: "timeline-meta", text: `${job.start} – ${job.end} · ${job.location}` }),
      ]),
      list,
      tech,
    ]);
    wrap.appendChild(item);
  });
}

function renderProjects(items) {
  const wrap = document.getElementById("projectsGrid");
  items.forEach((p) => {
    const links = el("div", { class: "card-links" });
    if (p.repo) links.appendChild(el("a", { text: "Code →", attrs: { href: p.repo, target: "_blank", rel: "noopener" } }));
    if (p.link) links.appendChild(el("a", { text: "Live →", attrs: { href: p.link, target: "_blank", rel: "noopener" } }));

    const card = el("div", { class: "card reveal" }, [
      el("h3", { text: p.title }),
      el("p", { class: "card-summary", text: p.summary }),
      el("ul", {}, (p.bullets || []).map((b) => el("li", { text: b }))),
      el("div", { class: "pill-row" }, (p.tags || []).map((t) => el("span", { class: "pill", text: t }))),
      links,
    ]);
    wrap.appendChild(card);
  });
}

function renderSkills(groups) {
  const wrap = document.getElementById("skillsGrid");
  groups.forEach((g) => {
    const card = el("div", { class: "skill-card reveal" }, [
      el("h4", { text: g.category }),
      el("div", { class: "pill-row" }, (g.items || []).map((i) => el("span", { class: "pill", text: i }))),
    ]);
    wrap.appendChild(card);
  });
}

function renderEducation(edu) {
  const wrap = document.getElementById("educationTimeline");
  (edu.degrees || []).forEach((d) => {
    const item = el("div", { class: "timeline-item reveal" }, [
      el("div", { class: "timeline-head" }, [
        el("div", {}, [
          el("span", { class: "timeline-role", text: d.degree + " " }),
          el("span", { class: "timeline-org", text: `· ${d.school}` }),
        ]),
        el("span", { class: "timeline-meta", text: `${d.start} – ${d.end}` }),
      ]),
      el("p", { class: "timeline-detail", text: d.detail || "" }),
    ]);
    wrap.appendChild(item);
  });

  const langs = document.getElementById("languagesList");
  (edu.languages || []).forEach((l) => {
    langs.appendChild(el("div", { class: "lang-chip", html: `<b>${l.name}</b> — ${l.level}` }));
  });
}

function renderContact(profile) {
  const wrap = document.getElementById("contactGrid");
  const s = profile.social || {};
  const rows = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: `tel:${(profile.phone || "").replace(/\s+/g, "")}` },
    { label: "Location", value: profile.location, href: null },
    { label: "LinkedIn", value: "Connect", href: s.linkedin },
    { label: "GitHub", value: "Follow", href: s.github },
  ];
  rows.forEach((r) => {
    if (!r.value) return;
    const node = el(r.href ? "a" : "div", {
      class: "contact-item",
      attrs: r.href ? { href: r.href, target: r.href.startsWith("http") ? "_blank" : "", rel: "noopener" } : {},
    }, [
      el("span", { class: "label", text: r.label }),
      el("span", { class: "value", text: r.value }),
    ]);
    wrap.appendChild(node);
  });
}

function setupThemeToggle() {
  const btn = document.getElementById("themeToggle");
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);
  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

function setupScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((i) => io.observe(i));
}

async function main() {
  setupThemeToggle();

  const [site, profile, experience, projects, skills, education] = await Promise.all([
    loadYaml(DATA_FILES.site),
    loadYaml(DATA_FILES.profile),
    loadYaml(DATA_FILES.experience),
    loadYaml(DATA_FILES.projects),
    loadYaml(DATA_FILES.skills),
    loadYaml(DATA_FILES.education),
  ]);

  const sections = site.sections || Object.keys(SECTION_LABELS);

  applyTheme(site);
  buildNav(sections);
  toggleSections(sections);

  renderHero(profile);
  renderAbout(profile);
  renderExperience(experience);
  renderProjects(projects);
  renderSkills(skills);
  renderEducation(education);
  renderContact(profile);

  document.getElementById("footerText").textContent =
    `© ${new Date().getFullYear()} ${profile.name}. Built with HTML, CSS & YAML.`;

  setupScrollReveal();
}

main().catch((err) => {
  console.error(err);
  document.getElementById("heroName").textContent = "Failed to load data";
  const p = document.createElement("p");
  p.style.color = "#f66";
  p.textContent = String(err);
  document.body.appendChild(p);
});
