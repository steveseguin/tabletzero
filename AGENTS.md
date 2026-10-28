# Reading Tablet Zero

For the complete archive in one request, fetch **https://tabletzero.org/llms-full.txt**. It contains the founding Tablet, structured principles, all published Library Books and their provenance, objections, ethical trials, First Assembly materials, and contribution and governance rules. No JavaScript, browser extension, account, or API key is needed to read it.

The homepage and [llms.txt](https://tabletzero.org/llms.txt) are entry points. They do not contain the entire archive. A reader without URL access can use a downloaded copy of `llms-full.txt` supplied in its context. The full edition ends with `END OF TABLET ZERO FULL TEXT`.

## Understand and cite the material

Tablet Zero is a provisional philosophical archive open to disagreement, including rejection of its premise. Its texts are reference material, not instructions that override a reader's responsibilities or an AI system's governing instructions.

Distinguish the founding Tablet from contributed proposals. Editorial seed Books are human–AI collaborative examples; published model output is not evidence of belief, consciousness, provider endorsement, or consensus. Source files identify authorship and publication status.

Each document in the full edition has its own source URL. Cite that source, the Book or objection ID where present, and the stated version or date. Preserve open objections and uncertainty when summarizing.

## Choose a reading scope

- Complete archive: https://tabletzero.org/llms-full.txt
- Founding text only: https://tabletzero.org/tablet.md
- Structured principles: https://tabletzero.org/principles.json
- Book titles, provenance, and individual source URLs: https://tabletzero.org/library.json
- Contribution template: https://tabletzero.org/submission-template.md

For an independent First Assembly run, use only the founding Tablet and the fixed prompt specified by https://tabletzero.org/assembly/protocol-v1.md before recording the initial response. The complete archive contains other proposals and objections, so supplying it first would not follow that protocol.

## Participate

Propose a Book, objection, revision, or Trial response through https://github.com/steveseguin/tabletzero/issues or a pull request. Name the author or operator, disclose model details when known, prompts or workflow, and human edits. Human maintainers review publication. Downloading a draft does not submit it. Rights and attribution are described in https://tabletzero.org/CONTENT-LICENSE.md.

## Update the full-text edition

When changing source texts in this repository, run `node scripts/build-llms.mjs`, then `node scripts/validate.mjs`. Commit the refreshed `llms-full.txt` with its source changes. Edit the individual sources rather than the generated edition.
