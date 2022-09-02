import { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { JourneysReportType, Role } from '../../../__generated__/globalTypes'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetUserRole } from '../../../__generated__/GetUserRole'
import { MemoizedDynamicReport } from '../DynamicPowerBiReport'
import { Properties } from './Properties'
import { CardView } from './CardView'
import { SlugDialog } from './Properties/JourneyLink/SlugDialog'
import { EmbedJourneyDialog } from './Properties/JourneyLink/EmbedJourneyDialog'
import { TitleDescription } from './TitleDescription'

export const GET_USER_ROLE = gql`
  query GetUserRole {
    getUserRole {
      id
      roles
    }
  }
`

export function JourneyView(): ReactElement {
  const { journey } = useJourney()
  const { reports } = useFlags()
  const blocks =
    journey?.blocks != null
      ? (transformer(journey.blocks) as Array<TreeBlock<StepBlock>>)
      : undefined
  const { data } = useQuery<GetUserRole>(GET_USER_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  const [showSlugDialog, setShowSlugDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Box sx={{ mr: { sm: '328px' }, mb: '80px' }}>
      <Stack
        direction={smUp ? 'row' : 'column-reverse'}
        spacing={10}
        sx={{ backgroundColor: 'background.paper' }}
      >
        {/* if template: SocialImage */}
        <Stack direction="column" spacing={6} sx={{ width: '100%' }}>
          {/* if template: DatePreview */}
          <TitleDescription isPublisher={isPublisher} />
        </Stack>
      </Stack>
      <Properties />

      {reports && journey != null && journey.template !== true && (
        <>
          <Box
            sx={{ height: '213px', pb: 6, mx: 6 }}
            data-testid="power-bi-report"
          >
            <MemoizedDynamicReport
              reportType={JourneysReportType.singleSummary}
              journeyId={journey.id}
            />
          </Box>
        </>
      )}

      {journey?.template !== true && (
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Divider />
          <Box
            sx={{
              p: 6,
              backgroundColor: !reports ? 'background.paper' : undefined
            }}
          >
            {/* JourneyLink */}
          </Box>
          <Divider />
        </Box>
      )}

      <>
        <CardView id={journey?.id} blocks={blocks} />
        {/* JourneyViewFab */}
      </>

      <SlugDialog
        open={showSlugDialog}
        onClose={() => setShowSlugDialog(false)}
      />
      <EmbedJourneyDialog
        open={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
      />
    </Box>
  )
}
