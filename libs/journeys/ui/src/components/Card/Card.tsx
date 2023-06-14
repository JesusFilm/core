import { ReactElement, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import type { TreeBlock } from '../../libs/block'
import { blurImage } from '../../libs/blurImage'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { ImageFields } from '../Image/__generated__/ImageFields'
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

  const cardColor =
    backgroundColor != null
      ? backgroundColor
      : // Card theme is determined in Conductor
        theme.palette.background.paper

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

  return (
    <Paper
      data-testid={id}
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
