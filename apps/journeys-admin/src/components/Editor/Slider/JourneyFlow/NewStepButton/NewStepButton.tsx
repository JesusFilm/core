import { gql } from '@apollo/client'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { ReactFlowInstance } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import {
  ActiveFab,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Plus3Icon from '@core/shared/ui/icons/Plus3'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { useStepAndCardBlockCreateMutation } from '../../../../../libs/useStepAndCardBlockCreateMutation'
import { Item } from '../../../Toolbar/Items/Item'
import {
  STEP_NODE_HEIGHT,
  STEP_NODE_WIDTH
} from '../nodes/StepBlockNode/libs/sizes'

interface NewStepButtonProps {
  reactFlowInstance: ReactFlowInstance | null
}

export function NewStepButton({
  reactFlowInstance
}: NewStepButtonProps): ReactElement {
  const { journey } = useJourney()
  const { dispatch } = useEditor()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation({
    update(cache, { data }) {
      if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
        cache.modify({
          fields: {
            blocks(existingBlockRefs = []) {
              const newStepBlockRef = cache.writeFragment({
                data: data.stepBlockCreate,
                fragment: gql`
                  fragment NewBlock on Block {
                    id
                  }
                `
              })
              return [...existingBlockRefs, newStepBlockRef]
            }
          }
        })
      }
    }
  })

  async function handleAddStepAndCardBlock(event): Promise<void> {
    if (reactFlowInstance == null || journey == null) return
    const { x, y } = reactFlowInstance.screenToFlowPosition({
      x: (event as unknown as MouseEvent).clientX,
      y: (event as unknown as MouseEvent).clientY
    })

    const newStepId = uuidv4()
    const newCardId = uuidv4()
    const { data } = await stepAndCardBlockCreate({
      variables: {
        stepBlockCreateInput: {
          id: newStepId,
          journeyId: journey.id,
          x: parseInt(x.toString()) - STEP_NODE_WIDTH,
          y: parseInt(y.toString()) + STEP_NODE_HEIGHT / 2
        },
        cardBlockCreateInput: {
          id: newCardId,
          journeyId: journey.id,
          parentBlockId: newStepId,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        }
      }
    })
    if (data != null) {
      dispatch({
        type: 'SetSelectedStepAction',
        selectedStep: {
          ...data.stepBlockCreate,
          children: [{ ...data.cardBlockCreate, children: [] }]
        }
      })
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.Content
      })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    }
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        right: 30,
        top: 30,
        zIndex: 3
      }}
    >
      <Item
        variant="button"
        label="Add Step"
        icon={<Plus3Icon />}
        onClick={handleAddStepAndCardBlock}
      />
    </Box>
  )
}
