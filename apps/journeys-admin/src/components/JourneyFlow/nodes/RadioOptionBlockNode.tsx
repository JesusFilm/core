import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'

import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'

import { ActionNode } from './ActionNode'

export type RadioOptionBlockNodeData = RadioOptionBlock

export function RadioOptionBlockNode({
  data: block
}: NodeProps<RadioOptionBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ActionNode
      block={block}
      title={
        block.label != null && block.label !== '' ? block.label : t('Option')
      }
      icon={<CheckContainedIcon />}
    />
  )
}
