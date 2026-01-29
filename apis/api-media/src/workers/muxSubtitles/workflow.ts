import { MUX_SUBTITLE_WORKFLOW_ID } from './constants'

export interface MuxAiSubtitleWorkflowInput {
  muxVideoId: string
  assetId: string
  bcp47: string
  languageId: string
  edition: string
  videoId: string
}

export async function muxAiSubtitlesWorkflow(
  _input: MuxAiSubtitleWorkflowInput
): Promise<void> {
  'use workflow'
}

;(muxAiSubtitlesWorkflow as any).workflowId = MUX_SUBTITLE_WORKFLOW_ID
