import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { ReactElement, useEffect } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../../__generated__/BlockFields'

import { FocalPointDot } from './FocalPointDot/FocalPointDot'
import { GridLines } from './GridLines'

interface Position {
  x: number
  y: number
}

interface FocalPointImageProps {
  imageBlock?: ImageBlock | null
  imageRef: React.RefObject<HTMLDivElement>
  localPosition: Position
  handleClick: (e: React.MouseEvent) => void
  onDragStart: () => void
}

export function FocalPointImage({
  imageBlock,
  imageRef,
  localPosition,
  handleClick,
  onDragStart
}: FocalPointImageProps): ReactElement {
  useEffect(() => {
    if (imageRef.current != null) {
      imageRef.current.style.objectPosition = `${localPosition.x}% ${localPosition.y}%`
    }
  }, [imageRef, localPosition])

  return (
    <Box
      ref={imageRef}
      data-testid="focal-point-image"
      sx={{
        height: 300,
        width: '100%',
        display: 'flex',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        border: (theme) => `1px solid ${theme.palette.divider}`
      }}
      onClick={handleClick}
    >
      {imageBlock?.src != null ? (
        <>
          <Image
            src={imageBlock.src}
            alt={imageBlock?.alt ?? ''}
            layout="fill"
            objectFit="cover"
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          />
          <GridLines />
          <FocalPointDot
            localPosition={localPosition}
            onDragStart={onDragStart}
          />
        </>
      ) : (
        <InsertPhotoRoundedIcon fontSize="large" />
      )}
    </Box>
  )
}
