import crypto from 'node:crypto'

import { buildValidatorErrorPrompt, callAiPostProcessor, promptVersion } from './ai'
import { buildFallbackVtt, fallbackVersion } from './fallback'
import { detectLanguageClass, parseBcp47 } from './language'
import { getProfileForClass } from './profiles'
import {
  PostProcessDebugArtifacts,
  PostProcessMetadata,
  PostProcessResult,
  SubtitleAIInput,
  SubtitleSegment
} from './types'
import { validateWebVtt, validatorVersion } from './validator'

export interface PostProcessorOptions {
  aiClient?: (input: SubtitleAIInput, validatorErrors?: string) => Promise<string>
  forceFallback?: boolean
  sourceTranscriptVtt?: string
  transcriptUrl?: string
  storyboardUrl?: string
}

export async function postProcessSubtitles(
  assetId: string,
  bcp47: string,
  segments: SubtitleSegment[],
  options: PostProcessorOptions = {}
): Promise<PostProcessResult> {
  const parsed = parseBcp47(bcp47)
  const languageClass = detectLanguageClass(parsed.language, parsed.script)
  const profile = getProfileForClass(languageClass)

  const input: SubtitleAIInput = {
    assetId,
    bcp47,
    languageClass,
    profile,
    segments,
    promptVersion
  }

  const whisperSegmentsSha256 = sha256(JSON.stringify(segments))
  const postProcessInputSha256 = sha256(JSON.stringify(input))

  const metadataBase: Omit<PostProcessMetadata, 'aiPostProcessed' | 'fallbackUsed'> = {
    languageClass,
    languageProfileVersion: profile.languageProfileVersion,
    promptVersion,
    validatorVersion,
    fallbackVersion,
    whisperSegmentsSha256,
    postProcessInputSha256
  }

  const aiClient = options.aiClient
  const shouldUseAi = !options.forceFallback && (aiClient != null || process.env.OPENAI_API_KEY)

  let debugArtifacts: PostProcessDebugArtifacts | undefined

  if (shouldUseAi) {
    const attempt = await runAiWithRetry(input, profile, aiClient)
    debugArtifacts = buildDebugArtifacts(attempt.attempts, options)

    if (attempt.validation.valid) {
      return {
        vtt: attempt.vtt,
        metadata: {
          ...metadataBase,
          aiPostProcessed: true,
          fallbackUsed: false
        },
        validation: attempt.validation,
        debugArtifacts
      }
    }
  }

  const fallbackVtt = buildFallbackVtt(segments, languageClass, profile)
  const fallbackValidation = validateWebVtt(fallbackVtt, profile)

  if (!fallbackValidation.valid) {
    throw new PostProcessError(
      `Fallback formatter failed validation: ${JSON.stringify(
        fallbackValidation.errors
      )}`,
      debugArtifacts
    )
  }

  return {
    vtt: fallbackVtt,
    metadata: {
      ...metadataBase,
      aiPostProcessed: false,
      fallbackUsed: true
    },
    validation: fallbackValidation,
    debugArtifacts
  }
}

async function runAiWithRetry(
  input: SubtitleAIInput,
  profile: ReturnType<typeof getProfileForClass>,
  aiClient?: (input: SubtitleAIInput, validatorErrors?: string) => Promise<string>
): Promise<{
  vtt: string
  validation: ReturnType<typeof validateWebVtt>
  attempts: { vtt: string; validation: ReturnType<typeof validateWebVtt> }[]
} | null> {
  const call =
    aiClient ??
    ((payload, errors) => callAiPostProcessor(payload, { validatorErrors: errors }))

  const first = await call(input)
  const firstValidation = validateWebVtt(first, profile)
  const attempts = [{ vtt: first, validation: firstValidation }]
  if (firstValidation.valid) {
    return { vtt: first, validation: firstValidation, attempts }
  }

  const errorPrompt = buildValidatorErrorPrompt(
    firstValidation.errors.map(
      (error) =>
        `Cue ${error.cueIndex}: ${error.rule} (${error.measured ?? 'n/a'} / ${error.limit ?? 'n/a'}) - ${error.message}`
    )
  )

  const second = await call(input, errorPrompt)
  const secondValidation = validateWebVtt(second, profile)
  attempts.push({ vtt: second, validation: secondValidation })

  if (secondValidation.valid) {
    return { vtt: second, validation: secondValidation, attempts }
  }

  return { vtt: second, validation: secondValidation, attempts }
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function buildDebugArtifacts(
  attempts: { vtt: string; validation: ReturnType<typeof validateWebVtt> }[] | undefined,
  options: PostProcessorOptions
): PostProcessDebugArtifacts | undefined {
  if (attempts == null) return undefined

  const failures = attempts
    .filter((attempt) => !attempt.validation.valid)
    .map((attempt) => ({
      vtt: attempt.vtt,
      errors: attempt.validation.errors
    }))

  if (failures.length === 0) return undefined

  return {
    sourceTranscriptVtt: options.sourceTranscriptVtt,
    transcriptUrl: options.transcriptUrl,
    storyboardUrl: options.storyboardUrl,
    aiAttempts: failures
  }
}

export class PostProcessError extends Error {
  constructor(
    message: string,
    public readonly debugArtifacts?: PostProcessDebugArtifacts
  ) {
    super(message)
    this.name = 'PostProcessError'
  }
}
