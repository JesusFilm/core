import { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '@core/shared/ui'
import Paper from '@mui/material/Paper'
import { SxProps } from '@mui/system/styleFunctionSx'
import { TreeBlock } from '../..'
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
  const coverBlock = children.find((block) => block.id === coverBlockId) as
    | TreeBlock<ImageFields | VideoFields>
    | undefined

  const renderedChildren = children
    .filter(({ id }) => id !== coverBlockId)
    .map((block) => (
      <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
    ))

  const cardColor =
    backgroundColor != null ? backgroundColor : 'background.paper'

  return (
    <CardWrapper
      id={id}
      backgroundColor={backgroundColor}
      themeMode={themeMode}
      themeName={themeName}
    >
      {coverBlock != null && (fullscreen == null || !fullscreen) ? (
        <>
          {coverBlock.__typename === 'ImageBlock' && (
            <ContainedCover backgroundColor={cardColor} imageBlock={coverBlock}>
              {renderedChildren}
            </ContainedCover>
          )}
          {coverBlock.__typename === 'VideoBlock' && (
            <ContainedCover
              backgroundColor={cardColor}
              videoBlock={coverBlock}
              imageBlock={
                coverBlock.children.find(
                  (block) =>
                    block.id === coverBlock.posterBlockId &&
                    block.__typename === 'ImageBlock'
                ) as TreeBlock<ImageFields> | undefined
              }
            >
              {renderedChildren}
            </ContainedCover>
          )}
        </>
      ) : (
        <ExpandedCover coverBlock={coverBlock}>
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
