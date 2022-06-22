import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { BlockRenderer, TreeBlock, useJourney } from '@core/journeys/ui'
import { ThemeProvider } from '@core/shared/ui'
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
}

export function CardList({
  steps,
  selected,
  showAddButton,
  droppableProvided,
  handleClick,
  handleChange,
  isDragging
}: CardListProps): ReactElement {
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
      insert={showAddButton === true && <AddCardSlide />}
      insertPosition={steps.findIndex(({ id }) => id === selected?.id)}
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
}

const CardItem = ({
  step,
  id,
  provided,
  snapshot
}: CardItemProps): ReactElement => {
  const { journey } = useJourney()

  return (
    <Box
      ref={provided != null ? provided.innerRef : null}
      id={id}
      key={id}
      data-testid={`preview-${id}`}
      sx={{
        width: 95,
        height: 140,
        position: 'relative',
        top: provided != null ? -24 : undefined
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
        <FramePortal width={380} height={560}>
          <ThemeProvider
            themeName={journey?.themeName ?? ThemeName.base}
            themeMode={journey?.themeMode ?? ThemeMode.light}
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
