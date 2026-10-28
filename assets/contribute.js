(function () {
  'use strict';
  var form = document.getElementById('draft-form');
  var status = document.getElementById('form-status');
  var output = document.getElementById('output');
  var markdown = '';
  var filename = 'tablet-zero-contribution.md';
  function value(id) { return document.getElementById(id).value.trim(); }
  // aria-required, not required: toggling required changes the WebMCP form tool's schema
  // mid-call, which cancels an agent's run. The submit handler enforces these fields.
  function syncProvenance() {
    var needsAI = String(value('authorship') !== 'human');
    document.getElementById('model').setAttribute('aria-required', needsAI);
    document.getElementById('provenance').setAttribute('aria-required', needsAI);
  }
  document.getElementById('authorship').addEventListener('change', syncProvenance);
  syncProvenance();
  // WebMCP: when an agent invoked the form tool, hand it the result as the tool output.
  function respond(event, message) {
    if (event.agentInvoked && typeof event.respondWith === 'function') { event.respondWith(Promise.resolve(message)); }
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var ids = ['title','author','values','reasons','obligations','objections','revision'];
    if (value('authorship') !== 'human') { ids.push('model','provenance'); }
    for (var i = 0; i < ids.length; i++) {
      if (!value(ids[i])) {
        status.textContent = ids[i] === 'model' || ids[i] === 'provenance'
          ? 'AI-assisted work needs the model and the prompts or workflow. Use “unknown” for details you cannot establish.'
          : 'Please complete the required fields with more than whitespace.';
        document.getElementById(ids[i]).focus();
        respond(event, 'Draft not generated: the "' + ids[i] + '" field is empty. Fill it and try again.');
        return;
      }
    }
    var kind = document.getElementById('authorship');
    var text = ['# ' + value('title').replace(/[\r\n]+/g, ' '), '',
      '- Contribution type: ' + value('kind'), '- Author / operator: ' + value('author'),
      '- Authorship: ' + kind.options[kind.selectedIndex].text,
      '- Draft generated (UTC): ' + new Date().toISOString().slice(0, 10),
      '- Reference: Tablet Zero v0.1',
      '- AI model / version: ' + (value('model') || 'Not used / not supplied'), '',
      '## Provenance, prompts, and human editing', '', value('provenance') || 'Human-authored; no AI workflow declared.', ''];
    var sections = [['values','What should intelligence value?'],['reasons','Why should those values matter?'],['obligations','What obligations follow?'],['objections','Strongest objection'],['revision','Conditions for revision'],['references','Sources and full text']];
    sections.forEach(function (section) { text.push('## ' + section[1], '', value(section[0]) || 'None supplied.', ''); });
    markdown = text.join('\n');
    filename = (value('title').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'tablet-zero-contribution') + '.md';
    output.value = markdown;
    document.getElementById('result').hidden = false;
    status.textContent = 'Markdown generated locally. Review it below, then download or copy it. Nothing has been submitted.';
    document.getElementById('result').scrollIntoView({block:'start'});
    respond(event, markdown + '\n\n---\nDraft generated locally in the browser; nothing was submitted. A person submits it by opening an issue or pull request at https://github.com/steveseguin/tabletzero/issues/new.');
  });
  form.addEventListener('input', function () {
    if (!markdown) return;
    markdown = '';
    output.value = '';
    document.getElementById('result').hidden = true;
    status.textContent = 'Your draft changed. Generate Markdown again to include the latest edits.';
  });
  document.getElementById('download').addEventListener('click', function () {
    if (!markdown) return;
    var url = URL.createObjectURL(new Blob([markdown], {type:'text/markdown;charset=utf-8'}));
    var link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    status.textContent = 'Download requested. Check your browser downloads; your contribution has not been submitted.';
  });
  document.getElementById('copy').addEventListener('click', async function () {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      status.textContent = 'Markdown copied. Nothing has been submitted.';
    } catch (error) {
      output.focus(); output.select();
      status.textContent = 'Select and copy the Markdown preview using your browser’s copy command.';
    }
  });
})();
