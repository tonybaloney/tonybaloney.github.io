# Repository instructions

## Architecture and source of truth

This is a static personal website served at `https://tonybaloney.github.io/`.
The repository contains both authoring sources and committed publishable HTML/assets.

- `blog-gen.py` converts `blog/*.md` through Python-Markdown and Jinja2 into
  matching `posts/*.html`, using `templates/blog_post_template.html`. It sorts
  posts by publication date, renders three related posts per article, and generates
  `rss.xml` using `templates/rss_feed_template.xml`. Edit Markdown or templates,
  then regenerate the published files rather than editing generated posts.
- Related-post ranking uses cosine similarity of embeddings of each post's
  heading plus subheading. `embeddings.cache.json` is a committed JSON mapping
  keyed by heading. Cache misses call local Ollama's OpenAI-compatible endpoint
  at `http://localhost:11434/v1/` with `nomic-embed-text:latest`; cached headings
  avoid those calls. Changing a subheading alone does not invalidate its embedding.
- The current root `index.html` is hand-maintained HTML with inline JavaScript;
  blog cards and projects are not populated by `blog-gen.py`. Adding a blog post
  to the homepage requires updating its cards separately.
- The homepage fetches `pages/podcasts.json` in the browser. This is an ordered
  array of objects with `show`, optional `episode`, `title`, `date`, and `url`;
  optional `format` labels video interviews. The first ten are initially visible.
- `js/homepage.js` also fetches `pages/talks.json` (an object with a `talks`
  array), initially showing six entries. Keep both appearance lists newest-first.
  Talks use `video` for recordings or fall back to `url` for session details.
  Project cards remain in `index.html`, with exact committed star-count snapshots;
  their `data-repository` attributes enable public GitHub API refreshes. Failed
  or rate-limited requests preserve the snapshots without requiring a token.
- `home-gen.py` is a separate Render Engine generator, not the blog build. It
  reads `pages/podcasts.csv`, `pages/publications.json`, and `pages/talks.json`,
  and optionally queries GitHub projects using `GITHUB_TOKEN` loaded from `.env`.
  It imports PyGithub (`github`), which is not declared in `requirements.txt`.
  Do not confuse its CSV input with the live homepage's podcast JSON.

## Build, preview, and lint commands

Run commands from the repository root: generators, Gulp, and CSS tools resolve
their inputs relative to the current working directory.

| Purpose | Command |
| --- | --- |
| Regenerate all blog posts, related links, embedding cache, and RSS | `python blog-gen.py` |
| Run the separate Render Engine homepage generator | `python home-gen.py` |
| Serve the committed site locally | `python -m http.server 8000 --bind 127.0.0.1` |
| Lint site CSS | `npm run css:lint` |
| Lint one stylesheet | `npx --yes stylelint@15.11.0 css/homepage.css --config .stylelintrc.json` |
| Test homepage list rendering and star refreshes | `npm run test:homepage` |
| Run one homepage test | `node --test --test-name-pattern="live star counts" tools/homepage.test.cjs` |
| Apply CSS lint fixes | `npm run css:lint:fix` |
| Report unused CSS | `npm run css:unused` |
| Generate purged CSS for review | `npm run css:purge` |
| Apply reviewed purge output, backing up originals | `npm run css:purge:apply` |
| Run the legacy Gulp asset build | `npx gulp` |
| Run the legacy BrowserSync/watch task | `npx gulp dev` |

Python dependencies are declared in `requirements.txt`. Preserve `Markdown<3.2`:
the custom Bootstrap extension uses legacy APIs such as `treeprocessors.add`.
For new headings, the blog build needs Ollama running with `nomic-embed-text:latest`
available. The generator rebuilds every post; it has no single-post selector.

The CSS lint scripts use `.stylelintrc.json` and exclude minified files and
`clean-blog*.css`. `css:unused` writes `output/purgecss-report.json`, so ensure
`output` exists before using it. Purging targets only `homepage.css` and
`blog-post.css`; review removals before applying them. The apply tool expects
files under `output/purgecss/css` and creates timestamped backups under `output`.
Check the actual purge output layout before applying.

`gulpfile.js` uses Gulp 3 dependency-array tasks. Its default task compiles
`less/clean-blog.less`, minifies Clean Blog CSS/JS, copies npm vendor libraries,
and optimizes images from `img/posts-original` into `img/posts`. It does not
generate posts or build the current homepage styles. The copy task replaces
vendor assets from the older npm dependencies; avoid it for unrelated modern
homepage styling changes.

## Content and presentation conventions

- Blog metadata is Python-Markdown `meta` syntax at the beginning of the file,
  not YAML fenced front matter. Required keys are `blog_heading`,
  `blog_subheading`, `blog_header_image`, `blog_author`, and `blog_publish_date`.
  Dates must match `%B %d, %Y` (for example, `August 14, 2025`).
  `blog_card_image` is optional and falls back to the header image.
- Metadata image paths are relative to `img`, such as `posts/example.jpg`;
  templates supply `/img/` or the absolute site URL. Markdown filenames determine
  published slugs: `blog/example.md` becomes `posts/example.html`.
- Markdown enables `extra`, `smarty`, `meta`, `tables`, and `toc` with heading
  permalinks. The custom tree processor adds Bootstrap's `table` class to tables
  and `img-responsive center-block` to images. Raw HTML is also used in articles;
  Mermaid diagrams use `<pre class="mermaid">` and are initialized by the template.
- The current homepage uses `css/homepage.css`; post pages load that stylesheet
  followed by `css/blog-post.css`. Both define matching light/dark CSS variables.
  Keep shared theme tokens consistent and scope article-specific rules to avoid
  unintentionally changing homepage components.
- Theme initialization and toggle logic exist separately in `index.html` and the
  blog template. Both set `data-theme` on the root element before rendering,
  persist an explicit choice in `localStorage.theme`, and otherwise follow
  `prefers-color-scheme`. Keep both implementations aligned when changing theme behavior.
- Preserve runtime visibility classes `show-all`, `expanded`, `hidden-article`,
  `hidden-podcast`, and `hidden-talk` in `purgecss.config.cjs`'s safelist; update it when adding
  dynamically applied classes.
- Published posts, RSS, embedding cache, and built assets are tracked; `output/`
  is ignored scratch/build output. Shared post-template changes affect all
  generated articles, not just the article being edited.

The README identifies `blog-gen.py` as MIT-licensed; retain its license context
when reusing or modifying the generator.
