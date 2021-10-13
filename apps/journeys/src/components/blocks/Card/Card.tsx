import { TreeBlock } from '../../../libs/transformer/transformer'
import { forwardRef, ReactElement, ReactNode, useEffect, useRef } from 'react'
import { BlockRenderer } from '../../BlockRenderer'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../__generated__/GetJourney'
import { ThemeProvider, themes } from '@core/shared/ui'
import { Paper, useTheme } from '@mui/material'
import { decode } from 'blurhash'
import { Image } from '..'

export function Card({
  id,
  children,
  backgroundColor,
  coverBlockId,
  themeMode,
  themeName
}: TreeBlock<CardBlock>): ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const coverBlock = children.find(
    (block) => block.id === coverBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageBlock> | undefined

  useEffect(() => {
    if (coverBlock != null && ref.current != null) {
      const pixels = decode(
        coverBlock.blurhash,
        coverBlock.width,
        coverBlock.height,
        5
      )

      const canvas = document.createElement('canvas')
      canvas.setAttribute('width', `${coverBlock.width}px`)
      canvas.setAttribute('height', `${coverBlock.height}px`)
      const context = canvas.getContext('2d')
      if (context != null) {
        const imageData = context.createImageData(
          coverBlock.width,
          coverBlock.height
        )
        imageData.data.set(pixels)
        context.putImageData(imageData, 0, 0)
        if (themeMode != null && themeName != null) {
          context.fillStyle = `${themes[themeName][themeMode].palette.background.paper}88`
        } else {
          context.fillStyle = `${theme.palette.background.paper}88`
        }
        context.fillRect(0, 0, coverBlock.width, coverBlock.height)
        const dataURL = canvas.toDataURL('image/webp')
        ref.current.style.backgroundImage = `url(${dataURL})`
      }
    }
  }, [coverBlock, ref, theme, themeMode, themeName])

  return (
    <CardWrapper
      id={id}
      backgroundColor={backgroundColor}
      themeMode={themeMode}
      themeName={themeName}
      ref={ref}
    >
      {coverBlock != null && (
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

export const CardWrapper = forwardRef<HTMLDivElement, CardWrapperProps>(
  function CardWrapper(
    { id, backgroundColor, themeMode, themeName, children },
    ref
  ): ReactElement {
    const Card = (
      <Paper
        data-testid={id}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 7,
          borderRadius: (theme) => theme.spacing(3),
          backgroundColor,
          backgroundSize: 'cover'
        }}
        elevation={3}
        ref={ref}
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
)
