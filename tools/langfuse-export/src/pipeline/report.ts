// Assemble the HTML report. All figures come from ReportStats (code-computed);
// all user-attributed excerpt TEXT is rendered verbatim from the sanitised
// records here in code. The LLM contributes only theme labels + groupings
// (ThemeSynthesis). If themes are absent (LLM failed), the report still
// renders stats + a flat verbatim sample with a visible degradation note.
//
// Cost figures are computed but deliberately NOT rendered — we cannot yet
// confirm Langfuse's per-model pricing tables match our gateway billing,
// so we omit them from the reviewer-facing report.

import { firstUserMessage } from './normalize'
import type {
  RegionStats,
  ReportStats,
  SanitisedConversation,
  ThemeSynthesis
} from '../types'

const MAX_EXCERPTS_PER_THEME = 3
const MAX_FLAT_EXCERPTS = 15
// Hard ceiling on user-message text in the rendered report. Defends against
// the garbage-input case (long unbroken strings like `asdfasdf...`) so the
// DOM stays bounded even when CSS clamping is unavailable (print, screen
// readers, plain-text scrapers). 200 chars comfortably fits ~2-3 natural
// lines in the question column; the CSS line-clamp on `.clamp` is the
// secondary visual cap.
const MAX_DISPLAY_CHARS = 200

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncate(text: string): string {
  if (text.length <= MAX_DISPLAY_CHARS) return text
  // Trim trailing whitespace before appending the ellipsis so the marker
  // sits flush against the last visible character.
  return `${text.slice(0, MAX_DISPLAY_CHARS).trimEnd()}…`
}

// Wrap a user-supplied message in the line-clamp container so the rendered
// HTML caps both width (word-break inside the cell) and height (line-clamp
// to 3 lines + ellipsis). Truncation runs first so even an unstyled fallback
// (e.g. plain text export) stays short.
function displayMessage(message: string): string {
  return `<div class="clamp">${escapeHtml(truncate(message))}</div>`
}

function pct(share: number): string {
  return `${(share * 100).toFixed(1)}%`
}

function kvRows(record: Record<string, number>): string {
  const entries = Object.entries(record).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )
  if (entries.length === 0) return '<tr><td colspan="2"><em>none</em></td></tr>'
  return entries
    .map(
      ([key, value]) =>
        `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(String(value))}</td></tr>`
    )
    .join('')
}

// Compact "NZ ×5 · US ×2" — used for per-theme region breakdowns. Sorted by
// count desc so the dominant geography reads first.
function regionBadgeLine(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )
  if (entries.length === 0) return ''
  return entries
    .map(
      ([country, count]) => `${escapeHtml(country)} &times;${count}`
    )
    .join(' &middot; ')
}

function renderThemes(
  themes: ThemeSynthesis | null,
  byId: Map<string, SanitisedConversation>
): string {
  if (themes == null) {
    return `<p class="note">Thematic grouping unavailable — the synthesis step did not complete. Stats and verbatim excerpts below are unaffected.</p>${renderFlatSample(byId)}`
  }
  if (themes.themes.length === 0) {
    return '<p class="note">No themes were produced (no eligible conversations).</p>'
  }
  return themes.themes
    .map((theme) => {
      const conversations = theme.sessionIds
        .map((id) => byId.get(id))
        .filter(
          (conversation): conversation is SanitisedConversation =>
            conversation != null
        )
      const excerpts = conversations
        .map((conversation) => firstUserMessage(conversation))
        .filter((message) => message.length > 0)
        .slice(0, MAX_EXCERPTS_PER_THEME)
        .map((message) => `<li>${displayMessage(message)}</li>`)
        .join('')
      // Per-theme region breakdown — deterministic, no LLM. Lets a reader
      // see "salvation is asked across NZ + US" without a second synthesis
      // pass. 'unknown' covers conversations whose trace lacked a country.
      const regionCounts: Record<string, number> = {}
      for (const conversation of conversations) {
        const country =
          conversation.ipCountry != null && conversation.ipCountry.length > 0
            ? conversation.ipCountry.toUpperCase()
            : 'unknown'
        regionCounts[country] = (regionCounts[country] ?? 0) + 1
      }
      const geo = regionBadgeLine(regionCounts)
      const geoLine =
        geo.length > 0 ? `<p class="meta">Geo: ${geo}</p>` : ''
      return `<div class="theme"><h3>${escapeHtml(theme.label)} <span class="count">(${theme.sessionIds.length})</span></h3>${geoLine}<ul>${excerpts}</ul></div>`
    })
    .join('')
}

function renderFlatSample(byId: Map<string, SanitisedConversation>): string {
  const items = Array.from(byId.values())
    .map((conversation) => firstUserMessage(conversation))
    .filter((message) => message.length > 0)
    .slice(0, MAX_FLAT_EXCERPTS)
    .map((message) => `<li>${displayMessage(message)}</li>`)
    .join('')
  return `<ul>${items}</ul>`
}

function topQuestionsRows(stats: ReportStats): string {
  if (stats.topQuestions.length === 0) {
    return '<tr><td colspan="2"><em>none</em></td></tr>'
  }
  return stats.topQuestions
    .map(
      (question) =>
        `<tr><td>${displayMessage(question.message)}</td><td>${question.count}</td></tr>`
    )
    .join('')
}

