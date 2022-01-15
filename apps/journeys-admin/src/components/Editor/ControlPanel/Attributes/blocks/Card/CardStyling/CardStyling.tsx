import { ReactElement, useState } from 'react'
import { Box, Stack } from '@mui/material'
import { ColorLens } from '@mui/icons-material'
import Image from 'next/image'
import { HorizontalSelect } from '../../../../../../HorizontalSelect'
import { ThemeMode } from '../../../../../../../../__generated__/globalTypes'
import cardStyleLight from '../../../../../../../../public/card-style-light.png'
import cardStyleDark from '../../../../../../../../public/card-style-dark.png'

interface CardStylingProps {
  id: string
  journeyId: string
  themeMode: ThemeMode | null
  onSelect?: (themeMode: ThemeMode | null) => void
}

enum themeColors {
  light = '#DCDDE5',
  dark = '#AAACBA'
}

export function CardStyling({
  id,
  journeyId,
  themeMode,
  onSelect
}: CardStylingProps): ReactElement {
  const [color, setColor] = useState(
    themeMode === ThemeMode.light ? themeColors.light : themeColors.dark
  )

  const [theme, setThemeMode] = useState(themeMode)

  const handleChange = async (selectedTheme: ThemeMode): Promise<void> => {
    setThemeMode(selectedTheme)
    onSelect?.(selectedTheme)
    setColor(
      selectedTheme === ThemeMode.light ? themeColors.light : themeColors.dark
    )
  }

  return (
    <>
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
              {theme ?? 'Default'}
            </span>
            <span>Card Style</span>
          </Stack>
        </Stack>
      </Box>
      <Box>
        <hr></hr>
      </Box>
      <Box>
        <HorizontalSelect onChange={handleChange} id={theme ?? '0'}>
          <Box
            sx={{ py: 1, px: 1 }}
            id={ThemeMode.light}
            key={ThemeMode.light}
            data-test-id={ThemeMode.light}
          >
            <Image src={cardStyleLight} alt="Light" width={89} height={137} />
          </Box>
          <Box
            sx={{ py: 1, px: 1 }}
            id={ThemeMode.dark}
            key={ThemeMode.dark}
            data-test-id={ThemeMode.dark}
          >
            <Image src={cardStyleDark} alt="Dark" width={89} height={137} />
          </Box>
        </HorizontalSelect>
      </Box>
    </>
  )
}
