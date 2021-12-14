import { Box, Stack } from '@mui/material'
import { ReactElement, Children, ReactNode, isValidElement } from 'react'

export interface HorizontalSelectProps {
  onChange?: (id: string) => void
  id?: string
  children: ReactNode
}

export function HorizontalSelect({
  children,
  id,
  onChange
}: HorizontalSelectProps): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      {Children.toArray(children).map(
        (child) =>
          isValidElement(child) && (
            <Box
              key={child.props.id}
              sx={{
                borderRadius: 2,
                transition: '0.2s border-color ease-out',
                position: 'relative',
                border: (theme) =>
                  id === child.props.id
                    ? `3px solid ${theme.palette.primary.main} `
                    : '3px solid transparent'
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
    </Stack>
  )
}
