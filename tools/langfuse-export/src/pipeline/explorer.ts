// Render the self-contained, offline HTML explorer (NES-1719). Pure: string
// in, string out. The dataset is inlined into the page as a JSON <script>
// block, and the viewer is vanilla DOM JS with no framework, no build step,
// and no network/CDN dependency — so a stakeholder unzips the bundle and
// opens index.html by double-clicking, working entirely from file://.
//
// Safety: every piece of corpus text is rendered via DOM textContent in the
// viewer (never innerHTML), so sanitised chat content cannot inject markup.
// The inlined JSON has its '<' escaped to < so it cannot break out of the
// <script type="application/json"> container.

import type { InsightsDataset } from '../types'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const VIEWER_CSS = `
:root {
  --bg:#f7f7f8; --panel:#fff; --line:#e3e3e8; --ink:#1a1a1a; --muted:#6b6b76;
  --accent:#2f6feb; --accent-soft:#e8f0ff; --user:#eef6ff; --asst:#f4f4f6;
}
* { box-sizing: border-box; }
body {
  margin:0; height:100vh; display:flex; flex-direction:column;
  font:14px/1.55 -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
  color:var(--ink); background:var(--bg);
}
header.top { flex:0 0 auto; padding:.9rem 1.25rem; background:var(--panel); border-bottom:1px solid var(--line); }
header.top h1 { margin:0 0 .2rem; font-size:1.1rem; }
.meta { color:var(--muted); font-size:.8rem; }
.stats { margin-top:.4rem; display:flex; flex-wrap:wrap; gap:.35rem 1rem; font-size:.8rem; color:var(--muted); }
.stats b { color:var(--ink); font-weight:600; }
.note { margin-top:.5rem; font-size:.8rem; background:#fff8e1; border:1px solid #ffe082; padding:.4rem .6rem; border-radius:6px; color:#5c4b00; }
.layout { flex:1 1 auto; min-height:0; display:grid; grid-template-columns:250px 340px 1fr; }
.facets, .list, .detail { overflow:auto; padding:.85rem; }
.facets { border-right:1px solid var(--line); background:var(--panel); }
.list { border-right:1px solid var(--line); }
.detail { background:var(--panel); }
.group-title { font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); margin:.5rem 0 .25rem; padding:.25rem .3rem; display:flex; align-items:center; gap:.4rem; cursor:pointer; user-select:none; border-radius:6px; }
.group-title:hover { background:#f0f0f3; color:var(--ink); }
.caret { display:inline-block; width:.85em; text-align:center; font-size:.8rem; color:var(--accent); }
.group-title .gcount { margin-left:auto; font-weight:400; color:var(--muted); }
.facet { display:flex; justify-content:space-between; align-items:center; gap:.5rem; padding:.28rem .5rem; border-radius:6px; cursor:pointer; user-select:none; }
.facet:hover { background:#f0f0f3; }
.facet.active { background:var(--accent-soft); color:var(--accent); font-weight:600; }
.facet .c { font-size:.72rem; color:var(--muted); }
.facet.active .c { color:var(--accent); }
.toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:.55rem; gap:.5rem; }
.count-line { font-size:.8rem; color:var(--muted); }
button.clear { font:inherit; font-size:.78rem; border:1px solid var(--line); background:#fff; border-radius:6px; padding:.25rem .55rem; cursor:pointer; }
button.clear:hover { background:#f0f0f3; }
.card { padding:.55rem .65rem; border:1px solid var(--line); border-radius:8px; margin-bottom:.5rem; cursor:pointer; background:#fff; }
.card:hover { border-color:#c7c7d1; }
.card.active { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent); }
.card .label { font-weight:600; }
.card .sub { font-size:.76rem; color:var(--muted); margin:.15rem 0; }
.card .preview { font-size:.82rem; color:#333; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.chip { display:inline-block; font-size:.7rem; background:#eef; color:#33387a; border-radius:10px; padding:.05rem .45rem; margin:.15rem .25rem .15rem 0; }
.pill { display:inline-block; font-size:.7rem; line-height:1.45; border:1px solid transparent; border-radius:999px; padding:.02rem .45rem; margin-right:.35rem; white-space:nowrap; vertical-align:middle; }
.empty { color:var(--muted); font-style:italic; padding:1rem .2rem; }
.detail h2 { font-size:1.05rem; margin:.1rem 0 .3rem; }
.detail .sub { color:var(--muted); font-size:.8rem; margin-bottom:.4rem; }
.msg { margin:.55rem 0; max-width:760px; }
.msg .who { font-size:.7rem; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); margin-bottom:.15rem; }
.bubble { padding:.5rem .7rem; border-radius:10px; white-space:pre-wrap; word-wrap:break-word; overflow-wrap:anywhere; }
.msg.user .bubble { background:var(--user); }
.msg.assistant .bubble { background:var(--asst); }
`

