import { ReactElement } from 'react'
import { transformer, TreeBlock } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import Fab from '@mui/material/Fab'
import NextLink from 'next/link'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { useJourney } from '../../libs/context'
import { Properties } from './Properties'
import { CardView } from './CardView'

export function JourneyView(): ReactElement {
  const journey = useJourney()
  const blocks = journey.blocks != null ? transformer(journey.blocks) : []

  return (
    <Box sx={{ mr: { sm: '328px' }, mb: '80px' }}>
      <Box sx={{ p: { xs: 6, sm: 8 }, backgroundColor: 'background.paper' }}>
        <Typography variant="h4">{journey.title}</Typography>
        <Typography variant="body1">{journey.description}</Typography>
      </Box>
      <Properties />
      <CardView
        slug={journey.slug}
        blocks={blocks as Array<TreeBlock<StepBlock>>}
      />
      <NextLink href={`/journeys/${journey.slug}/edit`} passHref>
        <Fab
          variant="extended"
          size="large"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: { xs: 20, sm: 348 }
          }}
          color="primary"
        >
          <EditIcon sx={{ mr: 3 }} />
          Edit
        </Fab>
      </NextLink>
    </Box>
  )
}
