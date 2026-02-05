import { uploadSubtitles } from '@mux/ai/primitives'
import type { SubtitleFile } from '@mux/ai/primitives'

import type { WorkflowContext } from '../../../devkit'
import type { SubtitlesWorkflowInput } from '../../types'

export async function uploadMuxSubtitles(
  input: SubtitlesWorkflowInput,
  subtitles: SubtitleFile,
  context: WorkflowContext
): Promise<Awaited<ReturnType<typeof uploadSubtitles>>> {
  context.logger.info('Uploading subtitles to Mux', {
    assetId: input.assetId,
    playbackId: input.playbackId,
    cueCount: subtitles.cues.length
  })

  return uploadSubtitles({
    asset: {
      assetId: input.assetId,
      playbackId: input.playbackId
    },
    subtitles
  })
}
