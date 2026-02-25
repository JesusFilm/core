import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback } from 'react'

import type { AddToolResultArg, LegacyToolInvocationPart } from '../MessageList'

import { AgentGenerateImageTool } from './agent/GenerateImageTool'
import { BasicTool } from './BasicTool'
import { ClientRedirectUserToEditorTool } from './client/RedirectUserToEditorTool'
import { RequestFormTool } from './client/RequestFormTool'
import { ClientSelectImageTool } from './client/SelectImageTool'
import { ClientSelectVideoTool } from './client/SelectVideoTool'

interface ToolInvocationPartProps {
  part: LegacyToolInvocationPart
  addToolResult: (arg: AddToolResultArg) => void
}

/** Shape client tools use when calling addToolResult (tool name is added by this component). */
export type AddToolResultChildArg = {
  toolCallId: string
  result: unknown
}

export function ToolInvocationPart({
  part,
  addToolResult
}: ToolInvocationPartProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  const addToolResultForChild = useCallback(
    ({ toolCallId, result }: AddToolResultChildArg) => {
      addToolResult({
        tool: part.toolInvocation.toolName,
        toolCallId,
        result
      })
    },
    [addToolResult, part.toolInvocation.toolName]
  )

  switch (part.toolInvocation.toolName) {
    case 'agentWebSearch':
      return <BasicTool part={part} callText={t('Searching the web...')} />
    case 'journeySimpleGet':
      return (
        <BasicTool
          part={part}
          callText={t('Getting journey...')}
          resultText={t('Journey retrieved')}
        />
      )
    case 'journeySimpleUpdate':
      return (
        <BasicTool
          part={part}
          callText={t('Updating journey...')}
          resultText={t('Journey updated')}
        />
      )
    case 'agentInternalVideoSearch':
      return (
        <BasicTool
          part={part}
          callText={t('Searching Internal Videos...')}
          resultText={t('Videos Search Completed!')}
        />
      )
    case 'loadVideoSubtitleContent':
      return (
        <BasicTool
          part={part}
          callText={t('Loading Video Subtitle Content...')}
          resultText={t('Video Subtitle Content Loaded!')}
        />
      )
    case 'loadLanguages':
      return (
        <BasicTool
          part={part}
          callText={t('Loading Languages...')}
          resultText={t('Languages Loaded!')}
        />
      )
    case 'youtubeAnalyzerTool':
      return (
        <BasicTool
          part={part}
          callText={t('Analyzing YouTube Video...')}
          resultText={t('YouTube Video Analyzed!')}
        />
      )
    case 'clientSelectImage':
      return (
        <ClientSelectImageTool
          part={part}
          addToolResult={addToolResultForChild}
        />
      )
    case 'clientRedirectUserToEditor':
      return <ClientRedirectUserToEditorTool part={part} />
    case 'clientSelectVideo':
      return (
        <ClientSelectVideoTool
          part={part}
          addToolResult={addToolResultForChild}
        />
      )
    case 'clientRequestForm':
      return (
        <RequestFormTool
          part={part}
          addToolResult={addToolResultForChild}
        />
      )
    case 'agentGenerateImage':
      return <AgentGenerateImageTool part={part} />
    default:
      return null
  }
}
