// Serialise sanitised conversations into the lossless explorer dataset
// (NES-1719). Pure: no IO, no LLM. Nothing here is collapsed or sampled — the
// dataset *is* the corpus: every session with its full ordered message list,
// the curated facet vocabulary, and (when available) per-session LLM themes.

import { firstUserMessage } from './normalize'
import type { FacetExtraction } from './facets'
import type {
  DatasetMessage,
  DatasetSession,
  DateWindow,
  Facet,
  InsightsDataset,
  SanitisedConversation,
  ThemeSynthesis
} from '../types'

// Invert the LLM's theme->sessionIds grouping into per-session theme labels.
// Pure; deterministic. A session absent from every theme maps to []. Labels
// are de-duplicated and kept in first-seen order per session.
export function invertThemes(synthesis: ThemeSynthesis): Map<string, string[]> {
  const bySession = new Map<string, string[]>()
  for (const theme of synthesis.themes) {
    for (const sessionId of theme.sessionIds) {
      const existing = bySession.get(sessionId)
      if (existing == null) {
        bySession.set(sessionId, [theme.label])
      } else if (!existing.includes(theme.label)) {
        existing.push(theme.label)
      }
    }
  }
  return bySession
}

// Flatten a conversation's turns into ordered user/assistant messages. Empty
// strings (e.g. an unparsed assistant reply) are dropped so the viewer never
// renders blank bubbles, but ordering is preserved — a reader follows the
// real exchange from start to finish.
function toMessages(conversation: SanitisedConversation): DatasetMessage[] {
  const messages: DatasetMessage[] = []
  for (const turn of conversation.turns) {
    if (turn.userMessage.trim().length > 0) {
      messages.push({
        role: 'user',
        text: turn.userMessage,
        startTime: turn.startTime,
        model: turn.model
      })
    }
    if (turn.assistantReply.trim().length > 0) {
      messages.push({
        role: 'assistant',
        text: turn.assistantReply,
        startTime: turn.startTime,
        model: turn.model
      })
    }
  }
  return messages
}

function conversationStartTime(conversation: SanitisedConversation): string {
  return conversation.turns[0]?.startTime ?? ''
}

export function buildDataset(
  conversations: SanitisedConversation[],
  window: DateWindow,
  facets: FacetExtraction,
  themesBySession: ReadonlyMap<string, string[]> | null,
  excludedTurnCount: number,
  generatedAt: string
): InsightsDataset {
  // Stable order -> stable anonymous labels (Session 001, 002, ...).
  const ordered = conversations.slice().sort((a, b) => {
    const byTime = conversationStartTime(a).localeCompare(
      conversationStartTime(b)
    )
    return byTime !== 0 ? byTime : a.sessionId.localeCompare(b.sessionId)
  })

  const themeCounts = new Map<string, number>()
  let totalMessages = 0
  let nullSessionCount = 0
  let singleTurnCount = 0

  const sessions: DatasetSession[] = ordered.map((conversation, index) => {
    const messages = toMessages(conversation)
    totalMessages += messages.length
    if (conversation.synthetic) nullSessionCount += 1
    if (conversation.turns.length === 1) singleTurnCount += 1

    const themes = themesBySession?.get(conversation.sessionId) ?? []
    for (const label of themes) {
      themeCounts.set(label, (themeCounts.get(label) ?? 0) + 1)
    }

    const themeKeys = themes.map((label) => `theme:${label}`)
    const countryKeys =
      facets.sessionCountryKeys.get(conversation.sessionId) ?? []
    const languageKeys =
      facets.sessionLanguageKeys.get(conversation.sessionId) ?? []
    const keywordKeys =
      facets.sessionKeywordKeys.get(conversation.sessionId) ?? []

    return {
      id: conversation.sessionId,
      label: `Session ${String(index + 1).padStart(3, '0')}`,
      synthetic: conversation.synthetic,
      language: conversation.language,
      ipCountry: conversation.ipCountry,
      journeyId: conversation.journeyId,
      messageCount: messages.length,
      firstUserMessage: firstUserMessage(conversation),
      startTime: conversationStartTime(conversation),
      themes,
      facetKeys: [
        ...countryKeys,
        ...languageKeys,
        ...themeKeys,
        ...keywordKeys
      ],
      messages
    }
  })

  const themeFacets: Facet[] = Array.from(themeCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({
      key: `theme:${label}`,
      label,
      kind: 'theme',
      count
    }))

  return {
    summary: {
      windowFrom: window.from.toISOString(),
      windowTo: window.to.toISOString(),
      generatedAt,
      totalSessions: sessions.length,
      totalMessages,
      nullSessionCount,
      singleTurnCount,
      excludedLoadTestTurns: excludedTurnCount,
      suppressedKeywordCount: facets.suppressedKeywordCount,
      themesAvailable: themesBySession != null
    },
    facets: [
      ...facets.countryFacets,
      ...facets.languageFacets,
      ...themeFacets,
      ...facets.keywordFacets
    ],
    sessions
  }
}
