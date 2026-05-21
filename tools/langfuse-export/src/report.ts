// Assemble the HTML report. All figures come from ReportStats (code-computed);
// all user-attributed excerpt TEXT is rendered verbatim from the sanitised
// records here in code. The LLM contributes only theme labels + groupings
// (ThemeSynthesis). If themes are absent (LLM failed), the report still
// renders stats + a flat verbatim sample with a visible degradation note.

import type {
  ReportStats,
  SanitisedConversation,
  ThemeSynthesis
} from './types'

const MAX_EXCERPTS_PER_THEME = 3
const MAX_FLAT_EXCERPTS = 15

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function pct(share: number): string {
  return `${(share * 100).toFixed(1)}%`
}

function usd(value: number): string {
  return `$${value.toFixed(4)}`
}

function firstUserMessage(conversation: SanitisedConversation): string {
  for (const turn of conversation.turns) {
    if (turn.userMessage.trim().length > 0) return turn.userMessage.trim()
  }
  return ''
}

function kvRows(
  record: Record<string, number>,
  formatter: (value: number) => string = (value) => String(value)
): string {
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (entries.length === 0) return '<tr><td colspan="2"><em>none</em></td></tr>'
  return entries
    .map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(formatter(value))}</td></tr>`)
    .join('')
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
      const excerpts = theme.sessionIds
        .map((id) => byId.get(id))
        .filter((conversation): conversation is SanitisedConversation => conversation != null)
        .map((conversation) => firstUserMessage(conversation))
        .filter((message) => message.length > 0)
        .slice(0, MAX_EXCERPTS_PER_THEME)
        .map((message) => `<li>${escapeHtml(message)}</li>`)
        .join('')
      return `<div class="theme"><h3>${escapeHtml(theme.label)} <span class="count">(${theme.sessionIds.length})</span></h3><ul>${excerpts}</ul></div>`
    })
    .join('')
}

function renderFlatSample(byId: Map<string, SanitisedConversation>): string {
  const items = Array.from(byId.values())
    .map((conversation) => firstUserMessage(conversation))
    .filter((message) => message.length > 0)
    .slice(0, MAX_FLAT_EXCERPTS)
    .map((message) => `<li>${escapeHtml(message)}</li>`)
    .join('')
  return `<ul>${items}</ul>`
}

function topQuestionsRows(stats: ReportStats): string {
  if (stats.topQuestions.length === 0) {
    return '<tr><td colspan="2"><em>none (no real-session, multi-turn conversations)</em></td></tr>'
  }
  return stats.topQuestions
    .map((question) => `<tr><td>${escapeHtml(question.message)}</td><td>${question.count}</td></tr>`)
    .join('')
}

export function renderReport(
  stats: ReportStats,
  sanitised: SanitisedConversation[],
  themes: ThemeSynthesis | null
): string {
  const byId = new Map<string, SanitisedConversation>()
  for (const conversation of sanitised) byId.set(conversation.sessionId, conversation)

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
  th, td { text-align: left; padding: .35rem .6rem; border-bottom: 1px solid #eee; vertical-align: top; }
  th { background: #f6f6f6; }
  .meta { color: #666; font-size: .85rem; }
  .banner { background: #fff8e1; border: 1px solid #ffe082; padding: .8rem 1rem; border-radius: 6px; margin: 1rem 0; }
  .note { background: #f0f4ff; border: 1px solid #c5d4ff; padding: .6rem 1rem; border-radius: 6px; }
  .theme { margin: .8rem 0; } .count { color: #888; font-weight: normal; }
  ul { margin: .2rem 0 .8rem; } li { margin: .15rem 0; }
</style>
</head>
<body>
<h1>Apologist chat report</h1>
<p class="meta">Window ${escapeHtml(stats.windowFrom)} → ${escapeHtml(stats.windowTo)} · generated ${escapeHtml(stats.generatedAt)}</p>

<div class="banner">
  <strong>Data quality.</strong>
  ${stats.totalConversations} conversations, ${stats.totalTurns} turns.
  Null-session/orphan conversations: ${stats.nullSession.count} (${pct(stats.nullSession.share)}).
  Single-turn conversations: ${stats.singleTurn.count} (${pct(stats.singleTurn.share)}).
  Turns excluded as load-test: ${stats.excludedLoadTest.count}.
  Top-questions computed over ${stats.topQuestionsIncludedConversations} real-session multi-turn conversations
  (${stats.topQuestionsExcludedConversations} excluded). A high null-session or single-turn share means
  conversation grouping is weak (see NES-1688 / NES-1616).
</div>

<h2>Usage</h2>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Total conversations</td><td>${stats.totalConversations}</td></tr>
  <tr><td>Total turns</td><td>${stats.totalTurns}</td></tr>
  <tr><td>Total cost</td><td>${usd(stats.totalCostUsd)}</td></tr>
  <tr><td>Input tokens</td><td>${stats.totalInputTokens}</td></tr>
  <tr><td>Output tokens</td><td>${stats.totalOutputTokens}</td></tr>
  <tr><td>Latency p50 / p95 / p99 / max (s)</td><td>${latency.p50.toFixed(3)} / ${latency.p95.toFixed(3)} / ${latency.p99.toFixed(3)} / ${latency.max.toFixed(3)} (n=${latency.count})</td></tr>
</table>

<h2>By model</h2>
<table><tr><th>Model</th><th>Turns</th></tr>${kvRows(stats.perModel)}</table>

<h2>By day</h2>
<table><tr><th>Day</th><th>Turns</th></tr>${kvRows(stats.perDay)}</table>

<h2>Cost by day</h2>
<table><tr><th>Day</th><th>Cost</th></tr>${kvRows(stats.costPerDayUsd, usd)}</table>

<h2>Conversation length</h2>
<table><tr><th>Turns</th><th>Conversations</th></tr>${kvRows(stats.conversationLengthHistogram)}</table>

<h2>Top questions</h2>
<p class="meta">Real-session, multi-turn conversations only; normalised + de-duplicated.</p>
<table><tr><th>Question</th><th>Count</th></tr>${topQuestionsRows(stats)}</table>

<h2>AI-grouped themes <span class="count">(labels machine-generated; quotes verbatim)</span></h2>
${renderThemes(themes, byId)}

</body>
</html>
`
}
