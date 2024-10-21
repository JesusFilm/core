import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import debounce from 'lodash/debounce'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../../__generated__/globalTypes'

import { FocalPointImage } from './FocalPointImage'
import { FocalPointInputs } from './FocalPointInputs'
import { calculatePoint } from './utils/calculatePoint'
import { clampPosition } from './utils/clampPosition'

const INITIAL_POSITION = { x: 50, y: 50 }
export const MIN_VALUE = 0
export const MAX_VALUE = 100
export const ROUND_PRECISION = 100
const DEBOUNCE_DELAY = 500

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

  const [localPosition, setLocalPosition] = useState<Position>({
    x: imageBlock?.focalLeft ?? INITIAL_POSITION.x,
    y: imageBlock?.focalTop ?? INITIAL_POSITION.y
  })

  const imageRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const debouncedUpdateImageBlock = useCallback(
    (position: Position) => {
      debounce(() => {
        updateImageBlock({
          src: imageBlock?.src,
          alt: imageBlock?.alt,
          blurhash: imageBlock?.blurhash,
          width: imageBlock?.width,
          height: imageBlock?.height,
          focalTop: Math.round(position.y),
          focalLeft: Math.round(position.x)
        })
      }, DEBOUNCE_DELAY)()
    },
    [imageBlock, updateImageBlock]
  )

  function updatePoint(point: Position): void {
    const newPosition = clampPosition(point)
    setLocalPosition(newPosition)
    debouncedUpdateImageBlock(newPosition)
  }

  function handleMouseUp(): void {
    setIsDragging(false)
  }

  function handleMouseMove(e: MouseEvent): void {
    if (isDragging) {
      const point = calculatePoint(e, imageRef)
      if (point != null) updatePoint(point)
    }
  }

  function handleClick(e: React.MouseEvent): void {
    const point = calculatePoint(e, imageRef)
    if (point != null) {
      updatePoint(point)
    }
  }

  function handleChange(axis: 'x' | 'y', value: string): void {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      updatePoint({
        x: axis === 'x' ? numValue : localPosition.x,
        y: axis === 'y' ? numValue : localPosition.y
      })
    }
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  return (
    <Stack gap={4}>
      <Typography variant="subtitle2">{t('Focal Point')}</Typography>
      <FocalPointImage
        imageBlock={imageBlock}
        imageRef={imageRef}
        localPosition={localPosition}
        handleClick={handleClick}
        onDragStart={() => setIsDragging(true)}
      />
      <FocalPointInputs
        localPosition={localPosition}
        handleChange={handleChange}
      />
    </Stack>
  )
}
