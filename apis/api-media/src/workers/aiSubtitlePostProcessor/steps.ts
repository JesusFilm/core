import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import Mux from '@mux/mux-node'

import { prisma } from '@core/prisma/media/client'

import {
  PostProcessError,
  buildMuxVttUrl,
  getTranscriptSegments,
  postProcessSubtitles
} from '../../lib/aiSubtitles'
import { dynamicImport } from '../../lib/dynamicImport'
import { logger } from '../lib/logger'

import {
  AI_SUBTITLE_STEP_FETCH_TRANSCRIPT,
  AI_SUBTITLE_STEP_MARK_ERRORED,
  AI_SUBTITLE_STEP_PERSIST,
  AI_SUBTITLE_STEP_POST_PROCESS,
  AI_SUBTITLE_STEP_SET_PROCESSING,
  AI_SUBTITLE_STEP_UPLOAD_TRACK,
  AI_SUBTITLE_STEP_WAIT_FOR_READY
} from './constants'

interface AiSubtitleWorkflowInput {
  muxVideoId: string
  assetId: string
  bcp47: string
  languageId: string
  edition: string
  videoId: string
  trackLabel?: string
}

interface AiSubtitleStepInput extends AiSubtitleWorkflowInput {
  trackId?: string | null
  vttUrl?: string | null
  vttText?: string | null
  errorMessage?: string | null
  metadata?: Record<string, unknown> | null
  segments?: { id: string; start: number; end: number; text: string }[]
  rawVtt?: string | null
  transcriptUrl?: string | null
  storyboardUrl?: string | null
}

function getMuxClient(): Mux {
  if (process.env.MUX_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_ACCESS_TOKEN_ID')
  if (process.env.MUX_SECRET_KEY == null)
    throw new Error('Missing MUX_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })
}

function getR2Client(): S3Client {
  if (process.env.CLOUDFLARE_R2_ENDPOINT == null)
    throw new Error('Missing CLOUDFLARE_R2_ENDPOINT')
  if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID == null)
    throw new Error('Missing CLOUDFLARE_R2_ACCESS_KEY_ID')
  if (process.env.CLOUDFLARE_R2_SECRET == null)
    throw new Error('Missing CLOUDFLARE_R2_SECRET')

  return new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET
    }
  })
}

async function uploadVttToR2(
  vttText: string,
  fileName: string
): Promise<string> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')
  if (process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN == null)
    throw new Error('Missing CLOUDFLARE_R2_CUSTOM_DOMAIN')

  const client = getR2Client()

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      Body: vttText,
      ContentType: 'text/vtt'
    })
  )

  return `${process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN}/${fileName}`
}

async function uploadJsonToR2(
  payload: Record<string, unknown>,
  fileName: string
): Promise<string> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')
  if (process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN == null)
    throw new Error('Missing CLOUDFLARE_R2_CUSTOM_DOMAIN')

  const client = getR2Client()

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      Body: JSON.stringify(payload, null, 2),
      ContentType: 'application/json'
    })
  )

  return `${process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN}/${fileName}`
}

