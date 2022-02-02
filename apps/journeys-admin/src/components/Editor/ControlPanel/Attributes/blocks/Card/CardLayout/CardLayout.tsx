import { ReactElement } from 'react'
import { Box, Divider, Stack } from '@mui/material'
import { VerticalSplit } from '@mui/icons-material'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import { useMutation } from '@apollo/client'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { HorizontalSelect } from '../../../../../../HorizontalSelect'
import cardLayoutContained from '../../../../../../../../public/card-layout-contained.svg'
import cardLayoutExpanded from '../../../../../../../../public/card-layout-expanded.svg'
import { CARD_BLOCK_UPDATE } from '../CardBlockUpdate'
import { useJourney } from '../../../../../../../libs/context'
import { CardBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourney'

export function CardLayout(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardBlock> | undefined

  const [cardBlockUpdate] =
    useMutation<{ cardBlockUpdate: CardBlockUpdateInput }>(CARD_BLOCK_UPDATE)
  const { id: journeyId } = useJourney()
  const handleLayoutChange = async (selected: boolean): Promise<void> => {
    await cardBlockUpdate({
      variables: {
        id: cardBlock?.id,
        journeyId: journeyId,
        input: {
          fullscreen: selected
        }
      }
    })
  }
  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        <Stack spacing={3} direction="row">
          <Box
            sx={{
              backgroundColor: '#EFEFEF',
              width: 58,
              height: 58,
              borderRadius: 2,
              paddingTop: 3,
              textAlign: 'center'
            }}
          >
            <VerticalSplit fontSize="large"></VerticalSplit>
          </Box>
          <Stack direction="column" justifyContent="center">
            <Typography variant="subtitle2">
              {cardBlock?.fullscreen ?? false ? 'Expanded' : 'Contained'}
            </Typography>
            <Typography variant="caption">Card Layout</Typography>
          </Stack>
        </Stack>
      </Box>
      <Divider />
      <Box>
        <HorizontalSelect
          onChange={async (val) => await handleLayoutChange(val === 'true')}
          id={cardBlock?.fullscreen.toString()}
        >
          <Box sx={{ py: 1, px: 1 }} id="false" key="false" data-testid="false">
            <Image
              src={cardLayoutContained}
              alt="Contained"
              width={89}
              height={137}
            />
          </Box>
          <Box sx={{ py: 1, px: 1 }} id="true" key="true" data-testid="true">
            <Image
              src={cardLayoutExpanded}
              alt="Expanded"
              width={89}
              height={137}
            />
          </Box>
        </HorizontalSelect>
      </Box>
    </>
  )
}
