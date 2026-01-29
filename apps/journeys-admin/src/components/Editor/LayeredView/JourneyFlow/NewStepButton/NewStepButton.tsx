import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement } from 'react'
import { useReactFlow } from 'reactflow'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Plus3Icon from '@core/shared/ui/icons/Plus3'

import { Item } from '../../../Toolbar/Items/Item'
import { useCreateStep } from '../libs/useCreateStep'
import {
  STEP_NODE_CARD_HEIGHT,
  STEP_NODE_CARD_WIDTH
} from '../nodes/StepBlockNode/libs/sizes'

interface NewStepButtonProps {
  disabled?: boolean
}

export function NewStepButton({ disabled }: NewStepButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const createStep = useCreateStep()
  const reactFlowInstance = useReactFlow()

  function handleClick(event: MouseEvent): void {
    if (reactFlowInstance == null || journey == null) return

    const { x, y } = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    })

    const xCoordinate = Math.trunc(x) - STEP_NODE_CARD_WIDTH
    const yCoordinate = Math.trunc(y) + STEP_NODE_CARD_HEIGHT / 2
    createStep({ x: xCoordinate, y: yCoordinate })
  }

  return (
    <Item
      variant="button"
      label={t('Add Step')}
      icon={<Plus3Icon />}
      onClick={handleClick}
      ButtonProps={{
        disabled,
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
