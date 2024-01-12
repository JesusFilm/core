import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type TextResponseBlockNodeData = TreeBlock<TextResponseBlock>

export function TextResponseBlockNode({
  data: _block
}: NodeProps<TextResponseBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <BaseNode
      isTargetConnectable={false}
      title={t('Feedback')}
      icon={<TextInput1Icon />}
    />
  )
}
