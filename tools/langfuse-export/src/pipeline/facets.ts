// Deterministic keyword facet extraction (NES-1719). Pure: no IO, no LLM.
//
// The explorer lets a viewer filter by *selecting* from a curated facet set —
// never by typing free text — so they can only filter on terms that actually
// exist in the corpus. This module derives that vocabulary from the sanitised
// user messages, treating each session as one document and applying two
// suppression rules so the facets stay useful:
//
//   - Over-common terms are held back. A term that appears in nearly every
//     session ("god", "jesus" in an apologist chat) matches everything and is
//     useless as a filter, so terms whose document frequency exceeds
//     MAX_DF_SHARE of the corpus are dropped (and counted, so the viewer can
//     surface how many were suppressed).
//   - Too-rare terms are dropped. A term in a single session can't partition
//     anything, so terms below MIN_DF are excluded as noise.
//
// What survives is ranked by coverage and capped, giving a tractable set of
// distinctive facets. Frequency-threshold suppression (not LLM-judged) is the
// chosen rule from the ticket's open question — deterministic and offline.

import type { Facet, SanitisedConversation } from '../types'

export interface FacetExtractionOptions {
  minTermLength?: number
  minDocumentFrequency?: number
  maxDocumentFrequencyShare?: number
  maxFacets?: number
}

export interface FacetExtraction {
  // Keyword facets only — theme facets are added later by the dataset builder.
  keywordFacets: Facet[]
  // sessionId -> the keyword facet keys that session matches (drives filtering).
  sessionKeywordKeys: Map<string, string[]>
  // Distinct terms held back because they were over-common (the headline
  // "N keywords suppressed" figure shown in the viewer).
  suppressedKeywordCount: number
}

const DEFAULT_MIN_TERM_LENGTH = 3
const DEFAULT_MIN_DOCUMENT_FREQUENCY = 2
const DEFAULT_MAX_DOCUMENT_FREQUENCY_SHARE = 0.5
const DEFAULT_MAX_FACETS = 60

// English filler + chat noise. The over-common rule already removes domain
// terms that saturate the corpus (e.g. "god"), so this list only needs to
// cover grammatical glue and generic chat words that aren't topical filters.
const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'are',
  'but',
  'not',
  'you',
  'your',
  'yours',
  'with',
  'this',
  'that',
  'have',
  'has',
  'had',
  'was',
  'were',
  'will',
  'would',
  'can',
  'could',
  'should',
  'what',
  'when',
  'where',
  'why',
  'how',
  'who',
  'which',
  'whom',
  'about',
  'into',
  'from',
  'they',
  'them',
  'their',
  'there',
  'here',
  'then',
  'than',
  'some',
  'any',
  'all',
  'its',
  'our',
  'his',
  'her',
  'him',
  'she',
  'its',
  'out',
  'off',
  'over',
  'under',
  'also',
  'just',
  'very',
  'more',
  'most',
  'much',
  'many',
  'such',
  'only',
  'even',
  'ever',
  'because',
  'been',
  'being',
  'does',
  'did',
  'done',
  'doing',
  'get',
  'got',
  'gets',
  'let',
  'lets',
  'like',
  'want',
  'need',
  'know',
  'think',
  'tell',
  'say',
  'said',
  'see',
  'one',
  'two',
  'three',
  'yes',
  'yeah',
  'okay',
  'thanks',
  'thank',
  'please',
  'hello',
  'hey',
  'sure',
  'really',
  'maybe',
  'well',
  'good',
  'mean',
  'make',
  'made',
  'use',
  'used',
  'using',
  'able',
  'still',
  'every',
  'each',
  'both',
  'these',
  'those',
  'were',
  'isnt',
  'dont',
  'doesnt',
  'cant',
  'wont',
  'im',
  'ive',
  'id',
  'youre',
  'theyre',
  'its',
  'thats',
  'whats',
  'hes',
  'shes',
  'were',
  'were'
])

// Tokenise to lowercase Unicode-letter runs. Punctuation, digits, and markup
// fall away, so "Jesus' resurrection?" -> ["jesus", "resurrection"].
function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/\p{L}+/gu)
  return matches ?? []
}

// The distinct, filtered terms a single session contributes (one vote per
// term per session, so a chatty session can't inflate document frequency).
function sessionTerms(
  conversation: SanitisedConversation,
  minTermLength: number
): Set<string> {
  const terms = new Set<string>()
  for (const turn of conversation.turns) {
    for (const token of tokenize(turn.userMessage)) {
      if (token.length < minTermLength) continue
      if (STOPWORDS.has(token)) continue
      terms.add(token)
    }
  }
  return terms
}

export function buildFacets(
  conversations: SanitisedConversation[],
  options: FacetExtractionOptions = {}
): FacetExtraction {
  const minTermLength = options.minTermLength ?? DEFAULT_MIN_TERM_LENGTH
  const minDf = options.minDocumentFrequency ?? DEFAULT_MIN_DOCUMENT_FREQUENCY
  const maxDfShare =
    options.maxDocumentFrequencyShare ?? DEFAULT_MAX_DOCUMENT_FREQUENCY_SHARE
  const maxFacets = options.maxFacets ?? DEFAULT_MAX_FACETS

  const totalSessions = conversations.length
  if (totalSessions === 0) {
    return {
      keywordFacets: [],
      sessionKeywordKeys: new Map(),
      suppressedKeywordCount: 0
    }
  }

  // Per-session term sets (computed once) + global document frequency.
  const termsBySession = new Map<string, Set<string>>()
  const documentFrequency = new Map<string, number>()
  for (const conversation of conversations) {
    const terms = sessionTerms(conversation, minTermLength)
    termsBySession.set(conversation.sessionId, terms)
    for (const term of terms) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1)
    }
  }

  const maxDfCount = maxDfShare * totalSessions
  let suppressedKeywordCount = 0
  const kept: Array<{ term: string; df: number }> = []
  for (const [term, df] of documentFrequency) {
    if (df < minDf) continue // too rare to partition anything
    if (df > maxDfCount) {
      // Over-common: matches nearly everything, useless as a filter.
      suppressedKeywordCount += 1
      continue
    }
    kept.push({ term, df })
  }

  // Rank by coverage (df desc), break ties alphabetically for determinism,
  // then cap so the facet panel stays tractable on a month-scale corpus.
  kept.sort((a, b) => b.df - a.df || a.term.localeCompare(b.term))
  const selected = kept.slice(0, maxFacets)
  const selectedTerms = new Set(selected.map((entry) => entry.term))

  const keyOf = (term: string): string => `keyword:${term}`
  const keywordFacets: Facet[] = selected.map((entry) => ({
    key: keyOf(entry.term),
    label: entry.term,
    kind: 'keyword',
    count: entry.df
  }))

  const sessionKeywordKeys = new Map<string, string[]>()
  for (const conversation of conversations) {
    const terms = termsBySession.get(conversation.sessionId) ?? new Set()
    const keys: string[] = []
    for (const term of terms) {
      if (selectedTerms.has(term)) keys.push(keyOf(term))
    }
    keys.sort()
    sessionKeywordKeys.set(conversation.sessionId, keys)
  }

  return { keywordFacets, sessionKeywordKeys, suppressedKeywordCount }
}

export {
  DEFAULT_MAX_FACETS,
  DEFAULT_MAX_DOCUMENT_FREQUENCY_SHARE,
  DEFAULT_MIN_DOCUMENT_FREQUENCY
}
