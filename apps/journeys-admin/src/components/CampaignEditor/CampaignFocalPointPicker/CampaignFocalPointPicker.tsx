import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  ReactElement,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState
} from 'react'

/** A focal point as whole percentages from the left and the top. */
export interface FocalPoint {
  focalLeft: number
  focalTop: number
}

interface CampaignFocalPointPickerProps {
  src: string
  alt?: string | null
  width?: number | null
  height?: number | null
  value: FocalPoint
  /** The point the author settled on: on click, or when a drag ends. */
  onChange: (point: FocalPoint) => void
}

function clamp(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)))
}

/** The pointer's place over the picture as whole percentages. */
export function focalPointOf(
  event: { clientX: number; clientY: number },
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
): FocalPoint {
  if (rect.width === 0 || rect.height === 0)
    return { focalLeft: 50, focalTop: 50 }
  return {
    focalLeft: clamp(((event.clientX - rect.left) / rect.width) * 100),
    focalTop: clamp(((event.clientY - rect.top) / rect.height) * 100)
  }
}

/**
 * The picture at its own ratio under a rule-of-thirds grid with a draggable
 * dot: click to place the dot, drag it to move it. The dot follows the
 * pointer at once; `onChange` fires once per click or drag so the host can
 * write one Command.
 */
export function CampaignFocalPointPicker({
  src,
  alt,
  width,
  height,
  value,
  onChange
}: CampaignFocalPointPickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const frameRef = useRef<HTMLDivElement>(null)
  const [point, setPoint] = useState(value)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    setPoint(value)
  }, [value.focalLeft, value.focalTop])

  function pointAt(event: { clientX: number; clientY: number }): FocalPoint {
    const rect = frameRef.current?.getBoundingClientRect()
    return rect == null ? point : focalPointOf(event, rect)
  }

  useEffect(() => {
    if (!dragging) return
    function handleMove(event: MouseEvent): void {
      setPoint(pointAt(event))
    }
    function handleUp(event: MouseEvent): void {
      setDragging(false)
      onChange(pointAt(event))
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  })

  function handleClick(event: ReactMouseEvent<HTMLDivElement>): void {
    const next = pointAt(event)
    setPoint(next)
    onChange(next)
  }

  const aspectRatio =
    width != null && height != null && height > 0
      ? `${width} / ${height}`
      : '16 / 9'

  return (
    <Stack spacing={1} data-testid="FocalPointPicker">
      <Typography variant="caption" color="text.secondary">
        {t('Click or drag the dot to the part of the picture to keep in view.')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          maxHeight: 200,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          borderRadius: 1
        }}
      >
        <Box
          ref={frameRef}
          role="img"
          aria-label={alt ?? t('Focal point')}
          data-testid="FocalPointFrame"
          onClick={handleClick}
          sx={{
            position: 'relative',
            maxHeight: 200,
            maxWidth: '100%',
            aspectRatio,
            cursor: 'crosshair',
            userSelect: 'none',
            overflow: 'hidden'
          }}
        >
          <Box
            component="img"
            src={src}
            alt=""
            draggable={false}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {[33.33, 66.66].map((offset) => (
            <Box
              key={`v-${offset}`}
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${offset}%`,
                width: '1px',
                bgcolor: 'rgba(255,255,255,0.5)',
                pointerEvents: 'none'
              }}
            />
          ))}
          {[33.33, 66.66].map((offset) => (
            <Box
              key={`h-${offset}`}
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${offset}%`,
                height: '1px',
                bgcolor: 'rgba(255,255,255,0.5)',
                pointerEvents: 'none'
              }}
            />
          ))}
          <Box
            data-testid="FocalPointDot"
            onMouseDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setDragging(true)
            }}
            onClick={(event) => event.stopPropagation()}
            sx={{
              position: 'absolute',
              top: `${point.focalTop}%`,
              left: `${point.focalLeft}%`,
              width: 24,
              height: 24,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: 3,
              backdropFilter: 'blur(4px)',
              cursor: dragging ? 'grabbing' : 'grab'
            }}
          />
        </Box>
      </Box>
    </Stack>
  )
}
