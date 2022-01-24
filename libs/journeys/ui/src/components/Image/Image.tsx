import { ReactElement, useContext, MouseEvent } from 'react'
import NextImage from 'next/image'
import { SxProps } from '@mui/system/styleFunctionSx'
import { Theme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { TreeBlock, EditorContext } from '../..'
import { ImageFields } from './__generated__/ImageFields'

interface ImageProps extends TreeBlock<ImageFields> {
  sx?: SxProps<Theme>
}

export function Image({
  src,
  alt,
  height,
  width,
  sx,
  ...props
}: ImageProps): ReactElement {
  const {
    state: { selectedBlock },
    dispatch
  } = useContext(EditorContext)

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

    const block: TreeBlock<ImageFields> = {
      src,
      alt,
      height,
      width,
      ...props
    }

    dispatch({ type: 'SetSelectedBlockAction', block })
  }

  return (
    <Box
      data-testId={`image-${props.id}`}
      sx={{
        borderRadius: (theme) => theme.spacing(4),
        overflow: 'hidden',
        mb: 4,
        ...sx,
        '> div': {
          display: 'block !important'
        },
        outline: selectedBlock?.id === props.id ? '3px solid #C52D3A' : 'none',
        outlineOffset: '5px'
      }}
      onClick={selectedBlock === undefined ? undefined : handleSelectBlock}
    >
      {src != null ? (
        <NextImage
          src={src}
          alt={alt}
          height={height}
          width={width}
          objectFit="cover"
        />
      ) : (
        <NextImage
          src="/DefaultImageIcon.png"
          height={100}
          width={100}
          alt={alt}
          objectFit="cover"
        />
      )}
    </Box>
  )
}
