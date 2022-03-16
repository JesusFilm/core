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
}

export function HorizontalSelect({
  children,
  id,
  onChange,
  sx,
  footer
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
      {Children.toArray(children).map(
        (child) =>
          isValidElement(child) && (
            <Box
              key={child.props.id}
              ref={id === child.props.id ? selectedRef : undefined}
              sx={{
                borderRadius: 2,
                transition: '0.2s border-color ease-out',
                position: 'relative',
                outline: (theme) =>
                  id === child.props.id
                    ? `2px solid ${theme.palette.primary.main} `
                    : '2px solid transparent',
                border: '3px solid transparent',
                cursor: 'pointer'
              }}
              onClick={() => onChange?.(child.props.id)}
            >
              <Box
                sx={{
                  position: 'absolute',
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
