import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import { MouseEvent, ReactElement, useEffect, useMemo } from 'react'

import { TreeBlock, useBlocks } from '../../libs/block'
import { blurImage } from '../../libs/blurImage'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
// eslint-disable-next-line import/no-cycle
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { StepFields } from '../Step/__generated__/StepFields'
import { VideoFields } from '../Video/__generated__/VideoFields'

import { CardFields } from './__generated__/CardFields'
import { ContainedCover } from './ContainedCover'
import { ExpandedCover } from './ExpandedCover'

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
  const theme = useTheme()
  const { nextActiveBlock, prevActiveBlock, blockHistory } = useBlocks()
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

  const handleNavigation = (e: MouseEvent): void => {
    const view = e.view as unknown as Window
    if (rtl) {
      const divide = view.innerWidth * 0.66
      if (e.clientX <= divide) {
        if (!activeBlock?.locked) nextActiveBlock()
      } else {
        prevActiveBlock()
      }
    } else {
      const divide = view.innerWidth * 0.33
      if (e.clientX >= divide) {
        if (!activeBlock?.locked) nextActiveBlock()
      } else {
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
