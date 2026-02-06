import { improveSubtitles } from '@mux/ai/primitives'
import type { SubtitleFile } from '@mux/ai/primitives'

import type { WorkflowContext } from '../../../devkit'

const DEFAULT_INSTRUCTIONS =
  'Improve punctuation, casing, and readability. Keep timing aligned with speech and avoid altering meaning.'

export async function postProcessSubtitles(
  subtitles: SubtitleFile,
  context: WorkflowContext
): Promise<SubtitleFile> {
  context.logger.info('Post-processing subtitles with OpenAI via Mux AI', {
    cueCount: subtitles.cues.length,
    language: subtitles.language
  })

  return improveSubtitles({
    subtitles,
    instructions: DEFAULT_INSTRUCTIONS,
    model: 'gpt-4.1-mini'
  })
}
