import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import MuiToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface ToggleButtonGroupProps<T = string | number> {
  label?: string
  value: T
  options: Array<{
    value: T
    label: string | ReactElement
    icon?: ReactElement
  }>
  onChange: (value: T) => void
  testId?: string
}

export function ToggleButtonGroup({
  label,
  options,
  value,
  onChange,
  testId
}: ToggleButtonGroupProps): ReactElement {
  function handleChange(_event, value: string | number): void {
    onChange(value)
  }

  return (
    <Stack
      sx={{ p: 4, pt: 0 }}
      data-testid={`ToggleButtonGroup${testId ?? ''}`}
    >
      {label != null ? (
        <Typography variant="subtitle2" sx={{ pb: 4 }}>
          {label}
        </Typography>
      ) : null}
      <MuiToggleButtonGroup
        orientation="vertical"
        value={value}
        exclusive
        onChange={handleChange}
        fullWidth
        color="primary"
      >
        {options.map(({ value, label, icon }) => (
          <ToggleButton
            key={value}
            value={value}
            onMouseDown={(e) => e.preventDefault()}
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
            <Stack sx={{ ml: 1, mr: 2 }}>{icon}</Stack>
            {typeof label === 'string' ? (
              <Typography variant="subtitle2">{label}</Typography>
            ) : (
              label
            )}
          </ToggleButton>
        ))}
      </MuiToggleButtonGroup>
    </Stack>
  )
}
