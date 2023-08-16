import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { ReactElement, useMemo, useState } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'
import { transformer } from '@core/journeys/ui/transformer'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { StepAndCardBlockCreate } from '../../../__generated__/StepAndCardBlockCreate'
import { StepsOrderUpdate } from '../../../__generated__/StepsOrderUpdate'

import { CardList } from './CardList'
import { OnSelectProps } from './OnSelectProps'

export interface CardPreviewProps {
  onSelect?: ({ step, view }: OnSelectProps) => void
  selected?: TreeBlock<StepBlock>
  steps?: Array<TreeBlock<StepBlock>>
  showAddButton?: boolean
  isDraggable?: boolean
  showNavigationCards?: boolean
}

export const STEP_AND_CARD_BLOCK_CREATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepAndCardBlockCreate($journeyId: ID!, $stepId: ID!, $cardId: ID) {
    stepBlockCreate(input: { id: $stepId, journeyId: $journeyId }) {
      ...StepFields
    }
    cardBlockCreate(
      input: { id: $cardId, journeyId: $journeyId, parentBlockId: $stepId }
    ) {
      ...CardFields
    }
  }
`

export const STEPS_ORDER_UPDATE = gql`
  mutation StepsOrderUpdate($id: ID!, $journeyId: ID!, $parentOrder: Int!) {
    blockOrderUpdate(
      id: $id
      journeyId: $journeyId
      parentOrder: $parentOrder
    ) {
      id
      parentOrder
    }
  }
`

export function CardPreview({
  steps,
  selected,
  onSelect,
  showAddButton,
  isDraggable,
  showNavigationCards
}: CardPreviewProps): ReactElement {
  const [isDragging, setIsDragging] = useState(false)
  const [stepAndCardBlockCreate] = useMutation<StepAndCardBlockCreate>(
    STEP_AND_CARD_BLOCK_CREATE
  )
  const [stepsOrderUpdate] = useMutation<StepsOrderUpdate>(STEPS_ORDER_UPDATE)
  const { journey } = useJourney()

  const handleChange = (selectedId: string): void => {
    switch (selectedId) {
      case 'goals':
        onSelect?.({ view: ActiveJourneyEditContent.Action })
        return
      case 'social':
        onSelect?.({ view: ActiveJourneyEditContent.SocialPreview })
        return
    }
    if (steps == null) return

    const selectedStep = steps.find(({ id }) => id === selectedId)
    selectedStep != null && onSelect?.({ step: selectedStep })
  }

  const handleClick = async (): Promise<void> => {
    if (journey == null || steps == null) return

    const stepId = uuidv4()
    const cardId = uuidv4()
    const { data } = await stepAndCardBlockCreate({
      variables: {
        journeyId: journey.id,
        stepId,
        cardId
      },
      update(cache, { data }) {
        if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
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
                const newCardBlockRef = cache.writeFragment({
                  data: data.cardBlockCreate,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, newStepBlockRef, newCardBlockRef]
              }
            }
          })
        }
      }
    })
    if (data?.stepBlockCreate != null) {
      onSelect?.({
        step: transformer([
          data.stepBlockCreate,
          data.cardBlockCreate
        ])[0] as TreeBlock<StepBlock>
      })
    }
  }

  const onBeforeCapture = (): void => {
    setIsDragging(true)
  }

  const onDragEnd = useMemo(
    () =>
      async ({ destination, source }): Promise<void> => {
        if (steps == null) return
        if (journey == null) return
        if (destination == null) return

        const cardDragging = steps[source.index]
        const destIndex: number = destination.index

        if (
          destination.droppableId === source.droppableId &&
          destIndex === source.index
        )
          return

        if (cardDragging.parentOrder != null) {
          const parentOrder =
            cardDragging.parentOrder + destIndex - source.index

          await stepsOrderUpdate({
            variables: {
              id: cardDragging.id,
              journeyId: journey.id,
              parentOrder
            },
            optimisticResponse: {
              blockOrderUpdate: [
                {
                  __typename: 'StepBlock',
                  id: cardDragging.id,
                  parentOrder
                }
              ]
            }
          })
        }
        setIsDragging(false)
      },
    [steps, journey, stepsOrderUpdate]
  )

  return (
    <>
      {steps != null ? (
        isDraggable === true ? (
          <DragDropContext
            onBeforeCapture={onBeforeCapture}
            onDragEnd={onDragEnd}
          >
            <Droppable droppableId="steps" direction="horizontal">
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  <CardList
                    steps={steps}
                    selected={selected}
                    showAddButton={showAddButton}
                    droppableProvided={provided}
                    handleClick={handleClick}
                    handleChange={handleChange}
                    isDragging={isDragging}
                    isDraggable={isDraggable}
                    showNavigationCards={showNavigationCards}
                  />
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <CardList
            steps={steps}
            selected={selected}
            handleClick={handleClick}
            handleChange={handleChange}
            showAddButton={showAddButton}
            showNavigationCards={showNavigationCards}
          />
        )
      ) : (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
            py: 5,
            px: 6
          }}
        >
          <Box
            sx={{
              border: '3px solid transparent'
            }}
          >
            <Skeleton
              variant="rectangular"
              width={87}
              height={132}
              sx={{ m: 1, borderRadius: 1 }}
            />
          </Box>
          <Box
            sx={{
              border: '3px solid transparent'
            }}
          >
            <Skeleton
              variant="rectangular"
              width={87}
              height={132}
              sx={{ m: 1, borderRadius: 1 }}
            />
          </Box>
          <Box
            sx={{
              border: '3px solid transparent'
            }}
          >
            <Skeleton
              variant="rectangular"
              width={87}
              height={132}
              sx={{ m: 1, borderRadius: 1 }}
            />
          </Box>
        </Stack>
      )}
    </>
  )
}
