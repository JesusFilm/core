import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement } from 'react'
import { useReactFlow } from 'reactflow'

import {
  ActiveFab,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Plus3Icon from '@core/shared/ui/icons/Plus3'

import { Item } from '../../../Toolbar/Items/Item'
import { useCreateStep } from '../libs/useCreateStep'
import {
  STEP_NODE_CARD_HEIGHT,
  STEP_NODE_CARD_WIDTH
} from '../nodes/StepBlockNode/libs/sizes'

export function NewStepButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { dispatch } = useEditor()
  const createStep = useCreateStep()
  const reactFlowInstance = useReactFlow()

  async function handleClick(event: MouseEvent): Promise<void> {
    if (reactFlowInstance == null || journey == null) return
    const { x, y } = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    })

    const xCoordinate = parseInt(x.toString()) - STEP_NODE_CARD_WIDTH
    const yCoordinate = parseInt(y.toString()) + STEP_NODE_CARD_HEIGHT / 2
    const data = await createStep({ x: xCoordinate, y: yCoordinate })

    if (data != null) {
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.Content
      })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    }
  }

  return (
    <Item
      variant="button"
      label={t('Add Step')}
      icon={<Plus3Icon />}
      onClick={handleClick}
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
