import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import {
  type Position,
  useFocalPoint
} from '@core/journeys/ui/FocalPointProvider'

interface FocalPointProps {
  src: string | null
  alt?: string
}

export function FocalPoint({ src, alt }: FocalPointProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const dotRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { focalPoint, updateFocalPoint } = useFocalPoint()

  const axis = ['x', 'y']

  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  }

  function updatePoint(point: Position): void {
    const x = clamp(point.x, 0, 100)
    const y = clamp(point.y, 0, 100)
    updateFocalPoint({ x, y })
  }

  function calculatePoint(e): Position | null {
    if (imageRef.current == null) return null
    const boundingRect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - boundingRect.left) / boundingRect.width) * 100
    const y = ((e.clientY - boundingRect.top) / boundingRect.height) * 100
    return { x, y }
  }

  function handleMouseDown(e): void {
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleMouseUp(): void {
    setIsDragging(false)
  }

  function handleImageClick(e): void {
    const point = calculatePoint(e)
    if (point != null) updatePoint(point)
  }

  function handleMouseMove(e): void {
    if (isDragging) {
      const point = calculatePoint(e)
      if (point != null) updatePoint(point)
    }
  }

  function handleInputChange(axis: 'x' | 'y', value: string): void {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      updatePoint({
        x: axis === 'x' ? numValue : focalPoint.x,
        y: axis === 'y' ? numValue : focalPoint.y
      })
    }
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  useEffect(() => {
    if (imageRef.current != null) {
      imageRef.current.style.objectPosition = `${focalPoint.x}% ${focalPoint.y}%`
    }
  }, [focalPoint])

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
        {src != null && src !== '' ? (
          <>
            <Image src={src} alt={alt ?? ''} layout="fill" objectFit="cover" />
            <Box
              ref={dotRef}
              sx={{
                width: 30,
                height: 30,
                cursor: 'move',
                borderRadius: '50%',
                position: 'absolute',
                pointerEvents: 'auto',
                top: `${focalPoint.y}%`,
                left: `${focalPoint.x}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: (theme) => theme.palette.background.paper,
                border: (theme) => `1px solid ${theme.palette.divider}`
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
            value={focalPoint[axis].toFixed(0)}
            onChange={(e) => handleInputChange(axis, e.target.value)}
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
