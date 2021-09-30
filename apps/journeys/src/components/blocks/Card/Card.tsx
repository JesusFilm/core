import { TreeBlock } from '../../../libs/transformer/transformer'
import { ReactElement, ReactNode } from 'react'
import { BlockRenderer } from '../../BlockRenderer'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '@core/shared/ui'
import { Paper, Box } from '@mui/material'
import { Image } from '..'

export function Card({
  id,
  children,
  backgroundColor,
  coverBlockId,
  themeMode,
  themeName
}: TreeBlock<CardBlock>): ReactElement {
  const coverBlock = children.find(
    (block) => block.id === coverBlockId && block.__typename === 'ImageBlock'
  )

  return (
    <CardWrapper themeMode={themeMode} themeName={themeName}>
      <Paper
        data-testid={id}
        sx={{
          p: 7,
          borderRadius: (theme) => theme.spacing(3),
          backgroundColor
        }}
        elevation={3}
      >
        {coverBlock != null && coverBlock.__typename === 'ImageBlock' && (
          <Box
            sx={{
              m: -7,
              mb: 7,
              borderTopLeftRadius: (theme) => theme.spacing(3),
              borderTopRightRadius: (theme) => theme.spacing(3),
              overflow: 'hidden'
            }}
          >
            <Image {...coverBlock} alt={coverBlock.alt} />
          </Box>
        )}
        {children
          .filter(({ id }) => id !== coverBlockId)
          .map((block) => (
            <BlockRenderer {...block} key={block.id} />
          ))}
      </Paper>
    </CardWrapper>
  )
}

interface CardWrapperProps
  extends Pick<TreeBlock<CardBlock>, 'themeMode' | 'themeName'> {
  children: ReactNode
}

function CardWrapper({
  themeMode,
  themeName,
  children
}: CardWrapperProps): ReactElement {
  if (themeMode != null && themeName != null) {
    return (
      <ThemeProvider themeMode={themeMode} themeName={themeName} nested>
        {children}
      </ThemeProvider>
    )
  } else {
    return <>{children}</>
  }
}
