import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../../__generated__/globalTypes'

interface Position {
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

  const [localPosition, setLocalPosition] = useState<Position>({
    x: imageBlock?.focalLeft ?? 50,
    y: imageBlock?.focalTop ?? 50
  })

  const dotRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const axis = ['x', 'y']
  const gridPositions = [33.33, 66.66]

  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  }

  function updatePoint(point: Position): void {
    const x = clamp(point.x, 0, 100)
    const y = clamp(point.y, 0, 100)
    setLocalPosition({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100
    })
  }

  function calculatePoint(e: React.MouseEvent | MouseEvent): Position | null {
    if (imageRef.current == null) return null
    const boundingRect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - boundingRect.left) / boundingRect.width) * 100
    const y = ((e.clientY - boundingRect.top) / boundingRect.height) * 100
    return { x, y }
  }

  function handleMouseDown(e: React.MouseEvent): void {
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleMouseUp(): void {
    setIsDragging(false)
    updateImageBlock({
      focalTop: Math.round(localPosition.y),
      focalLeft: Math.round(localPosition.x)
    })
  }

  function handleImageClick(e: React.MouseEvent): void {
    const point = calculatePoint(e)
    if (point != null) {
      updatePoint(point)
      updateImageBlock({
        focalTop: Math.round(point.y),
        focalLeft: Math.round(point.x)
      })
    }
  }

  function handleMouseMove(e: MouseEvent): void {
    if (isDragging) {
      const point = calculatePoint(e)
      if (point != null) updatePoint(point)
    }
  }

  function handleInputChange(axis: 'x' | 'y', value: string): void {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      updatePoint({
        x: axis === 'x' ? numValue : localPosition.x,
        y: axis === 'y' ? numValue : localPosition.y
      })
    }
  }

  function handleBlur(): void {
    updateImageBlock({
      focalTop: Math.round(localPosition.y),
      focalLeft: Math.round(localPosition.x)
    })
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, localPosition])

  useEffect(() => {
    if (imageRef.current != null) {
      imageRef.current.style.objectPosition = `${localPosition.x}% ${localPosition.y}%`
    }
  }, [localPosition])

  return (
    <Stack gap={4}>
      <Typography variant="subtitle2">{t('Focal Point')}</Typography>
      <Box
        ref={imageRef}
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
        onClick={handleImageClick}
      >
        {imageBlock?.src != null && imageBlock?.src !== '' ? (
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
            {gridPositions.map((position) => (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: `${position}%`,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: 'rgba(255,255,255,0.5)'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: `${position}%`,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: 'rgba(255,255,255,0.5)'
                  }}
                />
              </>
            ))}
            <Box
              ref={dotRef}
              sx={{
                width: 30,
                height: 30,
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
              onMouseDown={handleMouseDown}
            />
          </>
        ) : (
          <InsertPhotoRoundedIcon fontSize="large" />
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        {axis.map((axis: 'x' | 'y') => (
          <TextField
            key={axis}
            type="number"
            label={axis === 'x' ? t('Left') : t('Top')}
            value={localPosition[axis].toFixed(0)}
            onChange={(e) => handleInputChange(axis, e.target.value)}
            onBlur={handleBlur}
            slotProps={{
              input: { endAdornment: '%' },
              htmlInput: { min: 0, max: 100 }
            }}
            sx={{ width: '45%' }}
          />
        ))}
      </Box>
    </Stack>
  )
}
