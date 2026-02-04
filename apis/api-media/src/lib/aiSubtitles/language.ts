import { LanguageClass } from './types'

export interface ParsedBcp47 {
  tag: string
  language: string
  script?: string
  region?: string
  languageClass: LanguageClass
}

const RTL_SCRIPTS = new Set(['Arab', 'Hebr'])
const CJK_SCRIPTS = new Set(['Hans', 'Hant', 'Hani', 'Kana', 'Jpan', 'Hang', 'Kore'])

const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur'])
const CJK_LANGUAGES = new Set(['zh', 'ja', 'ko'])

function toScriptCase(value: string): string {
  return value.length === 4
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : value
}

export function parseBcp47(tag: string): ParsedBcp47 {
  const cleanTag = tag.trim()
  const parts = cleanTag.split('-').filter(Boolean)
  const language = parts[0]?.toLowerCase() ?? ''
  const script = parts.find((part) => part.length === 4)
  const region = parts.find((part) => part.length === 2 || part.length === 3)

  const scriptNormalized = script != null ? toScriptCase(script) : undefined
  const languageClass = detectLanguageClass(language, scriptNormalized)

  return {
    tag: cleanTag,
    language,
    script: scriptNormalized,
    region,
    languageClass
  }
}

export function detectLanguageClass(
  language: string,
  script?: string
): LanguageClass {
  if (script != null) {
    if (RTL_SCRIPTS.has(script)) return 'RTL'
    if (CJK_SCRIPTS.has(script)) return 'CJK'
  }

  if (RTL_LANGUAGES.has(language)) return 'RTL'
  if (CJK_LANGUAGES.has(language)) return 'CJK'

  return 'LTR'
}
