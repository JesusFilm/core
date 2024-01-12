import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import Mail2Icon from '@core/shared/ui/icons/Mail2'

import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type SignUpBlockNodeData = TreeBlock<SignUpBlock>

export function SignUpBlockNode({
  data: block
}: NodeProps<SignUpBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <BaseNode
      isTargetConnectable={false}
      title={t('Subscribe')}
      icon={<Mail2Icon />}
    />
  )
}
