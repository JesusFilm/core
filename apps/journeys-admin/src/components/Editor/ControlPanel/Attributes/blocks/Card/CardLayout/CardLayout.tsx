import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'

import { CardBlockLayoutUpdate } from '../../../../../../../../__generated__/CardBlockLayoutUpdate'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourney'
import cardLayoutContained from '../../../../../../../../public/card-layout-contained.svg'
import cardLayoutExpanded from '../../../../../../../../public/card-layout-expanded.svg'
import { HorizontalSelect } from '../../../../../../HorizontalSelect'

export const CARD_BLOCK_LAYOUT_UPDATE = gql`
  mutation CardBlockLayoutUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      fullscreen
    }
  }
`

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

  const [cardBlockUpdate] = useMutation<CardBlockLayoutUpdate>(
    CARD_BLOCK_LAYOUT_UPDATE
  )
  const { journey } = useJourney()
  const handleLayoutChange = async (selected: boolean): Promise<void> => {
    if (journey != null && cardBlock != null) {
      await cardBlockUpdate({
        variables: {
          id: cardBlock.id,
          journeyId: journey.id,
          input: {
            fullscreen: selected
          }
        },
        optimisticResponse: {
          cardBlockUpdate: {
            id: cardBlock.id,
            __typename: 'CardBlock',
            fullscreen: selected
          }
        }
      })
    }
  }
  return (
    <>
      {/* <Box sx={{ px: 6, py: 4 }}>
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
            <FlexAlignBottom1Icon fontSize="large" />
          </Box>
          <Stack direction="column" justifyContent="center">
            <Typography variant="subtitle2">
              {cardBlock?.fullscreen ?? false ? 'Expanded' : 'Contained'}
            </Typography>
            <Typography variant="caption">Card Layout</Typography>
          </Stack>
        </Stack>
      </Box>
      <Divider /> */}
      <Box>
        <HorizontalSelect
          onChange={async (val) => await handleLayoutChange(val === 'true')}
          id={cardBlock?.fullscreen.toString()}
        >
          <Box sx={{ display: 'flex' }} id="true" key="true" data-testid="true">
            <Image
              src={cardLayoutExpanded}
              alt="Expanded"
              width={89}
              height={137}
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
          <Box
            sx={{ display: 'flex' }}
            id="false"
            key="false"
            data-testid="false"
          >
            <Image
              src={cardLayoutContained}
              alt="Contained"
              width={89}
              height={137}
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
        </HorizontalSelect>
      </Box>
    </>
  )
}
