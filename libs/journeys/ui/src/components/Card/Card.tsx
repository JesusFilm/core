import { ReactElement, ReactNode, useMemo } from 'react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { getTheme } from '@core/shared/ui/themes'
import { useTheme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import { SxProps } from '@mui/system/styleFunctionSx'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TreeBlock } from '../../libs/block'
import { blurImage } from '../../libs/blurImage'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoFields } from '../Video/__generated__/VideoFields'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
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
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)

  const customCardTheme =
    themeName != null && themeMode != null
      ? getTheme({ themeName, themeMode, rtl, locale })
      : undefined

  const cardColor =
    backgroundColor != null
      ? backgroundColor
      : customCardTheme != null
      ? customCardTheme.palette.background.paper
      : theme.palette.background.paper

  const coverBlock = children.find(
    (block) =>
      block.id === coverBlockId &&
      (block.__typename === 'ImageBlock' || block.__typename === 'VideoBlock')
  ) as TreeBlock<ImageFields | VideoFields> | undefined

  const videoBlock =
    coverBlock?.__typename === 'VideoBlock' ? coverBlock : undefined

  const imageBlock =
    coverBlock?.__typename === 'ImageBlock' ? coverBlock : undefined

  // const blurUrl = useMemo(() => {
  //   return imageBlock != null
  //     ? blurImage(imageBlock.blurhash, cardColor)
  //     : undefined
  // }, [imageBlock, cardColor])

  const renderedChildren = children
    .filter(({ id }) => id !== coverBlockId)
    .map((block) => (
      <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
    ))

  return (
    <CardWrapper
      id={id}
      backgroundColor={backgroundColor}
      themeMode={themeMode}
      themeName={themeName}
      title={journey?.seoTitle ?? journey?.title ?? ''}
    >
      <Box
        className="swiper-no-swiping"
        sx={{
          width: '100%',
          height: '50px',
          position: 'absolute',
          zIndex: 1,
          background: `linear-gradient(${cardColor}4d 10%, ${cardColor}00 100%)`
        }}
      />
      {coverBlock != null && !fullscreen ? (
        <ContainedCover
          backgroundBlur={cardColor}
          videoBlock={videoBlock}
          imageBlock={imageBlock}
        >
          {renderedChildren}
        </ContainedCover>
      ) : (
        <ExpandedCover imageBlock={imageBlock} backgroundBlur={cardColor}>
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
  title: string
  sx?: SxProps
}

export function CardWrapper({
  id,
  backgroundColor,
  themeMode,
  themeName,
  children,
  title,
  sx
}: CardWrapperProps): ReactElement {
  const Card = (
    <Paper
      data-testid={id}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        backgroundColor,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transform: 'translateZ(0)', // safari glitch with border radius
        ...sx
      }}
      elevation={3}
    >
      {children}
      <Stack
        className="swiper-no-swiping"
        sx={{ zIndex: 1, px: 4 }}
        direction="row"
        spacing={3}
      >
        <Chip label="Share" />
        <Chip label="Like" />
        <Chip label="Dislike" />
      </Stack>
      <Typography
        className="swiper-no-swiping"
        color="primary"
        sx={{ zIndex: 1, px: 4, py: 3 }}
      >
        {title}
      </Typography>
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
