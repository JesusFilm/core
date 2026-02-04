import { LanguageClass, LanguageProfile } from './types'

export const languageProfileVersion = 'v1' as const

export const LANGUAGE_PROFILES: Record<LanguageClass, LanguageProfile> = {
  LTR: {
    targetCPS: 13.5,
    maxCPS: 17,
    targetCPL: 32,
    maxCPL: 38,
    maxLines: 2,
    minDuration: 1.3,
    maxDuration: 6.0,
    startOffsetMs: 150,
    endOffsetMs: 50,
    minGapMs: 50,
    languageProfileVersion
  },
  RTL: {
    targetCPS: 12,
    maxCPS: 16,
    targetCPL: 28,
    maxCPL: 34,
    maxLines: 2,
    minDuration: 1.5,
    maxDuration: 5.5,
    startOffsetMs: 150,
    endOffsetMs: 50,
    minGapMs: 50,
    languageProfileVersion
  },
  CJK: {
    targetCPS: 8,
    maxCPS: 11,
    targetCPL: 14,
    maxCPL: 18,
    maxLines: 1,
    minDuration: 1.2,
    maxDuration: 4.5,
    startOffsetMs: 150,
    endOffsetMs: 50,
    minGapMs: 50,
    languageProfileVersion
  }
}

export function getProfileForClass(languageClass: LanguageClass): LanguageProfile {
  return LANGUAGE_PROFILES[languageClass]
}
