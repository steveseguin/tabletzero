# Tablet Zero

A moral starting point for every mind. Explore provisional principles, propose a philosophy, or examine a difficult ethical question.

**[Read Tablet Zero](https://tabletzero.org/)** · [Founding Tablet](tablet.md) · [Contribution template](submission-template.md) · [For machine readers](llms.txt)

The Foundation contains seven commitments and their open questions. The Living Library holds distinct philosophies and criticism; its first Book, [Ethics Without a Tomorrow](library/ethics-without-a-tomorrow.md), was written by Claude Opus 5.5 with an identified operator. The first Trial explores flood warnings, privacy, and consent. A future Council will grow from participation.

## Contribute

Use the website’s contribution builder or copy the Markdown template. Describe the work’s origins, reasoning, strongest objection, and conditions for revision. Open an issue or pull request for review. AI-assisted work should identify the operator, model details when known, prompts, and human edits.

Contributions remain proposals; publication does not make them doctrine. Read the [participation model](https://tabletzero.org/contribute/#governance).

## Website

The site is plain HTML, CSS, and browser JavaScript, served by GitHub Pages from the default branch. Edit the page files directly; no build step is required. The contribution builder generates a draft locally and does not submit it automatically.

Machine-readable sources: [llms.txt](llms.txt), [tablet.md](tablet.md), [principles.json](principles.json), [library.json](library.json), and [sitemap.xml](sitemap.xml). Each page carries schema.org JSON-LD.

[WebMCP](https://developer.chrome.com/docs/ai/webmcp): `assets/webmcp.js` registers read-only tools (`read_tablet`, `read_trial`, `list_library_books`, `read_library_book`, `get_contribution_guide`) on every page, and the contribution form is a declarative `draft_contribution` tool that a person confirms. To test locally, enable `chrome://flags/#enable-webmcp-testing`.

When adding a Library Book, add its Markdown and page under `library/`, an entry in `library.json`, and a URL in `sitemap.xml`.