export async function registerAiSubtitlePostProcessorSteps(): Promise<void> {
  const { registerStepFunction } = await dynamicImport(
    'workflow/internal/private'
  )
  const { RetryableError } = await dynamicImport('workflow')

  registerStepFunction(AI_SUBTITLE_STEP_SET_PROCESSING, async (input) => {
    const { muxVideoId, bcp47 } = input as AiSubtitleWorkflowInput

    logger.info(
      { muxVideoId, bcp47 },
      '[AiSubtitlePostProcessor] 🔄 Status change: "queued" → "processing"'
    )

    await prisma.muxSubtitleTrack.update({
      where: {
        muxVideoId_bcp47_source: {
          muxVideoId,
          bcp47,
          source: 'generated'
        }
      },
      data: {
        status: 'processing',
        errorMessage: null
      }
    })

    logger.info(
      { muxVideoId, bcp47 },
      '[AiSubtitlePostProcessor] ✅ Status updated to "processing"'
    )

    return { ok: true }
  })

  registerStepFunction(AI_SUBTITLE_STEP_FETCH_TRANSCRIPT, async (input) => {
    const { assetId, bcp47 } = input as AiSubtitleWorkflowInput

    logger.info(
      { assetId, bcp47 },
      '[AiSubtitlePostProcessor] 📥 Step: Fetch transcript via primitives'
    )

    const transcript = await getTranscriptSegments(assetId, bcp47)

    logger.info(
      {
        assetId,
        bcp47,
        segmentCount: transcript.segments.length,
        transcriptUrl: transcript.transcriptUrl
      },
      '[AiSubtitlePostProcessor] ✅ Transcript acquired'
    )

    return {
      segments: transcript.segments,
      rawVtt: transcript.rawVtt,
      transcriptUrl: transcript.transcriptUrl,
      storyboardUrl: transcript.storyboardUrl
    }
  })

  registerStepFunction(AI_SUBTITLE_STEP_POST_PROCESS, async (input) => {
    const { assetId, bcp47, segments, rawVtt, transcriptUrl, storyboardUrl } =
      input as AiSubtitleStepInput

    if (segments == null || rawVtt == null) {
      throw new Error('Missing transcript segments for post-processing')
    }

    logger.info(
      { assetId, bcp47, segmentCount: segments.length },
      '[AiSubtitlePostProcessor] 🤖 Step: AI post-processing'
    )

    try {
      const result = await postProcessSubtitles(assetId, bcp47, segments, {
        sourceTranscriptVtt: rawVtt,
        transcriptUrl: transcriptUrl ?? undefined,
        storyboardUrl: storyboardUrl ?? undefined
      })

      if (result.debugArtifacts?.aiAttempts?.length) {
        const debugFile = `subtitles/debug/${assetId}/${bcp47}/${Date.now()}.json`
        const debugUrl = await uploadJsonToR2(
          {
            assetId,
            bcp47,
            generatedAt: new Date().toISOString(),
            ...result.debugArtifacts
          },
          debugFile
        )

        logger.warn(
          { assetId, bcp47, debugUrl },
          '[AiSubtitlePostProcessor] ⚠️ Stored validation debug artifacts'
        )
      }

      logger.info(
        {
          assetId,
          bcp47,
          fallbackUsed: result.metadata.fallbackUsed,
          aiPostProcessed: result.metadata.aiPostProcessed
        },
        '[AiSubtitlePostProcessor] ✅ Post-processing complete'
      )

      return {
        vttText: result.vtt,
        metadata: result.metadata
      }
    } catch (error) {
      if (error instanceof PostProcessError && error.debugArtifacts != null) {
        const debugFile = `subtitles/debug/${assetId}/${bcp47}/${Date.now()}.json`
        const debugUrl = await uploadJsonToR2(
          {
            assetId,
            bcp47,
            generatedAt: new Date().toISOString(),
            ...error.debugArtifacts
          },
          debugFile
        )

        logger.error(
          { assetId, bcp47, debugUrl },
          '[AiSubtitlePostProcessor] ❌ Stored debug artifacts after failure'
        )
      }

      throw error
    }
  })

  registerStepFunction(AI_SUBTITLE_STEP_UPLOAD_TRACK, async (input) => {
    const { assetId, bcp47, vttText, trackLabel, muxVideoId, metadata } =
      input as AiSubtitleStepInput

    if (vttText == null || metadata == null) {
      throw new Error('Missing VTT text or metadata for upload')
    }

    const fileName = `subtitles/${muxVideoId}/${bcp47}/${Date.now()}.vtt`
    const r2Url = await uploadVttToR2(vttText, fileName)

    logger.info(
      { assetId, bcp47, r2Url },
      '[AiSubtitlePostProcessor] ☁️ Uploaded VTT to R2'
    )

    const mux = getMuxClient()
    const track = await mux.video.assets.createTrack(assetId, {
      type: 'text',
      text_type: 'subtitles',
      language_code: bcp47,
      name: trackLabel ?? bcp47,
      url: r2Url,
      passthrough: JSON.stringify({
        source: 'ai_post_processed',
        ...metadata
      })
    })

    logger.info(
      { assetId, trackId: track.id },
      '[AiSubtitlePostProcessor] 🎬 Created Mux subtitle track'
    )

    return { trackId: track.id }
  })

  const waitForReadyStep = async (input: unknown) => {
    const { assetId, bcp47, trackId } = input as AiSubtitleStepInput

    const mux = getMuxClient()
    const asset = await mux.video.assets.retrieve(assetId)
    const track = asset.tracks?.find((item) => item.id === trackId)

    if (track == null || track.id == null) {
      throw new RetryableError('Mux subtitle track not created yet', {
        retryAfter: '10s'
      })
    }

    if (track.status !== 'ready') {
      throw new RetryableError('Mux subtitle track not ready yet', {
        retryAfter: '10s'
      })
    }

    const playbackId = asset.playback_ids?.[0]?.id
    if (playbackId == null) {
      throw new Error('Mux playback ID not found for asset')
    }

    const vttUrl = await buildMuxVttUrl(playbackId, track.id)

    logger.info(
      { assetId, bcp47, trackId: track.id, vttUrl },
      '[AiSubtitlePostProcessor] ✅ Track ready'
    )

    return { trackId: track.id, vttUrl }
  }

  waitForReadyStep.maxRetries = 20

  registerStepFunction(AI_SUBTITLE_STEP_WAIT_FOR_READY, waitForReadyStep)

  registerStepFunction(AI_SUBTITLE_STEP_PERSIST, async (input) => {
    const { muxVideoId, bcp47, vttUrl, trackId, videoId, edition, languageId } =
      input as AiSubtitleStepInput

    if (vttUrl == null || trackId == null) {
      throw new Error('Missing vttUrl or trackId for subtitle persistence')
    }

    logger.info(
      { muxVideoId, bcp47, vttUrl },
      '[AiSubtitlePostProcessor] 💾 Persisting VTT URL'
    )

    await prisma.videoSubtitle.upsert({
      where: {
        videoId_edition_languageId: {
          videoId,
          edition,
          languageId
        }
      },
      create: {
        videoId,
        edition,
        languageId,
        vttSrc: vttUrl,
        primary: true
      },
      update: {
        vttSrc: vttUrl
      }
    })

    await prisma.muxSubtitleTrack.update({
      where: {
        muxVideoId_bcp47_source: {
          muxVideoId,
          bcp47,
          source: 'generated'
        }
      },
      data: {
        status: 'ready',
        vttUrl,
        trackId,
        errorMessage: null
      }
    })

    logger.info(
      { muxVideoId, bcp47 },
      '[AiSubtitlePostProcessor] ✅ Status change: "processing" → "ready"'
    )

    return { ok: true }
  })

  registerStepFunction(AI_SUBTITLE_STEP_MARK_ERRORED, async (input) => {
    const { muxVideoId, bcp47, errorMessage } = input as AiSubtitleStepInput

    const finalErrorMessage = errorMessage ?? 'Workflow failed'

    logger.error(
      { muxVideoId, bcp47, errorMessage: finalErrorMessage },
      '[AiSubtitlePostProcessor] ❌ Status change: "processing" → "errored"'
    )

    await prisma.muxSubtitleTrack.update({
      where: {
        muxVideoId_bcp47_source: {
          muxVideoId,
          bcp47,
          source: 'generated'
        }
      },
      data: {
        status: 'errored',
        errorMessage: finalErrorMessage
      }
    })

    return { ok: true }
  })
}
