import { TreeBlock } from '../../../libs/transformer/transformer'
import { ReactElement, ReactNode } from 'react'
import { BlockRenderer } from '../../BlockRenderer'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '@core/shared/ui'
import { Paper } from '@mui/material'
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
    <CardWrapper
      id={id}
      backgroundColor={backgroundColor}
      themeMode={themeMode}
      themeName={themeName}
    >
      {coverBlock != null && coverBlock.__typename === 'ImageBlock' && (
        <Image
          {...coverBlock}
          alt={coverBlock.alt}
          sx={{
            mx: -7,
            mt: -7,
            mb: 7,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          }}
        />
      )}
      {children
        .filter(({ id }) => id !== coverBlockId)
        .map((block) => (
          <BlockRenderer {...block} key={block.id} />
        ))}
    </CardWrapper>
  )
}

interface CardWrapperProps
  extends Pick<
    CardBlock,
    'id' | 'backgroundColor' | 'themeMode' | 'themeName'
  > {
  children: ReactNode
}

export function CardWrapper({
  id,
  backgroundColor,
  themeMode,
  themeName,
  children
}: CardWrapperProps): ReactElement {
  const Card = (
    <Paper
      data-testid={id}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 7,
        borderRadius: (theme) => theme.spacing(3),
        backgroundColor,
        backgroundImage: 'none',
        width: '100%',
        overflow: 'scroll'
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
