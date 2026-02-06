import type { WorkflowContext, WorkflowStage } from '../devkit'
import { createConsoleLogger, createWorkflow } from '../devkit'

import { generateMuxSubtitles } from './generate/step1/generateSubtitles'
import { postProcessSubtitles } from './generate/step2/postProcessSubtitles'
import { uploadMuxSubtitles } from './generate/step3/uploadSubtitles'
import { subtitlesWorkflowStages } from './plan'
import type { SubtitlesWorkflowInput, SubtitlesWorkflowResult } from './types'

const stages: WorkflowStage[] = [
  {
    name: subtitlesWorkflowStages[0].name,
    run: async (input, context) =>
      generateMuxSubtitles(input as SubtitlesWorkflowInput, context)
  },
  {
    name: subtitlesWorkflowStages[1].name,
    run: async (input, context) =>
      postProcessSubtitles(
        (input as { subtitles: Awaited<ReturnType<typeof generateMuxSubtitles>> })
          .subtitles,
        context
      )
  },
  {
    name: subtitlesWorkflowStages[2].name,
    run: async (input, context) => {
      const stageInput = input as {
        request: SubtitlesWorkflowInput
        subtitles: Awaited<ReturnType<typeof postProcessSubtitles>>
      }

      return uploadMuxSubtitles(stageInput.request, stageInput.subtitles, context)
    }
  }
]

export const subtitlesWorkflow = createWorkflow(
  'subtitles',
  stages,
  async (input: SubtitlesWorkflowInput, context: WorkflowContext) => {
    const generated = await generateMuxSubtitles(input, context)
    const improved = await postProcessSubtitles(generated, context)
    const upload = await uploadMuxSubtitles(input, improved, context)

    return {
      generated,
      improved,
      upload
    }
  }
)

export async function runSubtitlesWorkflow(
  input: SubtitlesWorkflowInput
): Promise<SubtitlesWorkflowResult> {
  const context: WorkflowContext = {
    requestId: input.requestId,
    logger: createConsoleLogger('subtitles')
  }

  context.logger.info('Starting subtitles workflow', {
    assetId: input.assetId,
    playbackId: input.playbackId,
    language: input.language ?? 'en'
  })

  return subtitlesWorkflow.run(input, context)
}
