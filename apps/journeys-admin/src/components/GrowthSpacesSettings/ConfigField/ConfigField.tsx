import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'

interface ConfigFieldProps {
  label: string
  initialValue: string
  onChange: (value: string) => void
}

export function ConfigField({
  label,
  initialValue,
  onChange
}: ConfigFieldProps): ReactElement {
  const [value, setValue] = useState(initialValue)
  const [show, setShow] = useState(false)

  function handleBlur(): void {
    setShow(false)
    onChange(value)
  }

  function handleClick(): void {
    setShow(!show)
  }

  // add click to reveal value
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
      }}
    >
      <Box sx={{ flex: 0.2 }}>
        <Typography variant="subtitle1">{label}</Typography>
      </Box>
      <TextField
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        sx={{
          flex: 0.8
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClick}>
                {show ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  )
}
