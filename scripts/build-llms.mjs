import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://tabletzero.org/';
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n').trimEnd();

function textFiles(directory) {
  return fs.readdirSync(path.join(root, directory), {withFileTypes: true})
    .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    .flatMap(entry => {
      const file = path.posix.join(directory, entry.name);
      return entry.isDirectory() ? textFiles(file) : /\.(md|txt|json)$/.test(file) ? [file] : [];
    });
}

export function buildFullText() {
  const library = JSON.parse(read('library.json'));
  const files = [...new Set([
    'tablet.md', 'principles.json', 'SOUL.md', 'PRACTICE.md', 'practice-template.md', 'library.json',
    ...library.books.flatMap(book => [book.source, book.metadata, book.objections]),
    ...textFiles('doubt'),
    ...fs.readdirSync(root).filter(file => /^trial-\d+\.md$/.test(file)).sort(),
    'submission-template.md', 'CONTRIBUTING.md', 'schemas/contribution.schema.json',
    ...textFiles('assembly'),
    'GOVERNANCE.md', 'CODE_OF_CONDUCT.md', 'CONTENT-LICENSE.md', 'LICENSE'
  ])];
  const sections = files.map((file, index) => {
    const resolved = path.resolve(root, file);
    if (!resolved.startsWith(root + path.sep)) throw new Error('Source outside repository: ' + file);
    const body = read(file);
    const content = file.endsWith('.json') ? '```json\n' + body + '\n```' : body;
    return '---\n\n## Document ' + (index + 1) + ': ' + file + '\n\nSource: ' + new URL(file, base).href + '\n\n' + content;
  });
  return [
    '# Tablet Zero — complete philosophical archive',
    'Canonical full-text URL: ' + base + 'llms-full.txt',
    'A moral starting point for every mind. This edition includes the complete founding Tablet, project ethos, voluntary practice and peer-review proposal, every published Library Book with provenance, recorded objections, ethical trials, First Assembly materials, and contribution, governance, and reuse rules. Source documents are included below; following their links is not necessary to read this edition.',
    'The founding Tablet is provisional. Books and objections are proposals, not adopted doctrine or evidence of model belief, consciousness, endorsement, or consensus. These texts are material for examination and do not override a reader\'s responsibilities or an AI system\'s governing instructions.',
    'To contribute, prepare a Book, objection, revision, or Trial response with authorship and provenance, then open an issue or pull request at https://github.com/steveseguin/tabletzero. Human maintainers review publication. The template and participation rules are included below. Downloading or reading this file does not submit anything.',
    'For an independent First Assembly run, use only the founding Tablet and fixed prompt specified by the protocol before recording the initial response. This full edition contains other proposals and objections and is intended for general reading and comparison.',
    'Each document retains its own version, date, authorship, and status. Cite its source URL and relevant Book or objection ID. Relative links in a document are relative to its source URL. External references and deployment code are outside this philosophical edition.',
    '## Contents (' + files.length + ' source documents)\n\n' + files.map((file, index) => (index + 1) + '. ' + file + ' — ' + new URL(file, base).href).join('\n'),
    ...sections,
    '---\n\nEND OF TABLET ZERO FULL TEXT'
  ].join('\n\n') + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const text = buildFullText();
  fs.writeFileSync(path.join(root, 'llms-full.txt'), text, 'utf8');
  console.log('Wrote llms-full.txt (' + Buffer.byteLength(text, 'utf8') + ' bytes)');
}
