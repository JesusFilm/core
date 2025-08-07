import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { AgentGenerateImageTool } from './agent/GenerateImageTool'
import { BasicTool } from './BasicTool'
import { ClientRedirectUserToEditorTool } from './client/RedirectUserToEditorTool'
import { RequestFormTool } from './client/RequestFormTool'
import { ClientSelectImageTool } from './client/SelectImageTool'
import { ClientSelectVideoTool } from './client/SelectVideoTool'

interface ToolInvocationPartProps {
  part: ToolInvocationUIPart
  addToolResult: ({
    toolCallId,
    result
  }: {
    toolCallId: string
    result: any
  }) => void
}

export function ToolInvocationPart({
  part,
  addToolResult
}: ToolInvocationPartProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

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
    case 'clientSelectImage':
      return <ClientSelectImageTool part={part} addToolResult={addToolResult} />
    case 'clientRedirectUserToEditor':
      return <ClientRedirectUserToEditorTool part={part} />
    case 'clientSelectVideo':
      return <ClientSelectVideoTool part={part} addToolResult={addToolResult} />
    case 'clientRequestForm':
      return <RequestFormTool part={part} addToolResult={addToolResult} />
    case 'agentGenerateImage':
      return <AgentGenerateImageTool part={part} />
    default:
      return null
  }
}
