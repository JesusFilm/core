import { TreeBlock } from '../../../libs/transformer/transformer'
import { ReactElement, ReactNode } from 'react'
import { BlockRenderer } from '../../BlockRenderer'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '@core/shared/ui'
import { Paper, Box } from '@mui/material'
import { SxProps } from '@mui/system'
import { CardWithCover } from '.'

export function Card({
  id,
  children,
  backgroundColor,
  coverBlockId,
  themeMode,
  themeName,
  fullscreen
}: TreeBlock<CardBlock>): ReactElement {
  const coverBlock = children.find(
    (block) => block.id === coverBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageBlock> | undefined

  const renderedChildren = children
    .filter(({ id }) => id !== coverBlockId)
    .map((block) => <BlockRenderer {...block} key={block.id} />)

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
        backgroundImage: {
          // We don't want the background image to peek though
          // while card is loading on the smaller sizes.
          md: coverBlock != null ? `url(${coverBlock.src})` : undefined
        }
      }}
    >
      {coverBlock != null && (fullscreen == null || !fullscreen) ? (
        <CardWithCover
          coverBlock={coverBlock}
          themeMode={themeMode}
          themeName={themeName}
        >
          {renderedChildren}
        </CardWithCover>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            display: 'flex',
            backdropFilter: coverBlock != null ? 'blur(54px)' : undefined,
            backgroundColor: (theme) =>
              coverBlock != null
                ? `${theme.palette.background.paper}88`
                : undefined,
            padding: (theme) => ({
              xs: theme.spacing(7),
              sm: theme.spacing(7, 10),
              md: theme.spacing(10, 0)
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
    CardBlock,
    'id' | 'backgroundColor' | 'themeMode' | 'themeName'
  > {
  children: ReactNode
  sx?: SxProps
}

export const CardWrapper = ({
  id,
  backgroundColor,
  themeMode,
  themeName,
  children,
  sx
}: CardWrapperProps): ReactElement => {
  const Card = (
    <Paper
      data-testid={id}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        borderRadius: (theme) => theme.spacing(4),
        backgroundColor,
        height: '100%',
        p: 7,
        overflow: 'hidden',
        position: 'relative',
        maxWidth: {
          sm: 660,
          md: 854
        },
        maxHeight: {
          xs: 670,
          sm: 280,
          md: 480
        },
        margin: '0 auto',
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
