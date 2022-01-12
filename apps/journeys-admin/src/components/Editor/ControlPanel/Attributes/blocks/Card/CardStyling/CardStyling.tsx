import {
  CardBlockUpdateInput,
  ThemeMode
} from '../../../../../../../../__generated__/globalTypes'
import { ReactElement, useState } from 'react'
import { Box, Stack } from '@mui/material'
import { ColorLens } from '@mui/icons-material'
import { HorizontalSelect } from '../../../../../../HorizontalSelect'
import { gql, useMutation } from '@apollo/client'

interface CardStylingProps {
  id: string
  themeMode: ThemeMode | null
}

enum themeColors {
  light = '#DCDDE5',
  dark = '#AAACBA'
}

export const CARD_BLOCK_UPDATE = gql`
  mutation CardBlockUpdate($id: ID!, $input: CardBlockUpdateInput!) {
    cardBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function CardStyling({ id, themeMode }: CardStylingProps): ReactElement {
  const [cardBlockUpdate, { data }] =
    useMutation<CardBlockUpdateInput>(CARD_BLOCK_UPDATE)

  const [color, setColor] = useState(
    themeMode === ThemeMode.light ? themeColors.light : themeColors.dark
  )
  const handleChange = (selectedId: string): void => {
    await cardBlockUpdate({
      variables: {
        id: id,
        input: {
          themeMode: themeMode
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
            {themeMode}
          </span>
          <span>Card Style</span>
        </Stack>
      </Stack>
      <Box>
        <HorizontalSelect onChange={handleChange}></HorizontalSelect>
      </Box>
    </Box>
  )
}
