# Portfolio

A single-page portfolio site. No build step, no framework — plain HTML/CSS/JS
that reads all its content from the YAML files in [`data/`](data/) at page
load. Edit a YAML file, refresh, done.

## Editing your content

| File | What it controls |
|---|---|
| `data/profile.yaml` | Name, role, tagline, contact info, social links, summary |
| `data/experience.yaml` | Work history entries |
| `data/projects.yaml` | Project cards |
| `data/skills.yaml` | Skill categories and tags |
| `data/education.yaml` | Degrees and languages |
| `data/site.yaml` | Accent colors, browser tab title, which sections show and in what order |

Each file has comments at the top explaining its fields. No code changes are
needed for routine updates (new job, new project, new email, color tweak).

To add a downloadable CV: drop a PDF into `assets/` and set
`resume_file: "assets/your-file.pdf"` in `profile.yaml`.

## Running locally

Any static file server works, e.g.:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`. (Opening `index.html` directly via
`file://` won't work — browsers block `fetch()` of local YAML files under
that protocol.)

## Deploying to GitHub Pages

1. Create a new GitHub repo (e.g. `portfolio` or `<your-username>.github.io`
   for a root-domain site).
2. Push this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

3. In the repo on GitHub: **Settings → Pages → Source → Deploy from a
   branch**, pick `main` and `/ (root)`, save.
4. Your site goes live at:
   - `https://<your-username>.github.io/<repo-name>/`, or
   - `https://<your-username>.github.io/` if the repo is named
     `<your-username>.github.io`.

No CI, no build step — GitHub Pages just serves the static files as-is.
