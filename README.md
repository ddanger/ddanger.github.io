# ddanger.github.io

Static personal website for `ddanger.github.io`, built from source HTML fragments under `src/` into generated GitHub Pages output at the repository root.

## Requirements

- Node.js 24 or newer
- npm
- Git

## Initial Setup

Run this once after cloning:

```sh
npm run setup:init
```

What this does:

- runs an automated macOS check for FFmpeg `drawtext` support
- uses Homebrew to install `ffmpeg-full` when needed
- runs `npm install`

If Homebrew is not installed on macOS, install it first and rerun setup.

Install dependencies after cloning or pulling fresh setup changes:

```sh
npm install
```

## Project Structure

Source files are the primary editing surface:

- `src/site.json` - shared site configuration
- `src/pages/*/meta.json` - page metadata and output paths
- `src/pages/*/content.html` - page body content
- `src/partials/*.html` - shared layout, header, and footer
- `src/client/` - source JavaScript modules
- `styles.css` - global styles served directly

Generated files are committed because GitHub Pages serves static output directly:

- `index.html`
- `about/index.html`
- `services/index.html`
- `contact/index.html`

Do not edit generated HTML directly unless you are intentionally changing a legacy static file. For normal page updates, edit `src/` and rebuild.

## Local Development

Start the local development server:

```sh
npm run dev
```

Then open:

```text
http://localhost:8000
```

The dev server:

- runs the full build once on startup
- serves the repository root as a static website
- watches `src/` and rebuilds generated pages when source files change

Use a different port when needed:

```sh
PORT=8010 npm run dev
```

Stop the server with `Ctrl+C`.

### Editing Loop

1. Create a branch.
2. Run `npm run dev`.
3. Edit source files in `src/`, `styles.css`, or `script.js`.
4. Refresh the browser at `http://localhost:8000`.
5. Run the validation commands before committing.

Changes to `src/` trigger rebuilds automatically while `npm run dev` is running. Changes to directly served files like `styles.css`, `script.js`, images, or PDFs only need a browser refresh.

## Build and Validation

Build generated HTML and format project files:

```sh
npm run build
```

Validate source page contracts and links:

```sh
npm run validate:source
```

Verify generated HTML matches the source files:

```sh
npm run verify:generated
```

Check formatting without writing changes:

```sh
npm run format:check
```

Recommended pre-commit check:

```sh
npm run validate:source
npm run verify:generated
npm run format:check
```

## Branch, Commit, Push, PR

Start from an updated `main`:

```sh
git switch main
git pull
```

Create a feature branch:

```sh
git switch -c my-change-name
```

Review your changes:

```sh
git status
git diff
```

Stage and commit:

```sh
git add <files-you-changed>
git commit -m "Describe the change"
```

When source page files under `src/` change, also stage the generated HTML files updated by `npm run build` or `npm run dev`.

Push the branch:

```sh
git push --set-upstream origin my-change-name
```

Open a pull request on GitHub from your branch into `main`.

Before requesting review, confirm the PR includes any generated HTML changes caused by source edits. CI checks that generated output is in sync.

## Pull Request Checks

Pull requests and pushes to `main` run automation for:

- generated HTML consistency
- Prettier formatting
- source metadata and link validation, when relevant source files change

After merge, GitHub Actions may update generated artifacts such as `sitemap.xml` or generated HTML on `main` when needed. See `docs/automation.md` for the full automation runbook.

## Common Tasks

Regenerate the sitemap:

```sh
npm run generate:sitemap
```

Run the uptime check locally:

```sh
npm run check:uptime
```

Regenerate the resume social-share image after replacing `Resume-David-Dangerfield.pdf`:

```sh
npm run generate:resume-share
```

If FFmpeg resolution is unusual in your shell, you can still force a binary:

```sh
npm run generate:resume-share -- --ffmpeg-bin /opt/homebrew/opt/ffmpeg-full/bin/ffmpeg
```

Commit the updated PDF and generated image together.
