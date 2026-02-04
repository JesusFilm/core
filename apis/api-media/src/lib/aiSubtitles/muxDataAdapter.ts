import Mux from '@mux/mux-node'

import { dynamicImport } from '../dynamicImport'

import { SubtitleSegment } from './types'

export interface TranscriptAdapterResult {
  segments: SubtitleSegment[]
  rawVtt: string
  playbackId: string
  transcriptUrl?: string
  storyboardUrl?: string
}

export async function getTranscriptSegments(
  assetId: string,
  bcp47: string
): Promise<TranscriptAdapterResult> {
  const mux = getMuxClient()
  const asset = await mux.video.assets.retrieve(assetId)
  const playbackId = asset.playback_ids?.[0]?.id

  if (playbackId == null) {
    throw new Error('Mux playback ID not found for asset')
  }

  const { fetchTranscriptForAsset, parseVTTCues, getStoryboardUrl } =
    await dynamicImport('@mux/ai/primitives')

  const transcriptResult = await fetchTranscriptForAsset(asset, playbackId, {
    languageCode: bcp47,
    cleanTranscript: false,
    required: true
  })

  const rawVtt = transcriptResult.transcriptText ?? ''
  const cues = parseVTTCues(rawVtt)
  const segments = cues.map((cue, index) => ({
    id: `${index + 1}`,
    start: cue.startTime,
    end: cue.endTime,
    text: cue.text
  }))

  let storyboardUrl: string | undefined
  try {
    storyboardUrl = await getStoryboardUrl(playbackId, 640)
  } catch {
    storyboardUrl = undefined
  }

  return {
    segments,
    rawVtt,
    playbackId,
    transcriptUrl: transcriptResult.transcriptUrl,
    storyboardUrl
  }
}

export async function buildMuxVttUrl(
  playbackId: string,
  trackId: string
): Promise<string> {
  const { buildTranscriptUrl } = await dynamicImport('@mux/ai/primitives')
  return await buildTranscriptUrl(playbackId, trackId, false)
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
