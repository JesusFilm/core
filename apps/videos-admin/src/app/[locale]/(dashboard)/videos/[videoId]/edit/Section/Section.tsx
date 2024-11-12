import Box, { BoxProps } from '@mui/material/Box'
import Button, { ButtonProps as MuiButtonProps } from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement, ReactNode } from 'react'

function SectionFallback({ children }: { children: string }): ReactElement {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', padding: 2 }}>
      <Typography variant="subtitle2" fontWeight={500}>
        {children}
      </Typography>
    </Box>
  )
}

interface SectionProps {
  title: string
  action?: {
    label: string
    startIcon?: MuiButtonProps['startIcon']
    onClick: (e: MouseEvent<HTMLButtonElement>) => void
  }
  children: ReactNode
  sx?: SxProps
  boxProps?: BoxProps
}

export function Section({
  title,
  action,
  children,
  sx,
  boxProps
}: SectionProps): ReactElement {
  return (
    <Stack
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        borderRadius: 1,
        width: '100%',
        ...sx
      }}
      data-testid={`${title}-section`}
    >
      <Stack
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          px: 2,
          py: 1
        }}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h6" lineHeight={2}>
          {title}
        </Typography>
        {action != null && (
          <Button
            size="small"
            variant="outlined"
            onClick={action.onClick}
            startIcon={action.startIcon}
          >
            {action.label}
          </Button>
        )}
      </Stack>
      <Box sx={{ padding: 2 }} {...boxProps}>
        {children}
      </Box>
    </Stack>
  )
}

Section.Fallback = SectionFallback
