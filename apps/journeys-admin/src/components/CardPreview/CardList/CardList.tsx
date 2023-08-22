import { useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import DragHandleRounded from '@mui/icons-material/DragHandleRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Divider from '@mui/material/Divider'
import Image from 'next/image'
import { ReactElement } from 'react'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided
} from 'react-beautiful-dnd'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import Target from '@core/shared/ui/icons/Target'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { GetUserRole } from '../../../../__generated__/GetUserRole'
import {
  Role,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { CardWrapper } from '../../Editor/Canvas/CardWrapper'
import { VideoWrapper } from '../../Editor/Canvas/VideoWrapper'
import { useSocialPreview } from '../../Editor/SocialProvider'
import { FramePortal } from '../../FramePortal'
import { GET_USER_ROLE } from '../../JourneyView/JourneyView'
import { ScrollableSelect } from '../../ScrollableSelect'
import { NavigationCard } from '../NavigationCard'

interface CardListProps {
  steps: Array<TreeBlock<StepBlock>>
  selected?: TreeBlock<StepBlock>
  showAddButton?: boolean
  droppableProvided?: DroppableProvided
  handleClick?: () => void
  handleChange?: (selectedId: string) => void
  isDragging?: boolean
  isDraggable?: boolean
  showNavigationCards?: boolean
}

export function CardList({
  steps,
  selected,
  showAddButton,
  droppableProvided,
  handleClick,
  handleChange,
  isDragging,
  isDraggable,
  showNavigationCards = false
}: CardListProps): ReactElement {
  const {
    state: { journeyEditContentComponent }
  } = useEditor()
  const { journey } = useJourney()
  const { primaryImageBlock } = useSocialPreview()

  const { data } = useQuery<GetUserRole>(GET_USER_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  const showNavigation =
    showNavigationCards && (journey?.template !== true || isPublisher)

  function AddCardSlide(): ReactElement {
    return (
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
  }

  const selectedId =
    journeyEditContentComponent === ActiveJourneyEditContent.Action
      ? 'goals'
      : journeyEditContentComponent === ActiveJourneyEditContent.SocialPreview
      ? 'social'
      : selected?.id

  return (
    <ScrollableSelect
      onChange={handleChange}
      id={selectedId}
      isDragging={isDragging}
      footer={showAddButton === true && <AddCardSlide />}
      // sx={{
      //   width:'200px',
      //   height:'100%',
      //   position: 'absolute',
      //   zIndex:99,
      //   scrollbarWidth: 'none',
      //   '&::-webkit-scrollbar': {
      //     display: 'none'
      //   }
      // }}
    >
      {showNavigation === true && (
        <NavigationCard
          key="goals"
          id="goals"
          testId="goals-navigation-card"
          title="Goals"
          destination={ActiveJourneyEditContent.Action}
          header={
            <Box
              bgcolor={(theme) => theme.palette.background.paper}
              borderRadius={1}
              width={72}
              height={72}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Target color="error" />
            </Box>
          }
          loading={journey == null}
        />
      )}
      {showNavigation === true && (
        <Divider
          id="cardlist-divider"
          orientation="vertical"
          sx={{
            borderWidth: 1,
            mr: 1
          }}
        />
      )}
      {showNavigation === true && (
        <NavigationCard
          key="social"
          id="social"
          testId="social-preview-navigation-card"
          title="Social Media"
          destination={ActiveJourneyEditContent.SocialPreview}
          header={
            primaryImageBlock?.src == null ? (
              <Box
                bgcolor={(theme) => theme.palette.background.default}
                borderRadius="4px"
                width={72}
                height={72}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <ThumbsUp color="error" />
              </Box>
            ) : (
              <Image
                src={primaryImageBlock?.src}
                alt={primaryImageBlock?.src}
                width={72}
                height={72}
                objectFit="cover"
                style={{ borderRadius: '4px' }}
              />
            )
          }
          loading={journey == null}
        />
      )}
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
    </ScrollableSelect>
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
        display: 'flex',
        flexDirection: 'column',
        width: 95,
        position: 'relative',
        height: isDraggable === true ? 164 : 140,
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
            <Box sx={{ p: 4, height: '100%', borderRadius: 4 }}>
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
