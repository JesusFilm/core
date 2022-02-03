import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { ColorLens } from '@mui/icons-material'
import Image from 'next/image'
import { gql, useMutation } from '@apollo/client'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { HorizontalSelect } from '../../../../../../HorizontalSelect'
import { ThemeMode } from '../../../../../../../../__generated__/globalTypes'
import cardStyleLight from '../../../../../../../../public/card-style-light.svg'
import cardStyleDark from '../../../../../../../../public/card-style-dark.svg'
import { useJourney } from '../../../../../../../libs/context'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourney'
import { CardBlockThemeUpdate } from '../../../../../../../../__generated__/CardBlockThemeUpdate'

export const CARD_BLOCK_THEME_UPDATE = gql`
  mutation CardBlockThemeUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      themeMode
    }
  }
`

export function CardStyling(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardBlock>

  const [cardBlockUpdate] = useMutation<CardBlockThemeUpdate>(
    CARD_BLOCK_THEME_UPDATE
  )
  const { id: journeyId } = useJourney()

  const handleChange = async (themeMode: ThemeMode): Promise<void> => {
    if (cardBlock != null) {
      await cardBlockUpdate({
        variables: {
          id: cardBlock.id,
          journeyId,
          input: {
            themeMode
          }
        },
        optimisticResponse: {
          cardBlockUpdate: {
            id: cardBlock.id,
            __typename: 'CardBlock',
            themeMode
          }
        }
      })
    }
  }

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        <Stack spacing={4} direction="row">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.default',
              color: 'text.secondary',
              width: 58,
              height: 58,
              borderRadius: 2
            }}
          >
            <ColorLens fontSize="large"></ColorLens>
          </Box>
          <Stack direction="column" justifyContent="center">
            <Typography variant="subtitle2">
              {cardBlock?.themeMode == null && 'Default'}
              {cardBlock?.themeMode === ThemeMode.light && 'Light'}
              {cardBlock?.themeMode === ThemeMode.dark && 'Dark'}
            </Typography>
            <Typography variant="caption">Card Style</Typography>
          </Stack>
        </Stack>
      </Box>
      <Divider />
      <Box>
        <HorizontalSelect
          onChange={handleChange}
          id={cardBlock?.themeMode ?? undefined}
        >
          <Box
            id={ThemeMode.light}
            sx={{ display: 'flex', p: 1 }}
            data-testid="Light"
          >
            <Image src={cardStyleLight} alt="Light" width={89} height={134} />
          </Box>
          <Box
            id={ThemeMode.dark}
            sx={{ display: 'flex', p: 1 }}
            data-testid="Dark"
          >
            <Image src={cardStyleDark} alt="Dark" width={89} height={134} />
          </Box>
        </HorizontalSelect>
      </Box>
    </>
  )
}
