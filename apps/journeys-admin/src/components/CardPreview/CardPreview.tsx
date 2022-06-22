import Box from '@mui/material/Box'
import { ReactElement, useState } from 'react'
import {
  CARD_FIELDS,
  STEP_FIELDS,
  TreeBlock,
  transformer,
  useJourney
} from '@core/journeys/ui'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, gql } from '@apollo/client'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { StepsOrderUpdate } from '../../../__generated__/StepsOrderUpdate'
import { StepAndCardBlockCreate } from '../../../__generated__/StepAndCardBlockCreate'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { CardList } from './CardList'

export interface CardPreviewProps {
  onSelect?: (step: TreeBlock<StepBlock>) => void
  selected?: TreeBlock<StepBlock>
  steps?: Array<TreeBlock<StepBlock>>
  showAddButton?: boolean
  isDraggable?: boolean
}

export const STEP_AND_CARD_BLOCK_CREATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepAndCardBlockCreate(
    $journeyId: ID!
    $stepId: ID!
    $cardId: ID
    $parentOrder: Int
  ) {
    stepBlockCreate(
      input: { id: $stepId, journeyId: $journeyId, parentOrder: $parentOrder }
    ) {
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
  isDraggable
}: CardPreviewProps): ReactElement {
  const [isDragging, setIsDragging] = useState(false)
  const [stepAndCardBlockCreate] = useMutation<StepAndCardBlockCreate>(
    STEP_AND_CARD_BLOCK_CREATE
  )
  const [stepsOrderUpdate] = useMutation<StepsOrderUpdate>(STEPS_ORDER_UPDATE)
  const { journey } = useJourney()

  const handleChange = (selectedId: string): void => {
    if (steps == null) return

    const selectedStep = steps.find(({ id }) => id === selectedId)
    selectedStep != null && onSelect?.(selectedStep)
  }

  const handleClick = async (): Promise<void> => {
    if (journey == null || steps == null) return

    const stepId = uuidv4()
    const cardId = uuidv4()
    const { data } = await stepAndCardBlockCreate({
      variables: {
        journeyId: journey.id,
        stepId,
        cardId,
        parentOrder:
          selected?.parentOrder != null ? selected.parentOrder + 1 : null
      },
      update(cache, { data }) {
        if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                // update existing parentOrder in cache
                if (selected?.parentOrder != null) {
                  existingBlockRefs.forEach((blockRef) => {
                    if ((blockRef.__ref as string).startsWith('StepBlock:')) {
                      const stepBlock = cache.readFragment<StepBlock>({
                        id: blockRef.__ref,
                        fragment: gql`
                          fragment StepBlock on StepBlock {
                            parentOrder
                          }
                        `
                      })
                      if (
                        stepBlock?.parentOrder != null &&
                        selected?.parentOrder != null &&
                        stepBlock.parentOrder > selected.parentOrder
                      ) {
                        cache.writeFragment({
                          id: blockRef.__ref,
                          fragment: gql`
                            fragment StepBlock on StepBlock {
                              parentOrder
                            }
                          `,
                          data: {
                            parentOrder: stepBlock.parentOrder + 1
                          }
                        })
                      }
                    }
                  })
                }
                const newStepBlockRef = cache.writeFragment({
                  data: {
                    ...data.stepBlockCreate
                  },
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
      onSelect?.(
        transformer([
          data.stepBlockCreate,
          data.cardBlockCreate
        ])[0] as TreeBlock<StepBlock>
      )
    }
  }

  const onBeforeCapture = (): void => {
    setIsDragging(true)
  }

  const onDragEnd = async ({ destination, source }): Promise<void> => {
    setIsDragging(false)
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
      const parentOrder = cardDragging.parentOrder + destIndex - source.index

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
  }

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
