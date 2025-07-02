import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import { SxProps } from '@mui/system/styleFunctionSx'
import {
  Children,
  ReactElement,
  ReactNode,
  isValidElement,
  useEffect,
  useRef
} from 'react'

export interface HorizontalSelectProps {
  onChange?: (id: string) => void
  id?: string
  children: ReactNode
  sx?: SxProps<Theme>
  footer?: ReactNode
  isDragging?: boolean
  testId?: string
  scrollIntoView?: boolean
}

export function HorizontalSelect({
  children,
  id,
  onChange,
  sx,
  footer,
  isDragging,
  testId,
  scrollIntoView
}: HorizontalSelectProps): ReactElement {
  const selectedRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (selectedRef?.current != null && scrollIntoView === true) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center'
      })
    }
  }, [id, scrollIntoView])

  return (
    <Stack
      direction="row"
      data-testid={testId}
      spacing={1}
      sx={{
        overflowX: 'auto',
        overflowY: 'hidden',
        py: 5,
        px: 6,
        ...sx
      }}
    >
      {Children.toArray(children).map((child) => {
        if (!isValidElement(child)) return null

        // Safely access child props with proper type checking
        const childProps = (
          child as ReactElement<{ id?: string; draggableId?: string }>
        )?.props
        const childId = childProps?.id ?? childProps?.draggableId

        return (
          <Box
            key={childId}
            sx={{
              borderRadius: 2,
              transition: '0.1s outline ease-out',
              position: 'relative',
              outline: (theme) =>
                id === childId && isDragging !== true
                  ? `2px solid ${theme.palette.primary.main} `
                  : '2px solid transparent',
              border: '3px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => {
              if (childId) {
                onChange?.(childId)
              }
            }}
          >
            <Box
              sx={{
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 1
              }}
            />
            {child}
          </Box>
        )
      })}
      {footer != null && (
        <Box
          sx={{
            border: '3px solid transparent'
          }}
        >
          {footer}
        </Box>
      )}
    </Stack>
  )
}
