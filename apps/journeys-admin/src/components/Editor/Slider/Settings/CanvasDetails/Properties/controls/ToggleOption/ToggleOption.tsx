import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface ToggleOptionProps {
  heading: string
  description?: string
  checked: boolean
  handleChange: () => void
  children?: ReactElement
}

export function ToggleOption({
  heading,
  description,
  checked,
  handleChange,
  children
}: ToggleOptionProps): ReactElement {
  return (
    <Stack data-testid="ToggleOption">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          pb: 4
        }}
      >
        <Box>
          <Typography variant="body1">{heading}</Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary'
            }}
          >
            {description}
          </Typography>
        </Box>
        <Switch
          checked={checked}
          onChange={handleChange}
          sx={{ ml: 'auto' }}
          slotProps={{
            input: { 'aria-checked': checked }
          }}
        />
      </Box>
      {children}
    </Stack>
  )
}
