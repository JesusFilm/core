import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { ReactElement, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { ActiveContent } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { useBlockOrderUpdateMutation } from '../../libs/useBlockOrderUpdateMutation'
import { useStepAndCardBlockCreateMutation } from '../../libs/useStepAndCardBlockCreateMutation'

import { CardList } from './CardList'
import { OnSelectProps } from './OnSelectProps'

const DragDropContext = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "react-beautiful-dnd" */
      'react-beautiful-dnd'
    ).then((mod) => mod.DragDropContext),
  { ssr: false }
)

const Droppable = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "react-beautiful-dnd" */
      'react-beautiful-dnd'
    ).then((mod) => mod.Droppable),
  { ssr: false }
)

export interface CardPreviewProps {
  onSelect?: ({ step, view }: OnSelectProps) => void
  selected?: TreeBlock<StepBlock>
  steps?: Array<TreeBlock<StepBlock>>
  showAddButton?: boolean
  isDraggable?: boolean
  showNavigationCards?: boolean
  testId?: string
}

export function CardPreview({
  steps,
  selected,
  onSelect,
  showAddButton,
  isDraggable,
  showNavigationCards,
  testId
}: CardPreviewProps): ReactElement {
  const [isDragging, setIsDragging] = useState(false)
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()
  const [stepsOrderUpdate] = useBlockOrderUpdateMutation()
  const { journey } = useJourney()

  const handleChange = (selectedId: string): void => {
    switch (selectedId) {
      case 'goals':
        onSelect?.({ view: ActiveContent.Goals })
        return
      case 'social':
        onSelect?.({ view: ActiveContent.Social })
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
        stepBlockCreateInput: {
          id: stepId,
          journeyId: journey.id
        },
        cardBlockCreateInput: {
          id: cardId,
          journeyId: journey.id,
          parentBlockId: stepId,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
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
          data-testid={`CardPreview${testId ?? ''}`}
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
