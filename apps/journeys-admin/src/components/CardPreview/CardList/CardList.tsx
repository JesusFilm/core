import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Divider from '@mui/material/Divider'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ReactElement } from 'react'
import type {
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
import DragIcon from '@core/shared/ui/icons/Drag'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import TargetIcon from '@core/shared/ui/icons/Target'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import {
  Role,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { useUserRoleQuery } from '../../../libs/useUserRoleQuery'
import { VideoWrapper } from '../../Editor/Canvas/VideoWrapper'
import { FramePortal } from '../../FramePortal'
import { HorizontalSelect } from '../../HorizontalSelect'
import { NavigationCard } from '../NavigationCard'

import { CardWrapper } from './CardWrapper'

const Draggable = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "react-beautiful-dnd" */
      'react-beautiful-dnd'
    ).then((mod) => mod.Draggable),
  { ssr: false }
)

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

  const { data } = useUserRoleQuery()
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
          <Plus2Icon color="primary" />
        </CardActionArea>
      </Card>
    )
  }

  let selectedId: string | undefined
  switch (journeyEditContentComponent) {
    case ActiveJourneyEditContent.Action:
      selectedId = 'goals'
      break
    case ActiveJourneyEditContent.SocialPreview:
      selectedId = 'social'
      break
    case ActiveJourneyEditContent.JourneyFlow:
      selectedId = 'journeyFlow'
      break
    default:
      selectedId = selected?.id
  }

  return (
    <HorizontalSelect
      onChange={handleChange}
      id={selectedId}
      isDragging={isDragging}
      footer={showAddButton === true && <AddCardSlide />}
      testId="CardList"
    >
      {showNavigation === true && (
        <NavigationCard
          key="goals"
          id="goals"
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
              <TargetIcon color="error" />
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
          title="Social Media"
          destination={ActiveJourneyEditContent.SocialPreview}
          header={
            journey?.primaryImageBlock?.src == null ? (
              <Box
                bgcolor={(theme) => theme.palette.background.default}
                borderRadius="4px"
                width={72}
                height={72}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <ThumbsUpIcon color="error" />
              </Box>
            ) : (
              <Image
                src={journey.primaryImageBlock.src}
                alt={journey.primaryImageBlock.src}
                width={72}
                height={72}
                style={{
                  borderRadius: '4px',
                  objectFit: 'cover'
                }}
              />
            )
          }
          loading={journey == null}
        />
      )}
      {showNavigation === true && (
        <NavigationCard
          key="journeyFlow"
          id="journeyFlow"
          title="Flow"
          destination={ActiveJourneyEditContent.JourneyFlow}
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
              <TargetIcon color="error" />
            </Box>
          }
          loading={journey == null}
        />
      )}
      {droppableProvided != null &&
        steps.map((step, index) => (
          <Draggable key={step.id} draggableId={step.id} index={index}>
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
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  return (
    <Box
      ref={provided != null ? provided.innerRef : null}
      id={id}
      key={id}
      data-testid={`CardItem-${id}`}
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
          <DragIcon sx={{ opacity: snapshot.isDragging ? 1 : 0.5 }} />
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
            themeName={cardBlock?.themeName ?? ThemeName.base}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
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
