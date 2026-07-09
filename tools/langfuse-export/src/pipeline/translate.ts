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

// Script is decidable; the model's language label is not. It tagged an Arabic
// message `es`, which rendered as "MACHINE-TRANSLATED FROM SPANISH" above
// visibly Arabic text. A claimed language whose script contradicts the text is
// a claim we must not surface: the translation may still be right, but the
// attribution is provably wrong.
const EXPECTED_SCRIPT: Record<string, string> = {
  // Latin
  af: 'Latin',
  de: 'Latin',
  en: 'Latin',
  es: 'Latin',
  fr: 'Latin',
  id: 'Latin',
  it: 'Latin',
  nl: 'Latin',
  pt: 'Latin',
  sw: 'Latin',
  tr: 'Latin',
  vi: 'Latin',
  // Everything else, by the script it is actually written in.
  ar: 'Arabic',
  fa: 'Arabic',
  ps: 'Arabic',
  ur: 'Arabic',
  bn: 'Bengali',
  he: 'Hebrew',
  yi: 'Hebrew',
  hi: 'Devanagari',
  mr: 'Devanagari',
  ne: 'Devanagari',
  ko: 'Hangul',
  ja: 'Hiragana',
  ru: 'Cyrillic',
  uk: 'Cyrillic',
  bg: 'Cyrillic',
  sr: 'Cyrillic',
  el: 'Greek',
  th: 'Thai'
}

const SCRIPT_PATTERNS: Array<[string, RegExp]> = [
  ['Latin', /\p{Script=Latin}/u],
  ['Arabic', /\p{Script=Arabic}/u],
  ['Bengali', /\p{Script=Bengali}/u],
  ['Hebrew', /\p{Script=Hebrew}/u],
  ['Devanagari', /\p{Script=Devanagari}/u],
  ['Hangul', /\p{Script=Hangul}/u],
  ['Hiragana', /\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Han}/u],
  ['Cyrillic', /\p{Script=Cyrillic}/u],
  ['Greek', /\p{Script=Greek}/u],
  ['Thai', /\p{Script=Thai}/u]
]

// The script the majority of `text`'s letters are written in, or null when the
// text carries no letters at all.
export function dominantScript(text: string): string | null {
  let best: string | null = null
  let bestCount = 0
  for (const [name, pattern] of SCRIPT_PATTERNS) {
    const global = new RegExp(pattern.source, 'gu')
    const count = text.match(global)?.length ?? 0
    if (count > bestCount) {
      bestCount = count
      best = name
    }
  }
  return bestCount === 0 ? null : best
}

// False only when we can PROVE the label wrong. An unknown language code, or
// text with no letters, is not disproof — say nothing rather than guess.
export function scriptContradictsLanguage(
  text: string,
  language: string
): boolean {
  const expected = EXPECTED_SCRIPT[language.trim().toLowerCase()]
  if (expected == null) return false
  const actual = dominantScript(text)
  if (actual == null) return false
  return actual !== expected
}
