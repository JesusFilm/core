import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../__generated__/GetJourney'

import { ActionNode } from './ActionNode'

export type TextResponseBlockNodeData = TextResponseBlock

export function TextResponseBlockNode({
  data: block
}: NodeProps<TextResponseBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ActionNode block={block} title={t('Feedback')} icon={<TextInput1Icon />} />
  )
}
