import { TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import MuiTypography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'
import { Card, Step, Typography } from './blocks'

function AttributesContent({ selected }: AttributesProps): ReactElement {
  switch (selected?.__typename) {
    case 'CardBlock':
      return <Card {...selected} />
    case 'StepBlock': {
      const block = selected.children.find(
        (block) =>
          block.__typename === 'CardBlock' || block.__typename === 'VideoBlock'
      )
      return (
        <>
          <Step {...selected} />
          {block != null && <AttributesContent selected={block} />}
        </>
      )
    }
    case 'TypographyBlock': {
      return <Typography {...selected} />
    }
    case 'VideoBlock': {
      return <p>Video Attributes</p>
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
        <MuiTypography align="center">{`Editing ${
          // Properly map typename to labels when doing translations
          selected.__typename === 'StepBlock'
            ? 'Card'
            : selected.__typename.replace('Block', '')
        } Properties`}</MuiTypography>
      </Box>
    </>
  )
}
