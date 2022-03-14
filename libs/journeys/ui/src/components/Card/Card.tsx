import { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '@core/shared/ui'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { SxProps } from '@mui/system/styleFunctionSx'
import { TreeBlock } from '../..'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoFields } from '../Video/__generated__/VideoFields'
import { CardFields } from './__generated__/CardFields'
import { Cover as CardCover } from './Cover'

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

  return (
    <CardWrapper
      id={id}
      backgroundColor={backgroundColor}
      themeMode={themeMode}
      themeName={themeName}
      sx={{
        p: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundImage:
          coverBlock != null &&
          coverBlock.__typename === 'ImageBlock' &&
          coverBlock.src != null
            ? `url(${coverBlock.src})`
            : undefined
      }}
    >
      {coverBlock != null && (fullscreen == null || !fullscreen) ? (
        <>
          {coverBlock.__typename === 'ImageBlock' && (
            <CardCover imageBlock={coverBlock}>{renderedChildren}</CardCover>
          )}
          {coverBlock.__typename === 'VideoBlock' && (
            <CardCover
              videoBlock={coverBlock}
              imageBlock={
                coverBlock.children.find(
                  (block) =>
                    block.id === coverBlock.posterBlockId &&
                    block.__typename === 'ImageBlock'
                ) as TreeBlock<ImageFields>
              }
            >
              {renderedChildren}
            </CardCover>
          )}
        </>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            display: 'flex',
            position: 'relative',
            backdropFilter: coverBlock != null ? 'blur(54px)' : undefined,
            backgroundColor: (theme) =>
              coverBlock != null
                ? `${theme.palette.background.paper}88`
                : undefined,
            padding: (theme) => ({
              xs: theme.spacing(7),
              sm: theme.spacing(7, 10),
              md: theme.spacing(10)
            }),
            borderRadius: (theme) => theme.spacing(4)
          }}
        >
          <Box sx={{ margin: 'auto', width: '100%', maxWidth: 500 }}>
            {renderedChildren}
          </Box>
        </Box>
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
        backgroundImage: 'none',
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
