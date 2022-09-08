import { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { useTheme } from '@mui/material/styles'
import { JourneysReportType, Role } from '../../../__generated__/globalTypes'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetUserRole } from '../../../__generated__/GetUserRole'
import { MemoizedDynamicReport } from '../DynamicPowerBiReport'
import { Properties } from './Properties'
import { CardView } from './CardView'
import { SlugDialog } from './JourneyLink/SlugDialog'
import { EmbedJourneyDialog } from './JourneyLink/EmbedJourneyDialog'
import { TitleDescription } from './TitleDescription'
import { SocialImage } from './SocialImage'
import { DatePreview } from './DatePreview'
import { JourneyViewFab } from './JourneyViewFab'
import { JourneyLink } from './JourneyLink'

export const GET_USER_ROLE = gql`
  query GetUserRole {
    getUserRole {
      id
      roles
    }
  }
`

export type JourneyType = 'Journey' | 'Template'

interface JourneyViewProps {
  journeyType: JourneyType
}

export function JourneyView({ journeyType }: JourneyViewProps): ReactElement {
  const { journey } = useJourney()
  const { reports } = useFlags()
  const theme = useTheme()
  const blocks =
    journey?.blocks != null
      ? (transformer(journey.blocks) as Array<TreeBlock<StepBlock>>)
      : undefined
  const { data } = useQuery<GetUserRole>(GET_USER_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  const [showSlugDialog, setShowSlugDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  return (
    <Box sx={{ mr: { sm: '328px' }, mb: '80px' }}>
      <Box
        sx={{
          p: { xs: 6, sm: 8 },
          display: 'flex',
          backgroundColor: 'background.paper',
          [theme.breakpoints.up('md')]: {
            flexDirection: 'row'
          },
          [theme.breakpoints.down('md')]: {
            flexDirection: 'column-reverse'
          },
          alignItems: { md: 'flex-start', lg: 'flex-start' }
        }}
      >
        {journey?.template === true && <SocialImage />}
        <Stack
          direction="column"
          spacing={6}
          sx={{
            [theme.breakpoints.up('md')]: {
              ml: journeyType === 'Template' ? 10 : 0
            },
            [theme.breakpoints.down('md')]: {
              mb: 10
            },
            width: '100%'
          }}
        >
          {journeyType === 'Template' && <DatePreview />}
          <TitleDescription isPublisher={isPublisher} />
        </Stack>
      </Box>
      <Properties journeyType={journeyType} isPublisher={isPublisher} />

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

      {journeyType === 'Journey' && (
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Divider />
          <Box
            sx={{
              p: 6,
              backgroundColor: !reports ? 'background.paper' : undefined
            }}
          >
            <JourneyLink />
          </Box>
          <Divider />
        </Box>
      )}

      <>
        <CardView id={journey?.id} blocks={blocks} />
        <JourneyViewFab isPublisher={isPublisher} />
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
