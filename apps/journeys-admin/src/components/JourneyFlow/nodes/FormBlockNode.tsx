import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import File5Icon from '@core/shared/ui/icons/File5'

import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../__generated__/GetJourney'

import { ActionNode } from './ActionNode'

export type FormBlockNodeData = FormBlock

export function FormBlockNode({
  data: block
}: NodeProps<FormBlockNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return <ActionNode block={block} title={t('Form')} icon={<File5Icon />} />
}