// Vanilla-DOM viewer. Deliberately written without template literals so it can
// live inside this module's template string unescaped. All text reaches the
// page through textContent — never innerHTML — so corpus content is inert.
const VIEWER_JS = `
(function () {
  var dataEl = document.getElementById('insights-data');
  var data = {};
  try { data = JSON.parse(dataEl.textContent); } catch (err) { data = {}; }
  var sessions = Array.isArray(data.sessions) ? data.sessions : [];
  var facets = Array.isArray(data.facets) ? data.facets : [];
  var summary = data.summary || {};
  var selected = Object.create(null);
  var activeId = null;
  // Facet groups collapse by default; expanded ones are recorded here so the
  // state survives the re-render that fires when a facet is toggled.
  var expandedGroups = Object.create(null);

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function clearNode(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function selectedKeys() {
    var out = [];
    for (var key in selected) { if (selected[key]) out.push(key); }
    return out;
  }
  function sessionMatches(session) {
    var keys = selectedKeys();
    if (keys.length === 0) return true;
    var has = session.facetKeys || [];
    // Group selected keys by facet kind (the prefix before ':'). A session
    // matches if, for every group with a selection, it carries at least one of
    // that group's keys: OR within a group, AND across groups. So a viewer can
    // pick multiple countries (Country A OR Country B) and still narrow by a
    // theme or keyword on top.
    var groups = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var kind = key.slice(0, key.indexOf(':'));
      if (!groups[kind]) groups[kind] = [];
      groups[kind].push(key);
    }
    for (var g in groups) {
      var groupKeys = groups[g];
      var matchedGroup = false;
      for (var j = 0; j < groupKeys.length; j++) {
        if (has.indexOf(groupKeys[j]) !== -1) {
          matchedGroup = true;
          break;
        }
      }
      if (!matchedGroup) return false;
    }
    return true;
  }
  function visibleSessions() {
    var out = [];
    for (var i = 0; i < sessions.length; i++) {
      if (sessionMatches(sessions[i])) out.push(sessions[i]);
    }
    return out;
  }
  // Stable hue per value so every 'US' / 'en' pill shares a colour and a reader
  // can line up sessions with the same country or language at a glance.
  function hueOf(seed) {
    var hash = 0;
    for (var i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return hash % 360;
  }
  function pill(kind, value) {
    var node = el('span', 'pill', value);
    var hue = hueOf(kind + ':' + value);
    node.style.backgroundColor = 'hsl(' + hue + ', 70%, 90%)';
    node.style.color = 'hsl(' + hue + ', 45%, 28%)';
    node.style.borderColor = 'hsl(' + hue + ', 55%, 80%)';
    return node;
  }
  // language + country as coloured pills; message count (and null-session) stay
  // as plain muted text after them.
  function buildMeta(session) {
    var sub = el('div', 'sub');
    if (session.language) {
      var langPill = pill('lang', session.language);
      langPill.title = 'Journey language, not the language the user typed';
      sub.appendChild(langPill);
    }
    if (session.ipCountry) sub.appendChild(pill('country', session.ipCountry));
    var rest = session.messageCount + ' messages';
    if (session.synthetic) rest += '  \\u00b7  null-session';
    sub.appendChild(document.createTextNode(rest));
    return sub;
  }

  function renderHeader() {
    var host = document.getElementById('top');
    clearNode(host);
    host.appendChild(el('h1', null, 'Apologist chat \\u2014 insights explorer'));
    var win = (summary.windowFrom || '').slice(0, 10) + '  \\u2192  ' + (summary.windowTo || '').slice(0, 10);
    var gen = (summary.generatedAt || '').slice(0, 16).replace('T', ' ');
    host.appendChild(el('div', 'meta', 'Window ' + win + (gen ? ('   \\u00b7   generated ' + gen + ' UTC') : '')));
    var stats = el('div', 'stats');
    function stat(value, label) {
      var span = el('span');
      span.appendChild(el('b', null, String(value)));
      span.appendChild(document.createTextNode(' ' + label));
      return span;
    }
    stats.appendChild(stat(summary.totalSessions || 0, 'sessions'));
    stats.appendChild(stat(summary.totalMessages || 0, 'messages'));
    stats.appendChild(stat(summary.singleTurnCount || 0, 'single-turn'));
    stats.appendChild(stat(summary.nullSessionCount || 0, 'null-session'));
    stats.appendChild(stat(summary.excludedLoadTestTurns || 0, 'load-test turns excluded'));
    stats.appendChild(stat(summary.suppressedKeywordCount || 0, 'over-common keywords suppressed'));
    host.appendChild(stats);
    if (!summary.themesAvailable) {
      host.appendChild(el('div', 'note', 'Per-session themes were not generated for this dataset \\u2014 filter by keyword facets instead.'));
    }
  }

  function renderFacetGroup(host, title, items) {
    if (items.length === 0) return;
    var expanded = expandedGroups[title] === true;
    // How many of this group's facets are currently selected, so a collapsed
    // group still signals that it is filtering.
    var activeCount = 0;
    for (var n = 0; n < items.length; n++) {
      if (selected[items[n].key]) activeCount += 1;
    }

    var header = el('div', 'group-title');
    header.appendChild(el('span', 'caret', expanded ? '\\u25BE' : '\\u25B8'));
    header.appendChild(el('span', null, title));
    var count = activeCount > 0 ? activeCount + ' / ' + items.length : String(items.length);
    header.appendChild(el('span', 'gcount', count));
    header.addEventListener('click', function () {
      expandedGroups[title] = !expanded;
      renderFacets();
    });
    host.appendChild(header);

    if (!expanded) return;
    for (var i = 0; i < items.length; i++) {
      (function (facet) {
        var row = el('div', 'facet' + (selected[facet.key] ? ' active' : ''));
        row.appendChild(el('span', 'l', facet.label));
        row.appendChild(el('span', 'c', String(facet.count)));
        row.addEventListener('click', function () {
          selected[facet.key] = !selected[facet.key];
          renderFacets();
          renderList();
        });
        host.appendChild(row);
      })(items[i]);
    }
  }
  function renderFacets() {
    var host = document.getElementById('facets');
    clearNode(host);
    if (facets.length === 0) {
      host.appendChild(el('div', 'empty', 'No facets available.'));
      return;
    }
    host.appendChild(el('div', 'meta', 'Select facets to narrow. Within a group any match counts; across groups all must match.'));
    var countries = [];
    var languages = [];
    var themes = [];
    var keywords = [];
    for (var i = 0; i < facets.length; i++) {
      if (facets[i].kind === 'country') countries.push(facets[i]);
      else if (facets[i].kind === 'language') languages.push(facets[i]);
      else if (facets[i].kind === 'theme') themes.push(facets[i]);
      else keywords.push(facets[i]);
    }
    renderFacetGroup(host, 'Country', countries);
    renderFacetGroup(host, 'Journey Language', languages);
    renderFacetGroup(host, 'Themes', themes);
    renderFacetGroup(host, 'Keywords', keywords);
  }

  function renderList() {
    var host = document.getElementById('list');
    clearNode(host);
    var visible = visibleSessions();
    var bar = el('div', 'toolbar');
    bar.appendChild(el('span', 'count-line', visible.length + ' of ' + sessions.length + ' sessions'));
    var keys = selectedKeys();
    if (keys.length > 0) {
      var btn = el('button', 'clear', 'Clear ' + keys.length + ' filter' + (keys.length === 1 ? '' : 's'));
      btn.addEventListener('click', function () {
        selected = Object.create(null);
        renderFacets();
        renderList();
      });
      bar.appendChild(btn);
    }
    host.appendChild(bar);
    if (visible.length === 0) {
      host.appendChild(el('div', 'empty', 'No sessions match the selected filters.'));
      return;
    }
    for (var j = 0; j < visible.length; j++) {
      (function (session) {
        var card = el('div', 'card' + (session.id === activeId ? ' active' : ''));
        card.appendChild(el('div', 'label', session.label));
        card.appendChild(buildMeta(session));
        card.appendChild(el('div', 'preview', session.firstUserMessage || '(no user text)'));
        card.addEventListener('click', function () {
          activeId = session.id;
          renderList();
          renderDetail();
        });
        host.appendChild(card);
      })(visible[j]);
    }
  }

  function findSession(id) {
    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i].id === id) return sessions[i];
    }
    return null;
  }
  function renderDetail() {
    var host = document.getElementById('detail');
    clearNode(host);
    var session = findSession(activeId);
    if (!session) {
      host.appendChild(el('div', 'empty', 'Select a session to read the full conversation in order.'));
      return;
    }
    host.appendChild(el('h2', null, session.label));
    host.appendChild(buildMeta(session));
    if (session.themes && session.themes.length > 0) {
      var chips = el('div');
      for (var t = 0; t < session.themes.length; t++) {
        chips.appendChild(el('span', 'chip', session.themes[t]));
      }
      host.appendChild(chips);
    }
    var messages = session.messages || [];
    if (messages.length === 0) {
      host.appendChild(el('div', 'empty', 'This session has no readable messages.'));
      return;
    }
    for (var m = 0; m < messages.length; m++) {
      var msg = messages[m];
      var wrap = el('div', 'msg ' + (msg.role === 'user' ? 'user' : 'assistant'));
      wrap.appendChild(el('div', 'who', msg.role === 'user' ? 'User' : 'Assistant'));
      wrap.appendChild(el('div', 'bubble', msg.text));
      host.appendChild(wrap);
    }
  }

  renderHeader();
  renderFacets();
  renderList();
  renderDetail();
})();
`

export function renderExplorer(dataset: InsightsDataset): string {
  const title =
    `Apologist chat insights ${dataset.summary.windowFrom.slice(0, 10)} ` +
    `to ${dataset.summary.windowTo.slice(0, 10)}`
  // Escape '<' so the corpus can never terminate the JSON <script> container.
  // < is a valid JSON escape, so JSON.parse restores it in the viewer.
  const json = JSON.stringify(dataset).replace(/</g, '\\u003c')

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    '<style>',
    VIEWER_CSS,
    '</style>',
    '</head>',
    '<body>',
    '<header class="top" id="top"></header>',
    '<main class="layout">',
    '<aside class="facets" id="facets"></aside>',
    '<section class="list" id="list"></section>',
    '<section class="detail" id="detail"></section>',
    '</main>',
    '<script type="application/json" id="insights-data">',
    json,
    '</script>',
    '<script>',
    VIEWER_JS,
    '</script>',
    '</body>',
    '</html>',
    ''
  ].join('\n')
}
