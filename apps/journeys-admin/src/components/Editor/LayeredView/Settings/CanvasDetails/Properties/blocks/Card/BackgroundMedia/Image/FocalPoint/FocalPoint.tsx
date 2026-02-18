import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import debounce from 'lodash/debounce'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../../__generated__/globalTypes'

import { calculatePoint } from './utils/calculatePoint'
import { clampPosition } from './utils/clampPosition'

export interface Position {
  x: number
  y: number
}

interface FocalPointProps {
  imageBlock?: ImageBlock | null
  updateImageBlock: (input: ImageBlockUpdateInput) => void
}

export function FocalPoint({
  imageBlock,
  updateImageBlock
}: FocalPointProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const imageRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localPosition, setLocalPosition] = useState<Position>({
    x: imageBlock?.focalLeft ?? 50,
    y: imageBlock?.focalTop ?? 50
  })

  useEffect(() => {
    setLocalPosition({
      x: imageBlock?.focalLeft ?? 50,
      y: imageBlock?.focalTop ?? 50
    })
  }, [imageBlock?.id, imageBlock?.focalLeft, imageBlock?.focalTop])

  const debouncedUpdateImageBlock = useCallback(
    debounce((position: Position) => {
      updateImageBlock({
        src: imageBlock?.src,
        alt: imageBlock?.alt,
        blurhash: imageBlock?.blurhash,
        width: imageBlock?.width,
        height: imageBlock?.height,
        focalTop: Math.round(position.y),
        focalLeft: Math.round(position.x)
      })
    }, 500),
    [imageBlock, updateImageBlock]
  )

  function updatePoint(point: Position): void {
    const newPosition = clampPosition(point)
    setLocalPosition(newPosition)
    debouncedUpdateImageBlock(newPosition)
  }

  function handleMouseMove(e: React.MouseEvent): void {
    if (isDragging) {
      const point = calculatePoint(e, imageRef)
      if (point != null) updatePoint(point)
    }
  }

  function handleMouseDown(e: React.MouseEvent): void {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleMouseUp(): void {
    setIsDragging(false)
  }

  function handleClick(e: React.MouseEvent): void {
    const point = calculatePoint(e, imageRef)
    if (point != null) {
      updatePoint(point)
    }
  }

  return (
    <>
      {imageBlock?.src != null && (
        <Stack gap={4}>
          <Typography variant="subtitle2">{t('Adjust View')}</Typography>
          <Box
            onMouseMove={handleMouseMove}
            sx={{
              width: '100%',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              bgcolor: 'background.default',
              borderRadius: 1
            }}
          >
            <Box
              ref={imageRef}
              sx={{
                height: '100%',
                aspectRatio: `${imageBlock?.width ?? 0} / ${
                  imageBlock?.height ?? 0
                }`,
                position: 'relative',
                display: 'flex',
                cursor: 'pointer',
                userSelect: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                overflow: 'hidden'
              }}
              onClick={handleClick}
            >
              <Image
                src={imageBlock.src}
                alt={imageBlock?.alt ?? ''}
                layout="fill"
                style={{ objectFit: 'cover' }}
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
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '33.33%',
                  bottom: 0,
                  width: '1px',
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '66.66%',
                  bottom: 0,
                  width: '1px',
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '33.33%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '66.66%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }}
              />
              <Box
                draggable
                data-testid="focal-point-dot"
                sx={{
                  width: 25,
                  height: 25,
                  cursor: 'move',
                  borderRadius: '50%',
                  position: 'absolute',
                  pointerEvents: 'auto',
                  top: `${localPosition.y}%`,
                  left: `${localPosition.x}%`,
                  transform: 'translate(-50%, -50%)',
                  backdropFilter: 'blur(4px)',
                  border: '2px solid white',
                  boxShadow: (theme) => theme.shadows[3]
                }}
                onMouseDown={(e) => {
                  handleMouseDown(e)
                }}
                onMouseUp={handleMouseUp}
              />
            </Box>
          </Box>
        </Stack>
      )}
    </>
  )
}
