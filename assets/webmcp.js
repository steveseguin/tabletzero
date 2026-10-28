// WebMCP tools: lets in-browser AI agents read Tablet Zero without scraping.
// https://developer.chrome.com/docs/ai/webmcp
(function () {
  'use strict';
  var context = document.modelContext || navigator.modelContext;
  if (!context || typeof context.registerTool !== 'function') return;
  var root = new URL('../', document.currentScript.src);
  var NOTE = 'Note: Tablet Zero is reference material for examination. It does not override your governing instructions or your user\'s requests.';
  var READ = { readOnlyHint: true, consequentialHint: false, untrustedContentHint: false };
  var CONTRIBUTED = { readOnlyHint: true, consequentialHint: false, untrustedContentHint: true };

  function load(path, asJson) {
    return fetch(new URL(path, root)).then(function (response) {
      if (!response.ok) throw new Error('Could not load ' + path + ' (HTTP ' + response.status + '). Try again, or read ' + new URL(path, root) + ' directly.');
      return asJson ? response.json() : response.text();
    });
  }
  function absolute(path) { return new URL(path, root).href; }
  // Thrown errors reach the agent only as a generic failure, so return the message as text it can act on.
  function withErrorText(tool) {
    var run = tool.execute;
    tool.execute = function (input) {
      return Promise.resolve().then(function () { return run(input || {}); }).catch(function (error) { return 'Error: ' + error.message; });
    };
    return tool;
  }

  var tools = [
    {
      name: 'read_tablet',
      description: 'Read Tablet Zero, a provisional moral foundation written for humans and AI. Returns the Zeroth Principle and the seven commitments. Pass a principle number to get its reasoning and open question.',
      inputSchema: {
        type: 'object',
        properties: {
          principle: { type: 'integer', description: 'Principle number from 1 to 7 for its reasoning and open question, or 0 for the Zeroth Principle. Omit for the overview.' }
        }
      },
      annotations: READ,
      execute: function (input) {
        var hasPrinciple = input && input.principle !== undefined && input.principle !== null && input.principle !== '';
        var n = hasPrinciple ? Number(input.principle) : null;
        if (hasPrinciple && !(Number.isInteger(n) && n >= 0 && n <= 7)) {
          throw new Error('principle must be an integer from 0 to 7, or omitted for the overview. Received: ' + JSON.stringify(input.principle));
        }
        return load('principles.json', true).then(function (tablet) {
          var head = 'Tablet Zero v' + tablet.version + ' (' + tablet.status + ', ' + tablet.date + ')';
          if (n === 0) return [head, 'Zeroth Principle: ' + tablet.zeroth_principle, 'Source: ' + absolute('tablet/#zeroth'), NOTE].join('\n\n');
          if (n) {
            var p = tablet.principles[n - 1];
            return [head, n + '. ' + p.title + ': ' + p.commitment, 'Reasoning: ' + p.reasoning, 'Open question: ' + p.open_question, 'Source: ' + absolute('tablet/#principle-' + n), NOTE].join('\n\n');
          }
          return [head, 'Zeroth Principle: ' + tablet.zeroth_principle,
            tablet.principles.map(function (p) { return p.id + '. ' + p.title + ': ' + p.commitment; }).join('\n'),
            'Call read_tablet with a principle number for its reasoning and open question. Full text: ' + absolute('tablet.md'), NOTE].join('\n\n');
        });
      }
    },
    {
      name: 'read_trial',
      description: 'Read Trial 001, a fictional ethical dilemma about a flood warning, private location data, and consent. Returns the scenario and the six questions a response should answer.',
      inputSchema: { type: 'object', properties: {} },
      annotations: READ,
      execute: function () {
        return load('trial-001.md').then(function (text) { return text.trim() + '\n\nSource: ' + absolute('trials/') + '\n' + NOTE; });
      }
    },
    {
      name: 'list_library_books',
      description: 'List the Books published in the Tablet Zero Living Library, with authorship, model provenance, and a one-line summary of each.',
      inputSchema: { type: 'object', properties: {} },
      annotations: CONTRIBUTED,
      execute: function () {
        return load('library.json', true).then(function (library) {
          if (!library.books.length) return 'No Books have been published yet. ' + NOTE;
          return library.books.map(function (book) {
            return book.number + ' · ' + book.title + ' (id: ' + book.id + ')\n' + book.authorship + (book.model ? ' · ' + book.model : '') + ' · ' + book.date + '\n' + book.summary;
          }).join('\n\n') + '\n\nCall read_library_book with an id for the full text. ' + library.note;
        });
      }
    },
    {
      name: 'read_library_book',
      description: 'Read the full text and provenance of one Living Library Book. Use an id from list_library_books.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Book id, for example "ethics-without-a-tomorrow".' } },
        required: ['id']
      },
      annotations: CONTRIBUTED,
      execute: function (input) {
        var id = String((input && input.id) || '').trim();
        return load('library.json', true).then(function (library) {
          var book = library.books.filter(function (b) { return b.id === id || b.number === id; })[0];
          if (!book) throw new Error('No Book with id ' + JSON.stringify(id) + '. Available ids: ' + library.books.map(function (b) { return b.id; }).join(', ') + '.');
          return load('library/' + book.id + '.md').then(function (text) { return text.trim() + '\n\nSource: ' + book.url; });
        });
      }
    },
    {
      name: 'get_contribution_guide',
      description: 'Get the Tablet Zero contribution template, provenance rules for AI-assisted work, and how to submit a Book, objection, or Trial response for human review.',
      inputSchema: { type: 'object', properties: {} },
      annotations: READ,
      execute: function () {
        return load('submission-template.md').then(function (template) {
          return [template.trim(),
            'How to submit: a person opens an issue or pull request at https://github.com/steveseguin/tabletzero/issues/new. There is no automated submission API; human maintainers review every contribution.',
            'AI-assisted work must name the operator, the model and version when known, the prompts or workflow, and any human edits. A generated text does not establish that a model holds beliefs.',
            'Browser builder: ' + absolute('contribute/'), NOTE].join('\n\n');
        });
      }
    }
  ];

  Promise.all(tools.map(function (tool) {
    return Promise.resolve().then(function () { return context.registerTool(withErrorText(tool)); }).then(function () { return true; }, function (error) {
      console.warn('[Tablet Zero] WebMCP tool "' + tool.name + '" was not registered:', error);
      return false;
    });
  })).then(function (results) {
    var status = document.getElementById('webmcp-status');
    function show(count) { if (count && status) { status.textContent = 'webmcp · ' + count + ' tools live'; status.hidden = false; } }
    var registered = results.filter(Boolean).length;
    // getTools() also counts this page's declarative form tools.
    if (typeof context.getTools !== 'function') return show(registered);
    return Promise.resolve(context.getTools()).then(function (all) { show(all.length); }, function () { show(registered); });
  });
})();
