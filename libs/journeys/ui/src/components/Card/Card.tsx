import { ReactElement, ReactNode, useMemo } from 'react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { getTheme } from '@core/shared/ui/themes'
import { useTheme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import { SxProps } from '@mui/system/styleFunctionSx'
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

  return (
    <CardWrapper
      id={id}
      backgroundColor={backgroundColor}
      themeMode={themeMode}
      themeName={themeName}
      rtl={rtl}
      locale={locale}
      title={journey?.seoTitle ?? journey?.title ?? ''}
    >
      {coverBlock != null && !fullscreen ? (
        <ContainedCover
          backgroundColor={cardColor}
          backgroundBlur={blurUrl}
          videoBlock={videoBlock}
          imageBlock={imageBlock}
        >
          {renderedChildren}
        </ContainedCover>
      ) : (
        <ExpandedCover
          backgroundColor={cardColor}
          backgroundBlur={blurUrl}
          imageBlock={imageBlock}
          isVideoOnlyCard={
            children.length === 1 && children[0].__typename === 'VideoBlock'
          }
        >
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
  rtl?: boolean
  locale?: string
  sx?: SxProps
}

export function CardWrapper({
  id,
  backgroundColor,
  themeMode,
  themeName,
  children,
  rtl = false,
  locale,
  sx
}: CardWrapperProps): ReactElement {
  const Card = (
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
      <ThemeProvider
        themeMode={themeMode}
        themeName={themeName}
        rtl={rtl}
        locale={locale}
        nested
      >
        {Card}
      </ThemeProvider>
    )
  } else {
    return Card
  }
}
