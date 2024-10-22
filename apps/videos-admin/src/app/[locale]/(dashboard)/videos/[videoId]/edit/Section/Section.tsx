import Box from '@mui/material/Box'
import Button, { ButtonProps as MuiButtonProps } from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement, ReactNode } from 'react'

interface SectionProps {
  title: string
  action?: {
    label: string
    startIcon?: MuiButtonProps['startIcon']
    onClick: (e: MouseEvent<HTMLButtonElement>) => void
  }
  children: ReactNode
}

export function Section({
  title,
  action,
  children
}: SectionProps): ReactElement {
  return (
    <Stack
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        width: 1024
      }}
    >
      <Stack
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 2,
          py: 1.5
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
      <Box sx={{ padding: 2 }}>{children}</Box>
    </Stack>
  )
}
