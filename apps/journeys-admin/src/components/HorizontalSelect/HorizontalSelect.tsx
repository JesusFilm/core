import {
  ReactElement,
  Children,
  ReactNode,
  isValidElement,
  useRef,
  useEffect
} from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/system/styleFunctionSx'
import { Theme } from '@mui/material/styles'

export interface HorizontalSelectProps {
  onChange?: (id: string) => void
  id?: string
  children: ReactNode
  sx?: SxProps<Theme>
  footer?: ReactNode
  isDragging?: boolean
  insert?: ReactNode
  insertPosition?: number
}

export function HorizontalSelect({
  children,
  id,
  onChange,
  sx,
  footer,
  isDragging,
  insert,
  insertPosition
}: HorizontalSelectProps): ReactElement {
  const selectedRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (selectedRef?.current != null) {
      selectedRef.current.scrollIntoView({ inline: 'center' })
    }
  }, [])

  return (
    <Stack
      direction="row"
      data-testid="horizontal-select"
      spacing={1}
      sx={{
        overflowX: 'auto',
        overflowY: 'hidden',
        py: 5,
        px: 6,
        ...sx
      }}
    >
      {Children.toArray(children).map((child, index) => {
        const result: ReactElement[] = []
        if (isValidElement(child)) {
          result.push(
            <Box
              key={child.props.id}
              ref={id === child.props.id ? selectedRef : undefined}
              sx={{
                borderRadius: 2,
                transition: '0.2s border-color ease-out',
                position: 'relative',
                outline: (theme) =>
                  id === child.props.id && isDragging !== true
                    ? `2px solid ${theme.palette.primary.main} `
                    : '2px solid transparent',
                border: '3px solid transparent',
                cursor: 'pointer'
              }}
              onClick={() => onChange?.(child.props.id)}
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
        }
        if (
          insertPosition === index &&
          isDragging !== true &&
          isValidElement(insert)
        ) {
          result.push(
            <Box
              sx={{
                border: '3px solid transparent'
              }}
            >
              {insert}
            </Box>
          )
        }
        return result
      })}
      {(Children.toArray(children).length === 0 || insertPosition === -1) &&
        isValidElement(insert) && (
          <Box
            sx={{
              border: '3px solid transparent'
            }}
          >
            {insert}
          </Box>
        )}
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
