// Collect the strings that need language detection / translation (NES-1762).
// Pure: no IO, no LLM, no crypto — run.ts hashes and caches; this module only
// decides *what* to translate.
//
// The set is every non-empty user message, every non-empty assistant reply,
// and every keyword facet label. Country/language facet labels are codes (not
// natural language) and theme labels are already English (synthesizeThemes
// forces English), so both are excluded.

import type { FacetExtraction } from './facets'
import type { SanitisedConversation } from '../types'

// Language detection is the model's job, but it gets it wrong: real Bengali
// assistant replies came back tagged `lang:"en"`, and the wrong verdict was
// then cached. Script is decidable without a model — text written mostly in a
// non-Latin script is not English, whatever the model says. This is a floor on
// detection error, not a detector: it says nothing about Latin-script Spanish.
export function cannotBeEnglish(text: string): boolean {
  const letters = text.match(/\p{L}/gu)
  if (letters == null || letters.length === 0) return false
  const latin = text.match(/\p{Script=Latin}/gu)?.length ?? 0
  return latin / letters.length < 0.5
}

export function collectTranslatable(
  conversations: SanitisedConversation[],
  facets: FacetExtraction
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  // Key by the EXACT stored string (dataset.ts looks up translations by the
  // same value), skipping only whitespace-only strings.
  const add = (value: string): void => {
    if (value.trim().length === 0) return
    if (seen.has(value)) return
    seen.add(value)
    result.push(value)
  }

  for (const conversation of conversations) {
    for (const turn of conversation.turns) {
      add(turn.userMessage)
      add(turn.assistantReply)
    }
  }
  for (const facet of facets.keywordFacets) {
    add(facet.label)
  }

  return result
}
