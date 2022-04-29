import { ReactElement, ReactNode, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { NextImage } from '@core/shared/ui'
import Box from '@mui/material/Box'
import { blurImage, TreeBlock } from '../../..'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'

interface ExpandedCoverProps {
  children: ReactNode
  coverBlock?: TreeBlock<ImageFields | VideoFields>
}

export function ExpandedCover({
  children,
  coverBlock
}: ExpandedCoverProps): ReactElement {
  const theme = useTheme()
  const blurUrl = useMemo(() => {
    return coverBlock?.__typename === 'ImageBlock'
      ? blurImage(
          coverBlock.width,
          coverBlock.height,
          coverBlock.blurhash,
          theme.palette.background.paper
        )
      : undefined
  }, [coverBlock, theme])

  return (
    <Box
      data-testid="ExpandedCover"
      sx={{
        flexGrow: 1,
        overflow: 'auto',
        display: 'flex',
        padding: (theme) => ({
          xs: theme.spacing(7),
          sm: theme.spacing(7, 10),
          md: theme.spacing(10)
        }),
        borderRadius: (theme) => theme.spacing(4),
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          margin: 'auto',
          width: '100%',
          maxWidth: 500,
          zIndex: 1,
          '& > *': {
            '&:first-child': { mt: 0 },
            '&:last-child': { mb: 0 }
          },
          // NextImage span
          '> span': {
            maxHeight: '100%'
          }
        }}
      >
        {children}
      </Box>
      {blurUrl != null && coverBlock?.__typename === 'ImageBlock' && (
        <NextImage
          data-testid="ExpandedImageCover"
          src={blurUrl}
          alt={coverBlock.alt}
          layout="fill"
          objectFit="cover"
        />
      )}
    </Box>
  )
}
