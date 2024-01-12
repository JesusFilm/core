import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import File5Icon from '@core/shared/ui/icons/File5'

import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../__generated__/GetJourney'

import { BaseNode } from './BaseNode'

export type FormBlockNodeData = TreeBlock<FormBlock>

export function FormBlockNode({
  data: _block
}: NodeProps<FormBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <BaseNode
      isTargetConnectable={false}
      title={t('Form')}
      icon={<File5Icon />}
    />
  )
}
