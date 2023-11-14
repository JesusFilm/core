import { gql, useMutation } from '@apollo/client'
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
  const [stepPrevEventCreate] = useMutation<StepPreviousEventCreate>(
    STEP_PREVIOUS_EVENT_CREATE
  )

  const { t } = useTranslation('journeys-ui')
  const theme = useTheme()
  const {
    nextActiveBlock,
    prevActiveBlock,
    blockHistory,
    treeBlocks,
    getNextBlock
  } = useBlocks()
  const { journey } = useJourney()
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

  // should always be called with nextActiveBlock() and prevActiveBlock()
  // should match with other handleNavigationEventCreate functions
  function handleNavigationEventCreate(target: 'next' | 'prev'): void {
    const id = uuidv4()
    const stepName = getStepHeading(
      activeBlock.id,
      activeBlock.children,
      treeBlocks,
      t
    )
    const targetBlock =
      target === 'next'
        ? getNextBlock({ id: undefined, activeBlock })
        : (blockHistory[blockHistory.length - 2] as TreeBlock<StepFields>)
    const targetStepName =
      targetBlock != null &&
      getStepHeading(targetBlock.id, targetBlock.children, treeBlocks, t)

    const mutationInput = {
      id,
      blockId: activeBlock.id,
      label: stepName,
      value: targetStepName
    }

    if (target === 'next') {
      void stepNextEventCreate({
        variables: {
          input: {
            ...mutationInput,
            nextStepId: targetBlock?.id
          }
        }
      })
    } else {
      void stepPrevEventCreate({
        variables: {
          input: {
            ...mutationInput,
            previousStepId: targetBlock?.id
          }
        }
      })
    }

    TagManager.dataLayer({
      dataLayer: {
        event: target === 'next' ? 'step_next' : 'step_prev',
        eventId: id,
        blockId: activeBlock.id,
        stepName,
        targetStepId: targetBlock?.id,
        targetStepName
      }
    })
  }

  const handleNavigation = (e: MouseEvent): void => {
    const view = e.view as unknown as Window
    if (rtl) {
      const divide = view.innerWidth * 0.66
      if (e.clientX <= divide) {
        if (!activeBlock?.locked) {
          handleNavigationEventCreate('next')
          nextActiveBlock()
        }
      } else {
        handleNavigationEventCreate('prev')
        prevActiveBlock()
      }
    } else {
      const divide = view.innerWidth * 0.33
      if (e.clientX >= divide) {
        if (!activeBlock?.locked) {
          handleNavigationEventCreate('next')
          nextActiveBlock()
        }
      } else {
        handleNavigationEventCreate('prev')
        prevActiveBlock()
      }
    }
  }

  return (
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
}
