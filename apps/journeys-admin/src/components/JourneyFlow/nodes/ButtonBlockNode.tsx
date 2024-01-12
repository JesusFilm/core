import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import Cursor6Icon from '@core/shared/ui/icons/Cursor6'

import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../__generated__/GetJourney'

import { ActionNode } from './ActionNode'

export type ButtonBlockNodeData = ButtonBlock

export function ButtonBlockNode({
  data: block
}: NodeProps<ButtonBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ActionNode
      block={block}
      title={
        block.label != null && block.label !== '' ? block.label : t('Button')
      }
      icon={<Cursor6Icon />}
    />
  )
}
