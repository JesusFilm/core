import { ReactElement, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { NextImage } from '@core/shared/ui'
import { blurImage, TreeBlock } from '../../..'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'

export function FullCardCover(
  coverBlock: TreeBlock<ImageFields | VideoFields>
): ReactElement {
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
    <>
      {blurUrl != null && coverBlock?.__typename === 'ImageBlock' ? (
        <NextImage
          src={blurUrl}
          alt={coverBlock.alt}
          layout="fill"
          objectFit="cover"
        />
      ) : (
        <></>
      )}
    </>
  )
}