// One per-region card. Reviewer-facing: drop internal labels (synthetic vs
// real, denominator counts) and keep clean data — totals, multi-turn share,
// long-conversation share, language mix, top questions.
function renderRegionCard(region: RegionStats): string {
  const topRows =
    region.topQuestions.length === 0
      ? '<tr><td colspan="2"><em>none</em></td></tr>'
      : region.topQuestions
          .map(
            (question) =>
              `<tr><td>${displayMessage(question.message)}</td><td>${question.count}</td></tr>`
          )
          .join('')
  return `<div class="region">
  <h3>${escapeHtml(region.country)} <span class="count">(${region.conversations} conversations &middot; ${region.turns} turns)</span></h3>
  <p class="meta">Multi-turn: ${region.multiTurn.count} (${pct(region.multiTurn.share)}). Long (&gt;10 messages): ${region.longConversation.count} (${pct(region.longConversation.share)}).</p>
  <table><tr><th>Language</th><th>Turns</th></tr>${kvRows(region.perLanguage)}</table>
  <table><tr><th>Top question</th><th>Count</th></tr>${topRows}</table>
</div>`
}

function renderRegions(stats: ReportStats): string {
  const entries = Object.values(stats.perRegion)
  if (entries.length === 0) {
    return '<p class="note">No regional signals in this window.</p>'
  }
  return entries.map(renderRegionCard).join('')
}

export function renderReport(
  stats: ReportStats,
  sanitised: SanitisedConversation[],
  themes: ThemeSynthesis | null
): string {
  const byId = new Map<string, SanitisedConversation>()
  for (const conversation of sanitised)
    byId.set(conversation.sessionId, conversation)

  const latency = stats.latencySeconds

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Apologist chat report — ${escapeHtml(stats.windowFrom.slice(0, 10))} to ${escapeHtml(stats.windowTo.slice(0, 10))}</title>
<style>
  body { font: 15px/1.5 -apple-system, system-ui, sans-serif; max-width: 860px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  h1 { font-size: 1.6rem; } h2 { margin-top: 2rem; border-bottom: 1px solid #ddd; padding-bottom: .3rem; } h3 { margin-bottom: .2rem; }
  table { border-collapse: collapse; width: 100%; margin: .5rem 0 1rem; }
  th, td { text-align: left; padding: .35rem .6rem; border-bottom: 1px solid #eee; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; }
  th { background: #f6f6f6; }
  /* User-message text: wrap unbreakable strings + clamp natural prose to 3
     visible lines with a trailing ellipsis. Paired with character-level
     truncation in displayMessage(); the DOM never carries the full giant
     string in the first place. overflow-wrap: anywhere is what lets the
     table-layout: auto algorithm shrink a cell whose content has no normal
     break opportunities (long 'asdfasdf...' strings). */
  .clamp { display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; overflow-wrap: anywhere; word-break: break-word; }
  .meta { color: #666; font-size: .85rem; }
  .summary { background: #f6f6f6; border: 1px solid #ddd; padding: .8rem 1rem; border-radius: 6px; margin: 1rem 0; }
  .note { background: #f0f4ff; border: 1px solid #c5d4ff; padding: .6rem 1rem; border-radius: 6px; }
  .theme { margin: .8rem 0; } .count { color: #888; font-weight: normal; }
  .region { margin: 1.2rem 0; padding: .8rem 1rem; border: 1px solid #e6e6e6; border-radius: 6px; background: #fafafa; }
  .region h3 { margin-top: 0; }
  ul { margin: .2rem 0 .8rem; } li { margin: .15rem 0; }
</style>
</head>
<body>
<h1>Apologist chat report</h1>
<p class="meta">Window ${escapeHtml(stats.windowFrom)} → ${escapeHtml(stats.windowTo)} · generated ${escapeHtml(stats.generatedAt)}</p>

<div class="summary">
  ${stats.totalConversations} conversations across ${stats.totalTurns} turns.
  Single-turn share: ${pct(stats.singleTurn.share)}.
  Top-questions computed over ${stats.topQuestionsIncludedConversations} multi-turn conversations.
</div>

<h2>Usage</h2>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Total conversations</td><td>${stats.totalConversations}</td></tr>
  <tr><td>Total turns</td><td>${stats.totalTurns}</td></tr>
  <tr><td>Input tokens</td><td>${stats.totalInputTokens}</td></tr>
  <tr><td>Output tokens</td><td>${stats.totalOutputTokens}</td></tr>
  <tr><td>Latency p50 / p95 / p99 / max (s)</td><td>${latency.p50.toFixed(3)} / ${latency.p95.toFixed(3)} / ${latency.p99.toFixed(3)} / ${latency.max.toFixed(3)} (n=${latency.count})</td></tr>
</table>

<h2>By model</h2>
<table><tr><th>Model</th><th>Turns</th></tr>${kvRows(stats.perModel)}</table>

<h2>By day</h2>
<table><tr><th>Day</th><th>Turns</th></tr>${kvRows(stats.perDay)}</table>

<h2>Conversation length</h2>
<table><tr><th>Turns</th><th>Conversations</th></tr>${kvRows(stats.conversationLengthHistogram)}</table>

<h2>By region</h2>
${renderRegions(stats)}

<h2>Top questions</h2>
<p class="meta">Multi-turn conversations only; normalised and de-duplicated.</p>
<table><tr><th>Question</th><th>Count</th></tr>${topQuestionsRows(stats)}</table>

<h2>AI-grouped themes</h2>
<p class="meta">Labels are machine-generated; quotes are shown verbatim.</p>
${renderThemes(themes, byId)}

</body>
</html>
`
}
