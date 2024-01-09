import { gql, useMutation } from '@apollo/client'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import { MouseEvent, ReactElement, useEffect, useMemo } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock, useBlocks } from '../../libs/block'
import { blurImage } from '../../libs/blurImage'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
// eslint-disable-next-line import/no-cycle
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { StepFields } from '../Step/__generated__/StepFields'
import { VideoFields } from '../Video/__generated__/VideoFields'

import { CardFields } from './__generated__/CardFields'
import { StepNextEventCreate } from './__generated__/StepNextEventCreate'
import { StepPreviousEventCreate } from './__generated__/StepPreviousEventCreate'
import { ContainedCover } from './ContainedCover'
import { ExpandedCover } from './ExpandedCover'

export const STEP_NEXT_EVENT_CREATE = gql`
  mutation StepNextEventCreate($input: StepNextEventCreateInput!) {
    stepNextEventCreate(input: $input) {
      id
    }
  }
`

export const STEP_PREVIOUS_EVENT_CREATE = gql`
  mutation StepPreviousEventCreate($input: StepPreviousEventCreateInput!) {
    stepPreviousEventCreate(input: $input) {
      id
    }
  }
`

interface CardProps extends TreeBlock<CardFields> {
  wrappers?: WrappersProps
}

export function Card({
  id,
  children,
  backgroundColor,
  coverBlockId,
  fullscreen,
  wrappers
}: CardProps): ReactElement {
  const [stepNextEventCreate] = useMutation<StepNextEventCreate>(
    STEP_NEXT_EVENT_CREATE
  )
  const [stepPreviousEventCreate] = useMutation<StepPreviousEventCreate>(
    STEP_PREVIOUS_EVENT_CREATE
  )

  const { t } = useTranslation('journeys-ui')
  const theme = useTheme()
  const {
    nextActiveBlock,
    previousActiveBlock,
    blockHistory,
    treeBlocks,
    getNextBlock
  } = useBlocks()
  const { journey, variant } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const cardColor =
    backgroundColor != null
      ? backgroundColor
      : // Card theme is determined in Conductor
        theme.palette.background.paper

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', cardColor)
  }, [cardColor])

  const coverBlock = children.find(
    (block) =>
      block.id === coverBlockId &&
      (block.__typename === 'ImageBlock' || block.__typename === 'VideoBlock')
  ) as TreeBlock<ImageFields | VideoFields> | undefined

  const videoBlock =
    coverBlock?.__typename === 'VideoBlock' ? coverBlock : undefined

  const imageBlock =
    coverBlock?.__typename === 'ImageBlock' ? coverBlock : undefined

  const blurUrl = useMemo(
    () =>
      imageBlock != null
        ? blurImage(imageBlock.blurhash, cardColor)
        : undefined,
    [imageBlock, cardColor]
  )

  const renderedChildren = children
    .filter(({ id }) => id !== coverBlockId)
    .map((block) => (
      <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
    ))

  const hasFullscreenVideo =
    children.find(
      (child) => child.__typename === 'VideoBlock' && child.id !== coverBlockId
    ) != null

  // should always be called with nextActiveBlock()
  // should match with other handleNextNavigationEventCreate functions
  // places used:
  // libs/journeys/ui/src/components/Card/Card.tsx
  // journeys/src/components/Conductor/NavigationButton/NavigationButton.tsx
  function handleNextNavigationEventCreate(): void {
    const id = uuidv4()
    const stepName = getStepHeading(
      activeBlock.id,
      activeBlock.children,
      treeBlocks,
      t
    )
    const targetBlock = getNextBlock({ id: undefined, activeBlock })
    const targetStepName =
      targetBlock != null &&
      getStepHeading(targetBlock.id, targetBlock.children, treeBlocks, t)

    void stepNextEventCreate({
      variables: {
        input: {
          id,
          blockId: activeBlock.id,
          label: stepName,
          value: targetStepName,
          nextStepId: targetBlock?.id
        }
      }
    })

    TagManager.dataLayer({
      dataLayer: {
        event: 'step_next',
        eventId: id,
        blockId: activeBlock.id,
        stepName,
        targetStepId: targetBlock?.id,
        targetStepName
      }
    })
  }

  // should always be called with previousActiveBlock()
  // should match with other handlePreviousNavigationEventCreate functions
  // places used:
  // libs/journeys/ui/src/components/Card/Card.tsx
  // journeys/src/components/Conductor/NavigationButton/NavigationButton.tsx
  function handlePreviousNavigationEventCreate(): void {
    const id = uuidv4()
    const stepName = getStepHeading(
      activeBlock.id,
      activeBlock.children,
      treeBlocks,
      t
    )
    const targetBlock = blockHistory[
      blockHistory.length - 2
    ] as TreeBlock<StepFields>
    const targetStepName =
      targetBlock != null &&
      getStepHeading(targetBlock.id, targetBlock.children, treeBlocks, t)

    void stepPreviousEventCreate({
      variables: {
        input: {
          id,
          blockId: activeBlock.id,
          label: stepName,
          value: targetStepName,
          previousStepId: targetBlock?.id
        }
      }
    })

    TagManager.dataLayer({
      dataLayer: {
        event: 'step_prev',
        eventId: id,
        blockId: activeBlock.id,
        stepName,
        targetStepId: targetBlock?.id,
        targetStepName
      }
    })
  }
  const handleNavigation = (e: MouseEvent): void => {
    if (variant === 'admin') return
    const view = e.view as unknown as Window
    if (rtl) {
      const divide = view.innerWidth * 0.66
      if (e.clientX <= divide) {
        if (!activeBlock?.locked) {
          handleNextNavigationEventCreate()
          nextActiveBlock()
        }
      } else {
        handlePreviousNavigationEventCreate()
        previousActiveBlock()
      }
    } else {
      const divide = view.innerWidth * 0.33
      if (e.clientX >= divide) {
        if (!activeBlock?.locked) {
          handleNextNavigationEventCreate()
          nextActiveBlock()
        }
      } else {
        handlePreviousNavigationEventCreate()
        previousActiveBlock()
      }
    }
  }

  const Card: ReactElement = (
    <Paper
      data-testid={`JourneysCard-${id}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        borderRadius: { xs: 'inherit', lg: 3 },
        backgroundColor,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transform: 'translateZ(0)' // safari glitch with border radius
      }}
      elevation={3}
      onClick={handleNavigation}
    >
      {coverBlock != null && !fullscreen ? (
        <ContainedCover
          backgroundColor={cardColor}
          backgroundBlur={blurUrl}
          videoBlock={videoBlock}
          imageBlock={imageBlock}
          hasFullscreenVideo={hasFullscreenVideo}
        >
          {renderedChildren}
        </ContainedCover>
      ) : (
        <ExpandedCover
          backgroundColor={cardColor}
          backgroundBlur={blurUrl}
          imageBlock={imageBlock}
          hasFullscreenVideo={hasFullscreenVideo}
        >
          {renderedChildren}
        </ExpandedCover>
      )}
    </Paper>
  )

  const WrappedCard = enhance(variant, id, activeBlock?.children[0].id)

  return WrappedCard(Card)
}

const enhance = (
  variant: 'default' | 'admin' | 'embed' | undefined,
  cardId: string,
  activeCardId?: string
) =>
  function component(baseComponent: ReactElement) {
    if (variant === 'default') {
      return (
        <Fade in={activeCardId === cardId} mountOnEnter unmountOnExit>
          {baseComponent}
        </Fade>
      )
    } else {
      return baseComponent
    }
  }
