import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import capitalize from 'lodash/capitalize'
import Paper from '@mui/material/Paper'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { ThemeProvider } from '@core/shared/ui'
import {
  TypographyColor,
  ThemeName,
  ThemeMode
} from '../../../../../../../../__generated__/globalTypes'

interface TextColorProps {
  id: string
  color: TypographyColor | null
}

// add mutaion to update back end data

export function TextColor({ id, color }: TextColorProps): ReactElement {
  const [selected, setSelected] = useState(color ?? 'primary')

  function handleChange(
    event: React.MouseEvent<HTMLElement>,
    color: TypographyColor
  ): void {
    if (color != null) {
      setSelected(color)
    }
  }

  const order = ['primary', 'secondary', 'error']
  const sorted = Object.values(TypographyColor).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={selected}
      exclusive
      onChange={handleChange}
      fullWidth
      sx={{
        display: 'flex',
        px: 6,
        py: 4
      }}
    >
      {sorted.map((color) => {
        return (
          <ToggleButton
            value={color}
            key={`${id}-align-${color}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            {
              // update to use journey.themeMode
              <ThemeProvider
                themeName={ThemeName.base}
                themeMode={ThemeMode.light}
              >
                <Paper
                  sx={{
                    borderRadius: 1000,
                    ml: 1,
                    mr: 2
                  }}
                >
                  <Box
                    data-testid="backgroundColorIcon"
                    sx={{
                      width: 20,
                      height: 20,
                      m: 1,
                      borderRadius: 1000,
                      backgroundColor: `${color ?? 'primary'}.main`
                    }}
                  />
                </Paper>
              </ThemeProvider>
            }
            <Typography variant="subtitle2">{capitalize(color)}</Typography>
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
