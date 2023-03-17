import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import AddIcon from '@mui/icons-material/Add'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import DragHandleRounded from '@mui/icons-material/DragHandleRounded'
import {
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot
} from 'react-beautiful-dnd'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { FramePortal } from '../../FramePortal'
import { ThemeName, ThemeMode } from '../../../../__generated__/globalTypes'
import { HorizontalSelect } from '../../HorizontalSelect'
import { VideoWrapper } from '../../Editor/Canvas/VideoWrapper'
import { CardWrapper } from '../../Editor/Canvas/CardWrapper'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'

interface CardListProps {
  steps: Array<TreeBlock<StepBlock>>
  selected?: TreeBlock<StepBlock>
  showAddButton?: boolean
  droppableProvided?: DroppableProvided
  handleClick?: () => void
  handleChange?: (selectedId: string) => void
  isDragging?: boolean
  isDraggable?: boolean
}

export function CardList({
  steps,
  selected,
  showAddButton,
  droppableProvided,
  handleClick,
  handleChange,
  isDragging,
  isDraggable
}: CardListProps): ReactElement {
  const { state } = useEditor()
  const AddCardSlide = (): ReactElement => (
    <Card
      id="CardPreviewAddButton"
      variant="outlined"
      sx={{
        display: 'flex',
        width: 87,
        height: 132,
        m: 1
      }}
    >
      <CardActionArea
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onClick={handleClick}
      >
        <AddIcon color="primary" />
      </CardActionArea>
    </Card>
  )
  return (
    <HorizontalSelect
      onChange={handleChange}
      id={selected?.id}
      isDragging={isDragging}
      footer={showAddButton === true && <AddCardSlide />}
      view={state.journeyEditContentComponent}
    >
      {droppableProvided != null &&
        steps.map((step, index) => (
          <Draggable
            key={step.id}
            id={step.id}
            draggableId={step.id}
            index={index}
          >
            {(provided, snapshot) => (
              <CardItem
                key={step.id}
                id={step.id}
                provided={provided}
                step={step}
                snapshot={snapshot}
                isDraggable={isDraggable}
              />
            )}
          </Draggable>
        ))}
      {droppableProvided == null &&
        steps.map((step) => (
          <CardItem key={step.id} id={step.id} step={step} />
        ))}
      {droppableProvided != null ? droppableProvided.placeholder : null}
    </HorizontalSelect>
  )
}

interface CardItemProps {
  step: TreeBlock<StepBlock>
  id: string
  provided?: DraggableProvided
  snapshot?: DraggableStateSnapshot
  isDraggable?: boolean
}

const CardItem = ({
  step,
  id,
  provided,
  snapshot,
  isDraggable
}: CardItemProps): ReactElement => {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)

  return (
    <Box
      ref={provided != null ? provided.innerRef : null}
      id={id}
      key={id}
      data-testid={`preview-${id}`}
      sx={{
        width: 95,
        position: 'relative',
        height: isDraggable === true ? 160 : 140,
        top: isDraggable === true ? '-24px' : undefined,
        mb: isDraggable === true ? '-24px' : undefined,
        overflow: isDraggable === true ? 'hidden' : undefined
      }}
      {...(provided != null ? provided.draggableProps : {})}
    >
      {provided != null && snapshot != null && (
        <Box
          {...(provided != null ? provided.dragHandleProps : {})}
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <DragHandleRounded
            sx={{
              opacity: snapshot.isDragging === true ? 1 : 0.5
            }}
          />
        </Box>
      )}
      <Box
        sx={{
          transform: 'scale(0.25)',
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: 380,
            height: 560,
            zIndex: 2,
            cursor: 'pointer'
          }}
        />
        <FramePortal width={380} height={560} dir={rtl ? 'rtl' : 'ltr'}>
          <ThemeProvider
            themeName={journey?.themeName ?? ThemeName.base}
            themeMode={journey?.themeMode ?? ThemeMode.light}
            rtl={rtl}
            locale={locale}
          >
            <Box sx={{ p: 4, height: '100%' }}>
              <BlockRenderer
                block={step}
                wrappers={{
                  VideoWrapper,
                  CardWrapper
                }}
              />
            </Box>
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}
