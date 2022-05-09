import { ReactElement, ReactNode, useMemo, useState, useEffect } from 'react'
import { ThemeProvider, themes } from '@core/shared/ui'
import { useTheme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import { SxProps } from '@mui/system/styleFunctionSx'
import { blurImage, TreeBlock } from '../..'
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
  themeMode,
  themeName,
  fullscreen,
  wrappers
}: CardProps): ReactElement {
  const theme = useTheme()
  const [cardColor, setCardColor] = useState<string>()

  const coverBlock = children.find(
    (block) =>
      block.id === coverBlockId &&
      (block.__typename === 'ImageBlock' || block.__typename === 'VideoBlock')
  ) as TreeBlock<ImageFields | VideoFields> | undefined

  const videoBlock =
    coverBlock?.__typename === 'VideoBlock' ? coverBlock : undefined

  // ImageBlock is card cover image or video poster image
  const imageBlock =
    coverBlock?.__typename === 'ImageBlock'
      ? coverBlock
      : videoBlock != null
      ? (videoBlock.children.find(
          (block) =>
            block.id === videoBlock.posterBlockId &&
            block.__typename === 'ImageBlock'
        ) as TreeBlock<ImageFields> | undefined)
      : undefined

  const customCardTheme =
    themeName != null && themeMode != null
      ? themes[themeName][themeMode]
      : undefined

  const cardPalette = customCardTheme?.palette.cardBackground
  const colorIndex = parseInt(backgroundColor != null ? backgroundColor : '')
  const defaultCardColor = customCardTheme?.palette.background.paper

  useEffect(() => {
    if (cardPalette != null) {
      if (colorIndex > 0 && colorIndex <= cardPalette.length + 1) {
        setCardColor(cardPalette[colorIndex - 1])
      } else if (backgroundColor == null) {
        setCardColor(defaultCardColor)
      } else {
        setCardColor(backgroundColor)
      }
    }
  }, [backgroundColor, cardPalette, colorIndex, defaultCardColor])

  const blurUrl = useMemo(() => {
    return imageBlock != null
      ? blurImage(
          imageBlock.width,
          imageBlock.height,
          imageBlock.blurhash,
          cardColor ?? theme.palette.background.paper
        )
      : undefined
  }, [imageBlock, cardColor, theme.palette.background.paper])

  const renderedChildren = children
    .filter(({ id }) => id !== coverBlockId)
    .map((block) => (
      <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
    ))

  return (
    <CardWrapper
      id={id}
      backgroundColor={
        cardColor != null ? cardColor : theme.palette.background.paper
      }
      themeMode={themeMode}
      themeName={themeName}
    >
      {coverBlock != null && !fullscreen && cardColor != null ? (
        <ContainedCover
          backgroundColor={cardColor ?? theme.palette.background.paper}
          backgroundBlur={blurUrl}
          videoBlock={videoBlock}
          imageBlock={imageBlock}
        >
          {renderedChildren}
        </ContainedCover>
      ) : (
        <ExpandedCover backgroundBlur={blurUrl}>
          {renderedChildren}
        </ExpandedCover>
      )}
    </CardWrapper>
  )
}

interface CardWrapperProps
  extends Pick<
    CardFields,
    'id' | 'backgroundColor' | 'themeMode' | 'themeName'
  > {
  children: ReactNode
  sx?: SxProps
}

export function CardWrapper({
  id,
  backgroundColor,
  themeMode,
  themeName,
  children,
  sx
}: CardWrapperProps): ReactElement {
  const Card = (
    <Paper
      data-testid={id}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        borderRadius: (theme) => theme.spacing(4),
        backgroundColor,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        transform: 'translateZ(0)', // safari glitch with border radius
        ...sx
      }}
      elevation={3}
    >
      {children}
    </Paper>
  )

  if (themeMode != null && themeName != null) {
    return (
      <ThemeProvider themeMode={themeMode} themeName={themeName} nested>
        {Card}
      </ThemeProvider>
    )
  } else {
    return Card
  }
}
