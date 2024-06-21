import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement, useState } from 'react'

import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import { useTranslation } from 'react-i18next'

interface ConfigFieldProps {
  label: string
  initialValue?: string
  onChange: (value?: string) => void
}

export function ConfigField({
  label,
  initialValue,
  onChange
}: ConfigFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [value, setValue] = useState(initialValue)
  const [visible, setVisible] = useState(false)
  const [hover, setHover] = useState(false)

  function handleBlur(): void {
    setVisible(false)
    onChange(value)
  }

  function handleClick(e: MouseEvent): void {
    e.stopPropagation()
    setVisible(!visible)
  }

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
        <Typography variant="body1">{label}</Typography>
      </Box>
      <Box sx={{ flex: 0.8, position: 'relative', width: '100%' }}>
        <TextField
          type={visible ? 'text' : 'password'}
          value={hover && !visible ? '' : value}
          onBlur={handleBlur}
          onChange={(e) => setValue(e.target.value)}
          onClick={() => setVisible(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClick}>
                  {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            width: '100%'
          }}
        />
        {hover && !visible && (
          <Typography
            variant="body1"
            sx={{
              position: 'absolute',
              top: 'calc(50% - 12px)',
              left: 14,
              transform: 'translateY(-50)',
              pointerEvents: 'none',
              color: (theme) => theme.palette.grey[500]
            }}
          >
            {t('Click to reveal the secret')}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
