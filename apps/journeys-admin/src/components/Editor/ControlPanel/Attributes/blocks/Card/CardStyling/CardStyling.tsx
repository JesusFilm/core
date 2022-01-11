import { ThemeMode } from '../../../../../../../../__generated__/globalTypes'
import { ReactElement, useState } from 'react'
import { Box, Stack } from '@mui/material'
import { ColorLens } from '@mui/icons-material'

interface CardStylingProps {
  id: string
  themeMode: ThemeMode | null
}

enum themeColors {
  light = '#DCDDE5',
  dark = '#AAACBA'
}

export function CardStyling({ id, themeMode }: CardStylingProps): ReactElement {
  const [color, setColor] = useState(
    themeMode === ThemeMode.light ? themeColors.light : themeColors.dark
  )

  return (
    <Box sx={{ px: 6, py: 4 }}>
      <Stack spacing={3} direction="row">
        <Box
          sx={{
            backgroundColor: color,
            width: 58,
            height: 58,
            borderRadius: 2,
            paddingTop: 3,
            textAlign: 'center'
          }}
        >
          <ColorLens fontSize="large"></ColorLens>
        </Box>
        <Stack direction="column">
          <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
            {themeMode}
          </span>
          <span>Card Style</span>
        </Stack>
      </Stack>
    </Box>
  )
}
