import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { ReactElement } from 'react'

interface FallbackProps {
  icon?: ReactElement
  title: string
  subtitle?: string
  action?: {
    href: string
    label: string
  }
}

export function Fallback({
  icon,
  title,
  subtitle,
  action
}: FallbackProps): ReactElement {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center'
      }}
    >
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {icon && (
          <Box
            sx={{
              borderRadius: 100,
              backgroundColor: 'primary.main',
              height: 56,
              width: 56,
              display: 'grid',
              placeItems: 'center'
            }}
          >
            {icon}
          </Box>
        )}
        <Stack alignItems="center">
          <Typography variant="h4">{title}</Typography>
          {subtitle != null && (
            <Typography
              variant="subtitle2"
              fontSize={16}
              color="text.secondary"
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
        {action != null && (
          <Link href={action.href}>
            <Button variant="contained" color="primary">
              {action.label}
            </Button>
          </Link>
        )}
      </Paper>
    </Box>
  )
}
