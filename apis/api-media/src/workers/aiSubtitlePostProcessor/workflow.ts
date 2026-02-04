import { AI_SUBTITLE_POST_PROCESS_WORKFLOW_ID } from './constants'

export interface AiSubtitlePostProcessorWorkflowInput {
  muxVideoId: string
  assetId: string
  bcp47: string
  languageId: string
  edition: string
  videoId: string
  trackLabel?: string
}

export async function aiSubtitlePostProcessorWorkflow(
  _input: AiSubtitlePostProcessorWorkflowInput
): Promise<void> {
  'use workflow'
}

;(aiSubtitlePostProcessorWorkflow as any).workflowId =
  AI_SUBTITLE_POST_PROCESS_WORKFLOW_ID
