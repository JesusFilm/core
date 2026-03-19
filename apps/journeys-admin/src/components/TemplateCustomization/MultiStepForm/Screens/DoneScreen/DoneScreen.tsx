import { gql, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TemplateCardPreviewItem } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview/TemplateCardPreviewItem'
import { transformer } from '@core/journeys/ui/transformer'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import ArrowRightContained1Icon from '@core/shared/ui/icons/ArrowRightContained1'
import Play3Icon from '@core/shared/ui/icons/Play3'

import { NotificationSwitch } from '../../../../AccessDialog/NotificationSwitch'
import { ShareItem } from '../../../../Editor/Toolbar/Items/ShareItem'
import { useIntegrationGoogleCreate } from '../../../../Google/GoogleCreateIntegration/libs/useIntegrationGoogleCreate'
import { GoogleSheetsSyncDialog } from '../../../../JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog/GoogleSheetsSyncDialog'
import { ScreenWrapper } from '../ScreenWrapper'

export const GET_GOOGLE_SHEETS_SYNCS_FOR_DONE_SCREEN = gql`
  query GoogleSheetsSyncsForDoneScreen($filter: GoogleSheetsSyncsFilter!) {
    googleSheetsSyncs(filter: $filter) {
      id
      deletedAt
    }
  }
`

interface GoogleSheetsSyncsForDoneScreenData {
  googleSheetsSyncs: Array<{ id: string; deletedAt: string | null }>
}

interface GoogleSheetsSyncsForDoneScreenVariables {
  filter: { journeyId: string }
}

export function DoneScreen(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const { emailResponseToggle } = useFlags()
  const router = useRouter()
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)

  useIntegrationGoogleCreate({
    teamId: journey?.team?.id,
    onSuccess: () => {
      enqueueSnackbar(t('Google integration created successfully'), {
        variant: 'success'
      })
      setSyncDialogOpen(true)
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  useEffect(() => {
    if (journey?.id == null) return
    const openSyncDialog = router.query.openSyncDialog === 'true'
    const hasCode = router.query.code != null
    if (openSyncDialog && !hasCode) {
      setSyncDialogOpen(true)
    }
  }, [journey?.id, router.query.openSyncDialog, router.query.code])

  const { data: syncsData, refetch: refetchSyncs } = useQuery<
    GoogleSheetsSyncsForDoneScreenData,
    GoogleSheetsSyncsForDoneScreenVariables
  >(GET_GOOGLE_SHEETS_SYNCS_FOR_DONE_SCREEN, {
    variables: { filter: { journeyId: journey?.id ?? '' } },
    skip: journey?.id == null
  })

  const hasActiveSyncs =
    syncsData?.googleSheetsSyncs.some((sync) => sync.deletedAt == null) ?? false

  const journeyPath = `/api/preview?slug=${journey?.slug}`
  const href = journey?.slug != null ? journeyPath : undefined

  const steps = transformer(journey?.blocks ?? []) as Array<
    TreeBlock<StepBlock>
  >

  const [navigating, setNavigating] = useState(false)

  function handleGoToProjectsDashboard(): void {
    if (journey?.id != null) {
      setNavigating(true)
      void router.push('/')
    }
  }

  function handleSyncDialogOpen(): void {
    setSyncDialogOpen(true)
  }

  function handleSyncDialogClose(): void {
    setSyncDialogOpen(false)
    void refetchSyncs()
  }

  return (
    <ScreenWrapper
      title={t('Ready to share!')}
      subtitle={t('Share your unique link on any platform.')}
      footer={
        <Button
          data-testid="ProjectsDashboardButton"
          onClick={handleGoToProjectsDashboard}
          loading={navigating}
          endIcon={<ArrowRightContained1Icon />}
          sx={{ mt: 4 }}
        >
          <Typography variant="subtitle2">
            {t('Go To Projects Dashboard')}
          </Typography>
        </Button>
      }
    >
      {steps.length > 0 && (
        <TemplateCardPreviewItem step={steps[0]} variant="standard" />
      )}

      <Stack
        spacing={4}
        sx={{ direction: { xs: 'column', sm: 'row' }, mt: 6, width: '100%' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            width: '100%',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'center',
            gap: { xs: 3, sm: 2 }
          }}
        >
          <Button
            data-testid="DoneScreenPreviewButton"
            variant="outlined"
            color="secondary"
            href={href}
            component={href != null ? 'a' : 'button'}
            target={href != null ? '_blank' : undefined}
            startIcon={<Play3Icon />}
            sx={{
              borderWidth: 2,
              borderRadius: 2,
              height: 48,
              width: { xs: '100%', sm: 216 },
              borderColor: 'secondary.light'
            }}
          >
            <Typography variant="subtitle2">{t('Preview')}</Typography>
          </Button>
          <ShareItem
            variant="button"
            journey={journey}
            buttonVariant="icon"
            buttonProps={{
              sx: {
                width: { xs: '100%', sm: 216 },
                height: 48,
                borderRadius: 2
              }
            }}
          />
        </Stack>
        <Stack
          spacing={6}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 5
          }}
        >
          <Typography variant="subtitle1">
            {emailResponseToggle === true
              ? t('Choose where responses go:')
              : t('Collect your responses:')}
          </Typography>
          <Stack spacing={2}>
            {emailResponseToggle === true && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">{t('Send to my email')}</Typography>
                <NotificationSwitch journeyId={journey?.id} />
              </Stack>
            )}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">
                {t('Sync to Google Sheets')}
              </Typography>
              <Button
                data-testid="GoogleSheetsSyncButton"
                onClick={handleSyncDialogOpen}
                color="error"
                aria-label={
                  hasActiveSyncs
                    ? t('Edit Google Sheets sync')
                    : t('Sync to Google Sheets')
                }
              >
                <Typography variant="subtitle2">
                  {hasActiveSyncs ? t('Edit') : t('Sync')}
                </Typography>
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      {journey?.id != null && (
        <GoogleSheetsSyncDialog
          open={syncDialogOpen}
          onClose={handleSyncDialogClose}
          journeyId={journey.id}
        />
      )}
    </ScreenWrapper>
  )
}
