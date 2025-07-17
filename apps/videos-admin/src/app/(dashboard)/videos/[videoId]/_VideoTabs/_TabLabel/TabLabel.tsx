import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface TabLabelProps {
  label: string
  count?: number
}

export function TabLabel({ label, count }: TabLabelProps): ReactElement {
  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Typography>{label}</Typography>
      {count != null && (
        <Box
          sx={{
            borderRadius: '6px',
            height: 24,
            px: '2px',
            display: 'grid',
            placeItems: 'center',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'divider'
          }}
        >
          <Typography color="primary.main" fontWeight={600}>
            {count}
          </Typography>
        </Box>
      )}
    </Stack>
  )
}
