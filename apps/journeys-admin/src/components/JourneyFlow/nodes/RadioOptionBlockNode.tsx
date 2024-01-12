import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'

import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type RadioOptionBlockNodeData = TreeBlock<RadioOptionBlock>

export function RadioOptionBlockNode({
  data: block
}: NodeProps<RadioOptionBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <BaseNode
      isTargetConnectable={false}
      title={
        block.label != null && block.label !== '' ? block.label : t('Option')
      }
      icon={<CheckContainedIcon />}
    />
  )
}
