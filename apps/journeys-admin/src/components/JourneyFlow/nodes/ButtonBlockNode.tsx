import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import Cursor6Icon from '@core/shared/ui/icons/Cursor6'

import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type ButtonBlockNodeData = TreeBlock<ButtonBlock>

export function ButtonBlockNode({
  data: block
}: NodeProps<ButtonBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <BaseNode
      isTargetConnectable={false}
      title={
        block.label != null && block.label !== '' ? block.label : t('Button')
      }
      icon={<Cursor6Icon />}
    />
  )
}
