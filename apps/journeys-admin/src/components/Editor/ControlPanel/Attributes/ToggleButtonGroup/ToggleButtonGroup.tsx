import { ReactElement } from 'react'
import MuiToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

interface ToggleButtonGroupProps<T = unknown> {
  value: T
  options: Array<{
    value: T
    label: string | ReactElement
    icon: ReactElement
  }>
  onChange: (value: T) => void
}

export function ToggleButtonGroup({
  options,
  value,
  onChange
}: ToggleButtonGroupProps): ReactElement {
  function handleChange(_event, value): void {
    onChange(value)
  }

  return (
    <MuiToggleButtonGroup
      orientation="vertical"
      value={value}
      exclusive
      onChange={handleChange}
      fullWidth
      color="primary"
      sx={{
        display: 'flex',
        px: 6,
        py: 4
      }}
    >
      {options.map(({ value, label, icon }) => (
        <ToggleButton
          key={value as string}
          value={value}
          sx={{
            textTransform: 'none',
            backgroundColor: 'background.paper',
            backgroundClip: 'padding-box',
            color: 'secondary.dark',
            justifyContent: 'flex-start',
            '&:first-of-type': {
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12
            },
            '&:last-of-type': {
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12
            },
            '&.Mui-selected': {
              backgroundColor: 'background.default'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              ml: 1,
              mr: 2
            }}
          >
            {icon}
          </Box>
          {typeof label === 'string' ? (
            <Typography variant="subtitle2">{label}</Typography>
          ) : (
            label
          )}
        </ToggleButton>
      ))}
    </MuiToggleButtonGroup>
  )
}
