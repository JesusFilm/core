import { ReactElement, useState } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import Fab from '@mui/material/Fab'
import Skeleton from '@mui/material/Skeleton'
import NextLink from 'next/link'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { DynamicPowerBiReport } from '../DynamicPowerBiReport'
import { Properties } from './Properties'
import { CardView } from './CardView'
import { SlugDialog } from './Properties/SlugDialog'

export function JourneyView(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { analytics } = useFlags()
  const blocks =
    journey?.blocks != null
      ? (transformer(journey.blocks) as Array<TreeBlock<StepBlock>>)
      : undefined

  const [showSlugDialog, setShowSlugDialog] = useState(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Box sx={{ mr: { sm: '328px' }, mb: '80px' }}>
      <Box sx={{ p: { xs: 6, sm: 8 }, backgroundColor: 'background.paper' }}>
        <Typography variant="h4">
          {journey != null ? (
            journey.title
          ) : (
            <Skeleton variant="text" width="60%" />
          )}
        </Typography>
        <Typography variant="body1">
          {journey != null ? (
            journey.description
          ) : (
            <Skeleton variant="text" width="80%" />
          )}
        </Typography>
      </Box>

      <Properties />

      {analytics && (
        <>
          <Box sx={{ height: '213px', pb: 6, mx: 6 }}>
            <DynamicPowerBiReport
              reportType={JourneysReportType.singleSummary}
            />
          </Box>
          <Divider />
        </>
      )}

      {!smUp && (
        <>
          <Box sx={{ p: 6 }}>
            <CopyTextField
              value={
                journey?.slug != null
                  ? `https://your.nextstep.is/${journey.slug}`
                  : undefined
              }
              label={t('Journey URL')}
            />
            <Box sx={{ pt: 2 }}>
              <Button
                onClick={() => setShowSlugDialog(true)}
                size="small"
                startIcon={<EditIcon />}
                disabled={journey == null}
              >
                {t('Edit URL')}
              </Button>
            </Box>
          </Box>
          <Divider />
        </>
      )}

      <>
        <CardView id={journey?.id} blocks={blocks} />
        <NextLink
          href={journey != null ? `/journeys/${journey.id}/edit` : ''}
          passHref
        >
          <Fab
            variant="extended"
            size="large"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: { xs: 20, sm: 348 }
            }}
            color="primary"
            disabled={journey == null}
          >
            <EditIcon sx={{ mr: 3 }} />
            Edit
          </Fab>
        </NextLink>
      </>

      <SlugDialog
        open={showSlugDialog}
        onClose={() => setShowSlugDialog(false)}
      />
    </Box>
  )
}
