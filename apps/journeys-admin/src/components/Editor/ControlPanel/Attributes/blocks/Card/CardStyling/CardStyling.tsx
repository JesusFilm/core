import { ReactElement, useState } from 'react'
import { Box, Stack } from '@mui/material'
import { ColorLens } from '@mui/icons-material'
import { gql, useMutation } from '@apollo/client'
import Image from 'next/image'
import { HorizontalSelect } from '../../../../../../HorizontalSelect'
import {
  CardBlockUpdateInput,
  ThemeMode
} from '../../../../../../../../__generated__/globalTypes'
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

export const CARD_BLOCK_UPDATE = gql`
  mutation CardBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
    }
  }
`

export function CardStyling({
  id,
  journeyId,
  themeMode,
  onSelect
}: CardStylingProps): ReactElement {
  const [cardBlockUpdate] = useMutation<CardBlockUpdateInput>(CARD_BLOCK_UPDATE)

  const [color, setColor] = useState(
    themeMode === ThemeMode.light ? themeColors.light : themeColors.dark
  )

  const [theme, setThemeMode] = useState(themeMode)

  const handleChange = async (selectedTheme: ThemeMode): Promise<void> => {
    setThemeMode(selectedTheme)
    onSelect(selectedTheme)
    setColor(
      selectedTheme === ThemeMode.light ? themeColors.light : themeColors.dark
    )
    await cardBlockUpdate({
      variables: {
        id: id,
        journeyId: journeyId,
        input: {
          themeMode: selectedTheme
        }
      }
    })
  }

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
            {theme}
          </span>
          <span>Card Style</span>
        </Stack>
      </Stack>
      <hr></hr>
      <Box>
        <HorizontalSelect onChange={handleChange} id={theme ?? '0'}>
          <Box sx={{ py: 1, px: 1 }} id={ThemeMode.light} key={ThemeMode.light}>
            <Image src={cardStyleLight} alt="Light" width={89} height={137} />
          </Box>
          <Box sx={{ py: 1, px: 1 }} id={ThemeMode.dark} key={ThemeMode.dark}>
            <Image src={cardStyleDark} alt="Dark" width={89} height={137} />
          </Box>
        </HorizontalSelect>
      </Box>
    </Box>
  )
}
