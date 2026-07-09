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

// Jesus Film Project design tokens (NES-1762). Original message ink is
// --fg-primary (#4D4D4D, the authoritative body ink); machine-translated
// English is --jfp-navy (#424A66, a sanctioned informational accent that reads
// as a secondary source). Brand red is reserved for emphasis/selection, never
// for translated body text. No dark mode, no gradients, no web fonts.
const VIEWER_CSS = `
:root {
  --jfp-red:#EF3340; --jfp-red-medium:#CB333B; --jfp-red-dark:#643335; --jfp-soft-black:#4D4D4D;
  --jfp-white:#FFFFFF; --jfp-warm-white:#F0EDE3; --jfp-warm-gray-01:#B0AFA8;
  --jfp-warm-gray-02:#DCDAD2; --jfp-gray-01:#BBBCBC; --jfp-gray-02:#E7E9E9;
  --jfp-navy:#424A66; --jfp-marigold:#FF9E00; --jfp-maroon:#91214A;
  --bg-primary:#FFFFFF; --bg-secondary:#F0EDE3; --bg-muted:#E7E9E9;
  --fg-primary:#4D4D4D; --fg-secondary:#6A6A6A; --fg-muted:#BBBCBC;
  --fg-brand:#EF3340; --border-subtle:#E7E9E9; --border-default:#BBBCBC;
  --border-strong:#4D4D4D;
  --font-sans:'Inter','Aperçu Pro',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --font-serif:'Noto Serif','Iowan Old Style',Georgia,serif;
  --text-2xs:11px; --text-xs:12px; --text-sm:14px; --text-base:16px;
  --text-md:18px; --text-lg:22px; --text-xl:28px;
  --radius-xs:2px; --radius-sm:4px; --radius-md:8px; --radius-lg:16px; --radius-pill:999px;
  --shadow-xs:0 1px 2px rgba(77,77,77,.08);
  --shadow-sm:0 2px 6px rgba(77,77,77,.10);
  --shadow-md:0 6px 16px rgba(77,77,77,.12);
  --ease-out:cubic-bezier(.22,1,.36,1);
  --focus-ring:0 0 0 3px rgba(239,51,64,.15);
}
* { box-sizing: border-box; }
body {
  margin:0; height:100vh; display:flex; flex-direction:column;
  font-family:var(--font-sans); font-size:var(--text-sm); line-height:1.5;
  color:var(--fg-primary); background:var(--bg-secondary);
}
header.top { flex:0 0 auto; padding:16px 24px; background:var(--bg-primary); border-bottom:1px solid var(--border-subtle); }
/* The design system specifies --fg-brand (#EF3340) for the eyebrow, but at
   12px that is 4.02:1 on white - below the AA floor of 4.5:1 for text this
   size. --jfp-red-medium (#CB333B, 5.15:1) is the same brand red one step
   darker and clears it. Accessibility wins over a literal token reading. */
.jfp-eyebrow { font-family:var(--font-sans); text-transform:uppercase; font-size:var(--text-xs); font-weight:700; letter-spacing:0.16em; color:var(--jfp-red-medium); margin:0 0 4px; }
header.top h1 { margin:0 0 4px; font-family:var(--font-sans); font-size:var(--text-lg); font-weight:600; letter-spacing:-0.02em; color:var(--fg-primary); }
.meta { color:var(--fg-secondary); font-size:var(--text-xs); }
.stats { margin-top:8px; display:flex; flex-wrap:wrap; gap:4px 24px; font-size:var(--text-xs); color:var(--fg-secondary); }
.stats b { color:var(--fg-primary); font-weight:600; }
.note { margin-top:12px; font-size:var(--text-xs); line-height:1.5; background:var(--bg-secondary); border:1px solid var(--border-default); border-left:3px solid var(--border-strong); padding:12px 16px; border-radius:var(--radius-md); color:var(--fg-secondary); }
.note strong { color:var(--fg-primary); font-weight:600; }
.note-translation { border-color:var(--jfp-navy); box-shadow:var(--shadow-xs); }
.legend { display:flex; flex-wrap:wrap; gap:8px 16px; margin-top:8px; font-size:var(--text-2xs); }
.legend-item { display:inline-flex; align-items:center; gap:8px; color:var(--fg-secondary); }
.swatch { width:10px; height:10px; border-radius:var(--radius-xs); display:inline-block; flex:0 0 auto; }
.swatch.ink-original { background:var(--fg-primary); }
.swatch.ink-translated { background:var(--jfp-navy); }
/* The legend is set in the very inks it names, so it demonstrates the code
   instead of merely asserting it (two 10px swatches read as one colour). */
.legend-sample { font-family:var(--font-serif); font-size:var(--text-xs); }
.legend-sample.ink-translated-text { color:var(--jfp-navy); }
.legend-sample.ink-original-text { color:var(--fg-primary); }
.layout { flex:1 1 auto; min-height:0; display:grid; grid-template-columns:260px 360px 1fr; }
.facets, .list, .detail { overflow:auto; padding:16px; }
.facets { border-right:1px solid var(--border-subtle); background:var(--bg-primary); }
.list { border-right:1px solid var(--border-subtle); background:var(--bg-secondary); }
.detail { background:var(--bg-primary); }
.group-title { font-family:var(--font-sans); font-size:var(--text-2xs); text-transform:uppercase; letter-spacing:0.16em; font-weight:600; color:var(--fg-secondary); margin:12px 0 4px; padding:4px 6px; display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none; border-radius:var(--radius-sm); }
.group-title:hover { background:var(--bg-muted); color:var(--fg-primary); }
.caret { display:inline-block; width:0.85em; text-align:center; font-size:var(--text-xs); color:var(--fg-secondary); }
.group-title .gcount { margin-left:auto; font-weight:400; letter-spacing:0; color:var(--fg-secondary); }
.group-hint { font-family:var(--font-sans); font-size:var(--text-2xs); color:var(--fg-primary); margin:0 0 8px 20px; }
.facet { display:flex; justify-content:space-between; align-items:center; gap:8px; padding:4px 8px; border-radius:var(--radius-sm); cursor:pointer; user-select:none; font-size:var(--text-sm); color:var(--fg-primary); }
.facet:hover { background:var(--bg-muted); }
.facet.active { background:var(--bg-secondary); color:var(--fg-primary); font-weight:600; box-shadow:inset 2px 0 0 var(--border-strong); }
.facet .l { flex:1 1 auto; min-width:0; display:flex; align-items:baseline; gap:8px; }
.facet-tmark { width:6px; height:6px; border-radius:var(--radius-pill); background:var(--jfp-navy); display:inline-block; flex:0 0 auto; align-self:center; }
.facet-gloss { color:var(--jfp-navy); }
.facet-original { font-size:var(--text-xs); color:var(--fg-secondary); }
.facet .c { font-size:var(--text-2xs); color:var(--fg-secondary); flex:0 0 auto; }
.facet.active .c { color:var(--fg-primary); }
.facet-legend { display:flex; align-items:center; gap:8px; font-size:var(--text-2xs); line-height:1.5; color:var(--fg-secondary); margin:4px 0 8px; }
.toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:8px; }
.count-line { font-size:var(--text-xs); color:var(--fg-secondary); }
button.clear { font-family:var(--font-sans); font-size:var(--text-xs); font-weight:600; color:var(--fg-primary); border:1px solid var(--border-default); background:var(--bg-primary); border-radius:var(--radius-pill); padding:4px 12px; cursor:pointer; transition:background 120ms var(--ease-out), border-color 120ms var(--ease-out); }
button.clear:hover { background:var(--bg-muted); border-color:var(--fg-secondary); }
button.clear:focus-visible { outline:none; box-shadow:var(--focus-ring); border-color:var(--jfp-red); }
.card { padding:12px; border:1px solid var(--border-subtle); border-radius:var(--radius-md); margin-bottom:8px; cursor:pointer; background:var(--bg-primary); box-shadow:var(--shadow-xs); transition:border-color 120ms var(--ease-out), box-shadow 120ms var(--ease-out); }
.card:hover { border-color:var(--border-default); box-shadow:var(--shadow-sm); }
/* Selection is UI state, not brand emphasis: reserved red would be spent on
   chrome. Navy is taken (it means 'machine translation'), so selection uses
   the strong neutral. Red survives on the eyebrow and the focus ring. */
.card.active { border-color:var(--border-strong); box-shadow:0 0 0 1px var(--border-strong); }
.card .label { font-family:var(--font-sans); font-weight:600; color:var(--fg-primary); }
.card .sub { font-size:var(--text-xs); color:var(--fg-secondary); margin:4px 0; display:flex; flex-wrap:wrap; align-items:center; gap:4px; }
.preview { margin-top:2px; }
.preview-line { font-family:var(--font-serif); font-size:var(--text-sm); line-height:1.5; color:var(--fg-primary); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
/* A session-level statement about the conversation, deliberately NOT the navy
   per-message badge: it must never read as a label for the line above it. */
.card-summary { margin-top:8px; font-family:var(--font-sans); font-size:var(--text-2xs); letter-spacing:0.04em; color:var(--fg-primary); }
.preview-en { font-family:var(--font-serif); font-size:var(--text-sm); line-height:1.5; color:var(--jfp-navy); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.preview-original { margin-top:4px; padding-left:8px; border-left:2px solid var(--border-strong); font-family:var(--font-serif); font-size:var(--text-xs); line-height:1.5; color:var(--fg-primary); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.langmark { display:inline-block; font-family:var(--font-sans); font-size:var(--text-2xs); font-weight:600; letter-spacing:0.04em; color:var(--jfp-white); background:var(--jfp-navy); border-radius:var(--radius-pill); padding:4px 10px; white-space:nowrap; max-width:100%; overflow:hidden; text-overflow:ellipsis; }
.card-langs { margin:8px 0 0; }
.detail-langs { margin:0 0 8px; }
.o-cue { font-family:var(--font-sans); font-size:var(--text-2xs); font-weight:600; text-transform:uppercase; letter-spacing:0.16em; color:var(--fg-secondary); margin-right:6px; }
.chip { display:inline-block; font-family:var(--font-sans); font-size:var(--text-2xs); font-weight:600; letter-spacing:0.04em; background:var(--jfp-warm-white); color:var(--fg-primary); border:1px solid var(--border-default); border-radius:var(--radius-pill); padding:4px 10px; margin:4px 8px 4px 0; }
.pill { display:inline-block; font-family:var(--font-sans); font-size:var(--text-2xs); font-weight:600; line-height:1.5; color:var(--fg-primary); letter-spacing:0.04em; border:1px solid transparent; border-radius:var(--radius-pill); padding:4px 10px; margin-right:8px; white-space:nowrap; vertical-align:middle; }
.pill-a { background:var(--jfp-warm-white); border-color:var(--jfp-warm-gray-02); }
.pill-b { background:var(--jfp-gray-02); border-color:var(--jfp-gray-01); }
.pill-c { background:var(--jfp-warm-gray-02); border-color:var(--jfp-warm-gray-01); }
.empty { color:var(--fg-secondary); font-style:italic; font-family:var(--font-serif); padding:24px 4px; }
.detail h2 { font-family:var(--font-sans); font-size:var(--text-lg); font-weight:600; letter-spacing:-0.02em; margin:4px 0 8px; color:var(--fg-primary); }
.detail .sub { color:var(--fg-secondary); font-size:var(--text-xs); margin-bottom:8px; display:flex; flex-wrap:wrap; align-items:center; gap:4px; }
.msg { margin:16px 0; max-width:760px; }
.msg .who { font-family:var(--font-sans); font-size:var(--text-2xs); text-transform:uppercase; letter-spacing:0.16em; font-weight:600; color:var(--fg-secondary); margin-bottom:4px; }
.bubble { padding:12px 16px; border-radius:var(--radius-md); white-space:pre-wrap; word-wrap:break-word; overflow-wrap:anywhere; font-family:var(--font-serif); font-size:var(--text-base); line-height:1.7; color:var(--fg-primary); }
.msg.user .bubble { background:var(--bg-secondary); }
.msg.assistant .bubble { background:var(--bg-muted); }
.t-en { color:var(--jfp-navy); }
.t-en-head { margin-bottom:4px; }
.t-en-text { font-family:var(--font-serif); font-size:var(--text-base); line-height:1.7; color:var(--jfp-navy); white-space:pre-wrap; word-wrap:break-word; overflow-wrap:anywhere; }
.badge { display:inline-block; font-family:var(--font-sans); font-weight:600; font-size:var(--text-2xs); letter-spacing:0.04em; padding:4px 10px; border-radius:var(--radius-pill); }
.b-navy { background:var(--jfp-navy); color:var(--jfp-warm-white); }
.t-original { margin-top:12px; padding-left:12px; border-left:3px solid var(--border-strong); }
.o-label { font-family:var(--font-sans); font-size:var(--text-2xs); text-transform:uppercase; letter-spacing:0.16em; font-weight:600; color:var(--fg-primary); margin-bottom:4px; }
.o-text { font-family:var(--font-serif); font-size:var(--text-sm); line-height:1.7; color:var(--fg-primary); white-space:pre-wrap; word-wrap:break-word; overflow-wrap:anywhere; }
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
  // Stable hash per value so every 'US' / 'English' pill picks the same tint and
  // a reader can line up sessions with the same country or language at a glance.
  function hashOf(seed) {
    var hash = 0;
    for (var i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
  // Pills draw from a small on-system tint ramp (warm-white, greys, plus muted
  // marigold and maroon tints) chosen by the value hash. Deliberately excludes
  // navy (reserved for machine translation) and red (reserved for brand
  // emphasis), so per-value tints never collide with a semantic colour.
  var PILL_TINTS = ['pill-a', 'pill-b', 'pill-c'];
  function pill(kind, value) {
    var tint = PILL_TINTS[hashOf(kind + ':' + value) % PILL_TINTS.length];
    return el('span', 'pill ' + tint, value);
  }
  // Code -> display name so translation markers name the source language in
  // words ('TRANSLATED FROM BENGALI'), never a bare code that reads as a
  // journey-language pill or as "translated INTO". Accepts an already-normalised
  // name too (a non-code key falls through to itself).
  var LANG_NAMES = {
    bn: 'Bengali', es: 'Spanish', ar: 'Arabic', fr: 'French', af: 'Afrikaans',
    ko: 'Korean', hi: 'Hindi', yi: 'Yiddish', he: 'Hebrew', fa: 'Farsi',
    ur: 'Urdu', pt: 'Portuguese', de: 'German', ru: 'Russian', zh: 'Chinese',
    tr: 'Turkish', id: 'Indonesian', it: 'Italian', sw: 'Swahili', th: 'Thai',
    vi: 'Vietnamese'
  };
  function langName(code) {
    if (!code) return '';
    var key = String(code).toLowerCase();
    return LANG_NAMES[key] || String(code);
  }
  // Names a session's detected languages for the card / detail marker, most
  // frequent first, truncating gracefully past three so a mixed session reads
  // 'TRANSLATED FROM AFRIKAANS, ARABIC, YIDDISH +1 more'.
  function languagesLabel(list) {
    var names = [];
    for (var i = 0; i < list.length; i++) names.push(langName(list[i]).toUpperCase());
    if (names.length <= 2) return names.join(', ');
    return names.slice(0, 2).join(', ') + ' +' + (names.length - 2) + ' MORE';
  }
  // The card column is narrow; the detail pane is not. A chip that must not wrap
  // must also not be clipped, so the card summarises ('MACHINE-TRANSLATED . 3
  // LANGUAGES') and the detail header names them.
  function languagesMarker(className, list, compact) {
    var wrap = el('div', className);
    var text;
    if (compact && list.length > 1) {
      text = 'MACHINE-TRANSLATED FROM ' + langName(list[0]).toUpperCase() +
        ' +' + (list.length - 1) + ' MORE';
    } else {
      text = 'MACHINE-TRANSLATED FROM ' + languagesLabel(list);
    }
    var mark = el('span', 'langmark', text);
    mark.title = 'Machine translation \u2014 accuracy is not guaranteed. Detected: ' + languagesLabel(list);
    wrap.appendChild(mark);
    return wrap;
  }
  // Machine translation is additive: the English gloss is the default reading
  // path (navy = informational/secondary source), and the original is always
  // rendered in full directly beneath it, never truncated, never hidden.
  // dir='ltr' pins English; dir='auto' lets the browser lay out RTL originals
  // (Arabic/Hebrew/Farsi) correctly while keeping LTR scripts LTR.
  function appendTranslation(container, original, english, code) {
    var name = langName(code);
    var enWrap = el('div', 't-en');
    enWrap.setAttribute('dir', 'ltr');
    var head = el('div', 't-en-head');
    var label = name ? ('MACHINE-TRANSLATED FROM ' + name.toUpperCase()) : 'MACHINE-TRANSLATED';
    var badge = el('span', 'badge b-navy', label);
    badge.setAttribute('title', 'Machine translation \\u2014 accuracy is not guaranteed; the original is shown below.');
    head.appendChild(badge);
    enWrap.appendChild(head);
    enWrap.appendChild(el('div', 't-en-text', english));
    container.appendChild(enWrap);
    var orig = el('div', 't-original');
    orig.appendChild(el('div', 'o-label', 'Original'));
    var otext = el('div', 'o-text', original);
    otext.setAttribute('dir', 'auto');
    orig.appendChild(otext);
    container.appendChild(orig);
  }
  // language + country as coloured pills; message count (and null-session) stay
  // as plain muted text after them.
  function buildMeta(session) {
    var sub = el('div', 'sub');
    // The pill shows the normalised journey language ('English'); the raw
    // configured value ('Spanish, Latin American') goes in the title so 'en' and
    // 'English' no longer split, while the exact source stays one hover away.
    var journeyLang = session.languageLabel || session.language;
    if (journeyLang) {
      // 'Journey:' is on the face, not in a tooltip. Without it a card reading
      // 'English' above 'TRANSLATED FROM YIDDISH, AFRIKAANS' is a contradiction:
      // the pill is the journey's configured language, never what was typed.
      var langPill = pill('lang', 'Journey: ' + journeyLang);
      var rawNote = session.language && session.language !== journeyLang
        ? (session.language + ' \\u2014 ')
        : '';
      langPill.title = rawNote + 'journey language, not the language the user typed';
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
    host.appendChild(el('div', 'jfp-eyebrow', 'Jesus Film Project'));
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
    if (summary.translationAvailable && summary.translatedMessageCount > 0) {
      var langs = Array.isArray(summary.sourceLanguages) ? summary.sourceLanguages : [];
      var count = summary.translatedMessageCount;
      var note = el('div', 'note note-translation');
      var line = el('div', 'note-line');
      line.appendChild(el('strong', null, String(count) + ' message' + (count === 1 ? '' : 's')));
      var names = [];
      for (var li = 0; li < langs.length; li++) names.push(langName(langs[li]));
      var langText = langs.length + ' language' + (langs.length === 1 ? '' : 's');
      var tail = ' machine-translated to English from ' + langText;
      if (names.length > 0) tail += ' (' + names.join(', ') + ')';
      tail += '. Accuracy is not guaranteed \\u2014 the original is shown beneath every translation, in full in the conversation view.';
      line.appendChild(document.createTextNode(tail));
      note.appendChild(line);
      var legend = el('div', 'legend');
      var lt = el('span', 'legend-item');
      lt.appendChild(el('span', 'swatch ink-translated'));
      lt.appendChild(el('span', 'legend-sample ink-translated-text', 'English (machine translation)'));
      var lo = el('span', 'legend-item');
      lo.appendChild(el('span', 'swatch ink-original'));
      lo.appendChild(el('span', 'legend-sample ink-original-text', 'Original message'));
      legend.appendChild(lt);
      legend.appendChild(lo);
      note.appendChild(legend);
      host.appendChild(note);
    }
  }

  function renderFacetGroup(host, title, items, hint) {
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
    if (hint) header.title = title + ' \u2014 ' + hint;
    host.appendChild(header);
    header.addEventListener('click', function () {
      expandedGroups[title] = !expanded;
      renderFacets();
    });

    if (!expanded) return;
    // 'Language Typed' and 'Journey Language' list overlapping values, so the
    // difference between them has to be legible at the point of use — not only
    // in the paragraph above, and never behind a hover.
    if (hint) host.appendChild(el('div', 'group-hint', hint));
    for (var i = 0; i < items.length; i++) {
      (function (facet) {
        var row = el('div', 'facet' + (selected[facet.key] ? ' active' : ''));
        var label = el('span', 'l');
        if (facet.labelEnglish) {
          // English gloss is the primary label; a navy dot (decoded by the
          // legend at the top of the rail) marks it as machine-translated so no
          // hover is needed, and the original term sits beside it in the
          // recessive treatment so the source is never a click away.
          label.appendChild(el('span', 'facet-tmark'));
          label.appendChild(el('span', 'facet-gloss', facet.labelEnglish));
          var term = el('span', 'facet-original', facet.label);
          term.setAttribute('dir', 'auto');
          label.appendChild(term);
          row.setAttribute('title', 'Machine-translated keyword \\u2014 original term: ' + facet.label);
        } else {
          label.textContent = facet.label;
        }
        row.appendChild(label);
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
    host.appendChild(el('div', 'facet-legend', '\u201cLanguage Typed\u201d is what people wrote. \u201cJourney Language\u201d is the journey\u2019s configured language \u2014 the two often differ.'));
    var countries = [];
    var languages = [];
    var typed = [];
    var themes = [];
    var keywords = [];
    var hasGloss = false;
    for (var i = 0; i < facets.length; i++) {
      if (facets[i].labelEnglish) hasGloss = true;
      if (facets[i].kind === 'country') countries.push(facets[i]);
      else if (facets[i].kind === 'language') languages.push(facets[i]);
      else if (facets[i].kind === 'typedLanguage') typed.push(facets[i]);
      else if (facets[i].kind === 'theme') themes.push(facets[i]);
      else keywords.push(facets[i]);
    }
    if (hasGloss) {
      var legend = el('div', 'facet-legend');
      legend.appendChild(el('span', 'facet-tmark'));
      legend.appendChild(document.createTextNode('Navy terms are machine-translated \\u2014 the original term follows.'));
      host.appendChild(legend);
    }
    renderFacetGroup(host, 'Country', countries);
    // Two language facets, deliberately. The journey's configured language and
    // the language people actually typed disagree for 12% of sessions; naming
    // both makes 'Journey: English' above 'MACHINE-TRANSLATED FROM YIDDISH'
    // read as a fact rather than a contradiction.
    renderFacetGroup(host, 'Language Typed', typed, 'what people wrote');
    renderFacetGroup(host, 'Journey Language', languages, 'how the journey was configured');
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
        // Name every language actually detected in the session's messages, so a
        // mixed session under an 'English' journey pill is not read as English.
        if (session.translatedLanguages && session.translatedLanguages.length > 0) {
        }
        var preview = el('div', 'preview');
        if (session.firstUserMessageEnglish) {
          // The navy badge is a per-message label. It may ONLY sit above text a
          // machine actually wrote — above a human-typed English preview it
          // would brand that human's words as machine output.
          preview.appendChild(
            languagesMarker('card-langs', [session.sourceLanguage], false)
          );
          // English preview is the default reading path (navy); the original
          // follows beneath, cued by the same uppercase ORIGINAL label the
          // conversation view uses so the two lines are never confused.
          var en = el('div', 'preview-en', session.firstUserMessageEnglish);
          en.setAttribute('dir', 'ltr');
          preview.appendChild(en);
          var orig = el('div', 'preview-original');
          orig.setAttribute('dir', 'auto');
          orig.appendChild(el('span', 'o-cue', 'Original'));
          orig.appendChild(document.createTextNode(session.firstUserMessage));
          preview.appendChild(orig);
        } else {
          preview.appendChild(el('div', 'preview-line', session.firstUserMessage || '(no user text)'));
        }
        card.appendChild(preview);
        // Session-level fact, in a different register from the per-message
        // badge: it describes the conversation, never the preview line above it.
        // Skipped when the preview's own badge already says the same thing.
        var langs = session.translatedLanguages || [];
        var previewCovers = session.sourceLanguage && langs.length === 1 &&
          langs[0] === session.sourceLanguage;
        if (langs.length > 0 && !previewCovers) {
          card.appendChild(el('div', 'card-summary',
            'Conversation contains machine-translated ' + languagesLabel(langs).toLowerCase()));
        }
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
    if (session.translatedLanguages && session.translatedLanguages.length > 0) {
      host.appendChild(languagesMarker('detail-langs', session.translatedLanguages, false));
    }
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
      var bubble = el('div', 'bubble');
      if (msg.textEnglish) {
        appendTranslation(bubble, msg.text, msg.textEnglish, msg.sourceLanguage);
      } else {
        // English source passes through untouched: no chip, no second block.
        bubble.textContent = msg.text;
      }
      wrap.appendChild(bubble);
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
