import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'

import { ActionNode } from './ActionNode'

export type SignUpBlockNodeData = SignUpBlock

export function SignUpBlockNode({
  data: block
}: NodeProps<SignUpBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return <ActionNode block={block} title={t('Subscribe')} />
}
