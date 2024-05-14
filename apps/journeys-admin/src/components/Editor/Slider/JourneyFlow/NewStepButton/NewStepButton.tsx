import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useReactFlow } from 'reactflow'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Plus3Icon from '@core/shared/ui/icons/Plus3'

import { Item } from '../../../Toolbar/Items/Item'
import { useCreateNodeAndEdge } from '../libs/useCreateNodeAndEdge'
import {
  STEP_NODE_CARD_HEIGHT,
  STEP_NODE_CARD_WIDTH
} from '../nodes/StepBlockNode/libs/sizes'

export function NewStepButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const createNodeAndEdge = useCreateNodeAndEdge()
  const reactFlowInstance = useReactFlow()

  async function handleAddStepAndCardBlock(event): Promise<void> {
    if (reactFlowInstance == null || journey == null) return
    const { x, y } = reactFlowInstance.screenToFlowPosition({
      x: (event as unknown as MouseEvent).clientX,
      y: (event as unknown as MouseEvent).clientY
    })

    const xCoordinate = parseInt(x.toString()) - STEP_NODE_CARD_WIDTH
    const yCoordinate = parseInt(y.toString()) + STEP_NODE_CARD_HEIGHT / 2
    await createNodeAndEdge(xCoordinate, yCoordinate)
  }

  return (
    <Item
      variant="button"
      label={t('Add Step')}
      icon={<Plus3Icon />}
      onClick={handleAddStepAndCardBlock}
      ButtonProps={{
        sx: {
          backgroundColor: 'background.paper',
          ':hover': {
            backgroundColor: 'background.paper'
          }
        }
      }}
    />
  )
}
