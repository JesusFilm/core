import { generateSubtitles } from '@mux/ai/primitives'

import type { WorkflowContext } from '../../../devkit'
import type { SubtitlesWorkflowInput } from '../../types'

export async function generateMuxSubtitles(
  input: SubtitlesWorkflowInput,
  context: WorkflowContext
): Promise<Awaited<ReturnType<typeof generateSubtitles>>> {
  const language = input.language ?? 'en'
  const format = input.format ?? 'vtt'

  context.logger.info('Generating subtitles with Mux AI', {
    assetId: input.assetId,
    playbackId: input.playbackId,
    language,
    format
  })

  return generateSubtitles({
    asset: {
      assetId: input.assetId,
      playbackId: input.playbackId
    },
    language,
    format
  })
}
