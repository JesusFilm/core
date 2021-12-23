import { TreeBlock } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourneyForEdit'
import { Card, Step } from './blocks'

function AttributesContent({ selected }: AttributesProps): ReactElement {
  switch (selected?.__typename) {
    case 'CardBlock':
      return <Card {...selected} />
    case 'StepBlock': {
      const card = selected.children.find(
        (block) => block.__typename === 'CardBlock'
      ) as TreeBlock<CardBlock> | undefined
      return (
        <>
          <Step {...selected} />
          {card != null && <Card {...card} />}
        </>
      )
    }
    default:
      return <></>
  }
}

interface AttributesProps {
  selected: TreeBlock
}

export function Attributes({ selected }: AttributesProps): ReactElement {
  return (
    <>
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <AttributesContent selected={selected} />
      </Stack>
      <Box
        sx={{
          py: 4.25,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography align="center">Editing Card Properties</Typography>
      </Box>
    </>
  )
}
