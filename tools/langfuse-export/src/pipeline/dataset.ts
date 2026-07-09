// Serialise sanitised conversations into the lossless explorer dataset
// (NES-1719). Pure: no IO, no LLM. Nothing here is collapsed or sampled — the
// dataset *is* the corpus: every session with its full ordered message list,
// the curated facet vocabulary, and (when available) per-session LLM themes.

import { isNonContentPhrase, normalizeLanguageLabel } from './facets'
import { firstUserMessage } from './normalize'
import type { FacetExtraction } from './facets'
import type {
  DatasetMessage,
  DatasetSession,
  DateWindow,
  Facet,
  InsightsDataset,
  SanitisedConversation,
  ThemeSynthesis,
  Translation
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

// A "translation" identical to its source is not a translation — the model
// mislabelled the language and echoed the text back (real cases: 'sup' tagged
// es, 'Hum' tagged hi). Rendering a TRANSLATED chip above identical text would
// be worse than rendering nothing, so treat it as untranslated.
function usefulEnglish(
  source: string,
  translation: Translation | undefined
): string | null {
  const english = translation?.english
  if (english == null) return null
  return english.trim() === source.trim() ? null : english
}

// Attach the English translation + detected source language to a message when
// one is available. `text` is NEVER mutated — translation is purely additive,
// and only a lookup that yields a genuine `english` sets the fields; English
// messages are left exactly as they were.
function withTranslation(
  message: DatasetMessage,
  translations: ReadonlyMap<string, Translation> | null
): DatasetMessage {
  const translation = translations?.get(message.text)
  const english = usefulEnglish(message.text, translation)
  if (english == null || translation == null) return message
  return {
    ...message,
    textEnglish: english,
    sourceLanguage: translation.sourceLanguage
  }
}

// Flatten a conversation's turns into ordered user/assistant messages. Empty
// strings (e.g. an unparsed assistant reply) are dropped so the viewer never
// renders blank bubbles, but ordering is preserved — a reader follows the
// real exchange from start to finish.
function toMessages(
  conversation: SanitisedConversation,
  translations: ReadonlyMap<string, Translation> | null
): DatasetMessage[] {
  const messages: DatasetMessage[] = []
  for (const turn of conversation.turns) {
    if (turn.userMessage.trim().length > 0) {
      messages.push(
        withTranslation(
          {
            role: 'user',
            text: turn.userMessage,
            startTime: turn.startTime,
            model: turn.model
          },
          translations
        )
      )
    }
    if (turn.assistantReply.trim().length > 0) {
      messages.push(
        withTranslation(
          {
            role: 'assistant',
            text: turn.assistantReply,
            startTime: turn.startTime,
            model: turn.model
          },
          translations
        )
      )
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
  generatedAt: string,
  // Machine translations keyed by the EXACT original string (NES-1762). Trailing
  // + optional so existing call sites keep working. `null` = no translation pass
  // ran; an empty map = it ran but produced nothing.
  translations: ReadonlyMap<string, Translation> | null = null
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
  let translatedMessageCount = 0
  // Non-'en' source language -> number of translated messages carrying it.
  const sourceLanguageCounts = new Map<string, number>()

  const sessions: DatasetSession[] = ordered.map((conversation, index) => {
    const messages = toMessages(conversation, translations)
    totalMessages += messages.length
    if (conversation.synthetic) nullSessionCount += 1
    if (conversation.turns.length === 1) singleTurnCount += 1

    // Per-session language tally. A session is often NOT monolingual, and its
    // journey language routinely disagrees with what was typed — so the card
    // must state the languages actually found rather than imply one.
    const sessionLanguageCounts = new Map<string, number>()
    for (const message of messages) {
      // A message carries `sourceLanguage` only alongside `textEnglish`, so both
      // being set marks a genuine (non-English) translation.
      if (message.textEnglish != null && message.sourceLanguage != null) {
        translatedMessageCount += 1
        sourceLanguageCounts.set(
          message.sourceLanguage,
          (sourceLanguageCounts.get(message.sourceLanguage) ?? 0) + 1
        )
        sessionLanguageCounts.set(
          message.sourceLanguage,
          (sessionLanguageCounts.get(message.sourceLanguage) ?? 0) + 1
        )
      }
    }
    const translatedLanguages = Array.from(sessionLanguageCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([code]) => code)

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

    const firstMessage = firstUserMessage(conversation)
    // Detected language + English gloss of the first user message (drives the
    // session-card "translated" affordance). sourceLanguage is set whenever the
    // model detected a language; firstUserMessageEnglish only when it translated.
    const firstTranslation = translations?.get(firstMessage)

    return {
      id: conversation.sessionId,
      label: `Session ${String(index + 1).padStart(3, '0')}`,
      synthetic: conversation.synthetic,
      language: conversation.language,
      languageLabel:
        conversation.language == null
          ? undefined
          : normalizeLanguageLabel(conversation.language),
      translatedLanguages,
      ipCountry: conversation.ipCountry,
      journeyId: conversation.journeyId,
      messageCount: messages.length,
      firstUserMessage: firstMessage,
      firstUserMessageEnglish:
        usefulEnglish(firstMessage, firstTranslation) ?? undefined,
      sourceLanguage: firstTranslation?.sourceLanguage,
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

  // Keyword labels are tokenised from raw user text, so a non-English keyword
  // carries an English gloss; `label` (and the filter key) stay the original.
  //
  // The vocabulary was filtered by an English stopword list, which only ever
  // caught English function words. Glossing exposes the rest: `que` -> 'that',
  // `איר` -> 'you'. Suppress those, so a translated keyword must clear the same
  // bar an English one already did. Anything suppressed is counted, not dropped
  // silently.
  let suppressedTranslatedKeywordCount = 0
  const keywordFacets: Facet[] = []
  for (const facet of facets.keywordFacets) {
    const translation = translations?.get(facet.label)
    const english = usefulEnglish(facet.label, translation)
    if (english == null || translation == null) {
      keywordFacets.push(facet)
      continue
    }
    // A single foreign token can gloss to several English words ('to do',
    // 'i can'). Suppress when EVERY word is a stopword — that is still just
    // function words, and a facet rail of them is unreadable.
    if (isNonContentPhrase(english)) {
      suppressedTranslatedKeywordCount += 1
      continue
    }
    keywordFacets.push({
      ...facet,
      // Keyword facets are terms, not sentences — normalise the model's casing
      // ('Hello' -> 'hello') so the gloss sits beside untranslated terms.
      labelEnglish: english.toLowerCase(),
      sourceLanguage: translation.sourceLanguage
    })
  }
  const survivingKeywordKeys = new Set(keywordFacets.map((f) => f.key))
  // Sessions were assembled before suppression, so drop the dead keyword keys —
  // a facetKey with no facet row can never be selected, but leaving it would
  // make dataset.json self-inconsistent for anyone reading it directly.
  if (suppressedTranslatedKeywordCount > 0) {
    for (const session of sessions) {
      session.facetKeys = session.facetKeys.filter(
        (key) => !key.startsWith('keyword:') || survivingKeywordKeys.has(key)
      )
    }
  }

  const sourceLanguages = Array.from(sourceLanguageCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([code]) => code)

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
      themesAvailable: themesBySession != null,
      translationAvailable: translations != null,
      translatedMessageCount,
      suppressedTranslatedKeywordCount,
      sourceLanguages
    },
    facets: [
      ...facets.countryFacets,
      ...facets.languageFacets,
      ...themeFacets,
      ...keywordFacets
    ],
    sessions
  }
}
