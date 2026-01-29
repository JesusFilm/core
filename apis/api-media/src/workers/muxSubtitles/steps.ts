import Mux from '@mux/mux-node'

import { prisma } from '@core/prisma/media/client'

import { dynamicImport } from '../../lib/dynamicImport'

import {
  MUX_SUBTITLE_STEP_MARK_ERRORED,
  MUX_SUBTITLE_STEP_PERSIST,
  MUX_SUBTITLE_STEP_REQUEST_GENERATION,
  MUX_SUBTITLE_STEP_SET_PROCESSING,
  MUX_SUBTITLE_STEP_WAIT_FOR_READY
} from './constants'

interface MuxSubtitleWorkflowInput {
  muxVideoId: string
  assetId: string
  bcp47: string
  languageId: string
  edition: string
  videoId: string
}

interface MuxSubtitleStepInput extends MuxSubtitleWorkflowInput {
  trackId?: string | null
  vttUrl?: string | null
  errorMessage?: string | null
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

async function buildMuxVttUrl(
  playbackId: string,
  trackId: string
): Promise<string> {
  const { buildTranscriptUrl } = await dynamicImport('@mux/ai/primitives')
  return await buildTranscriptUrl(playbackId, trackId, false)
}

export async function registerMuxSubtitleSteps(): Promise<void> {
  const { registerStepFunction } = await dynamicImport(
    'workflow/internal/private'
  )
  const { RetryableError } = await dynamicImport('workflow')

  registerStepFunction(MUX_SUBTITLE_STEP_SET_PROCESSING, async (input) => {
    const { muxVideoId, bcp47 } = input as MuxSubtitleWorkflowInput
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

    return { ok: true }
  })

  registerStepFunction(MUX_SUBTITLE_STEP_REQUEST_GENERATION, async (input) => {
    const { assetId, bcp47, muxVideoId } = input as MuxSubtitleWorkflowInput

    const mux = getMuxClient()
    const asset = await mux.video.assets.retrieve(assetId)
    const audioTrack = asset.tracks?.find(
      (track) => track.type === 'audio' && track.primary
    )
    const fallbackAudioTrack = asset.tracks?.find(
      (track) => track.type === 'audio'
    )
    const trackId = audioTrack?.id ?? fallbackAudioTrack?.id

    if (trackId == null) {
      throw new Error('Mux audio track not found for asset')
    }

    const tracks = await mux.video.assets.generateSubtitles(assetId, trackId, {
      generated_subtitles: [
        {
          language_code: bcp47,
          name: bcp47,
          passthrough: `mux-ai:${muxVideoId}:${bcp47}`
        }
      ]
    })

    const generatedTrack = tracks.find(
      (track) =>
        track.text_source === 'generated_vod' && track.language_code === bcp47
    )

    if (generatedTrack?.id != null) {
      await prisma.muxSubtitleTrack.update({
        where: {
          muxVideoId_bcp47_source: {
            muxVideoId,
            bcp47,
            source: 'generated'
          }
        },
        data: {
          trackId: generatedTrack.id
        }
      })
    }

    return { trackId: generatedTrack?.id ?? null }
  })

  const waitForReadyStep = async (input: unknown) => {
    const { assetId, bcp47, trackId: candidateTrackId } =
      input as MuxSubtitleStepInput

    const mux = getMuxClient()
    const asset = await mux.video.assets.retrieve(assetId)
    const track = asset.tracks?.find((item) =>
      candidateTrackId != null
        ? item.id === candidateTrackId
        : item.type === 'text' &&
          item.text_source === 'generated_vod' &&
          item.language_code === bcp47
    )

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

    return {
      trackId: track.id,
      vttUrl
    }
  }

  waitForReadyStep.maxRetries = 20

  registerStepFunction(MUX_SUBTITLE_STEP_WAIT_FOR_READY, waitForReadyStep)

  registerStepFunction(MUX_SUBTITLE_STEP_PERSIST, async (input) => {
    const { muxVideoId, bcp47, vttUrl, trackId, videoId, edition, languageId } =
      input as MuxSubtitleStepInput

    if (vttUrl == null || trackId == null) {
      throw new Error('Missing vttUrl or trackId for subtitle persistence')
    }

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

    return { ok: true }
  })

  registerStepFunction(MUX_SUBTITLE_STEP_MARK_ERRORED, async (input) => {
    const { muxVideoId, bcp47, errorMessage } = input as MuxSubtitleStepInput

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
        errorMessage: errorMessage ?? 'Workflow failed'
      }
    })

    return { ok: true }
  })
}
