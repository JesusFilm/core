import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next/pages'
import {
  ReactElement,
  SyntheticEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'

import { GetCampaign_campaign as Campaign } from '../../../__generated__/GetCampaign'
import { GetCampaignCountryStats_campaign_countryStats as CountryStats } from '../../../__generated__/GetCampaignCountryStats'
import { JourneyStatus } from '../../../__generated__/globalTypes'
import { buildCampaignPublicUrl } from '../../libs/buildCampaignPublicUrl'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { useCampaignQuery } from '../../libs/useCampaignQuery'
import { useCanPublishCollection } from '../../libs/useCanPublishCollection'
import {
  MuxVideoUploadProvider,
  useMuxVideoUpload
} from '../MuxVideoUploadProvider'

import { CampaignAnalyticsPanel } from './CampaignAnalyticsPanel'
import { CampaignBuilderActions } from './CampaignBuilderActions'
import { CampaignJourneysSection, pickOrdered } from './CampaignJourneysSection'
import { CampaignPreviewPane } from './CampaignPreviewPane'
import { CampaignSettingsForm } from './CampaignSettingsForm'
import { useCampaignForm } from './useCampaignForm'
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'

interface CampaignBuilderProps {
  campaignId: string
}

type BuilderTab = 'content' | 'journeys' | 'analytics'

const JOURNEY_STATUSES = [JourneyStatus.draft, JourneyStatus.published]

function CampaignBuilderForm({
  campaign
}: {
  campaign: Campaign
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const teamId = campaign.team.id
  const { getUploadStatus, cancelUploadForBlock } = useMuxVideoUpload()
  const uploadKey = useId()
  const cancelUploadRef = useRef(cancelUploadForBlock)
  cancelUploadRef.current = cancelUploadForBlock
  useEffect(() => {
    return () => {
      cancelUploadRef.current({ id: uploadKey })
    }
  }, [uploadKey])

  const { data: shareData } = useAdminJourneysQuery({
    teamId,
    template: false,
    status: JOURNEY_STATUSES
  })
  const { data: templateData } = useAdminJourneysQuery({
    teamId,
    template: true,
    status: JOURNEY_STATUSES
  })
  const sharePool = useMemo(() => shareData?.journeys ?? [], [shareData])
  const templatePool = useMemo(
    () => templateData?.journeys ?? [],
    [templateData]
  )

  const { canPublish, reason } = useCanPublishCollection({ teamId })
  const publishBlockedReason = reason != null ? t(reason) : null
  const publicUrl = buildCampaignPublicUrl(campaign.slug)
  const publicOrigin = publicUrl.replace(/\/campaign\/.*$/, '')

  const {
    initialValues,
    schema,
    isPublished,
    handleSubmit,
    setSubmitIntent,
    handleUnpublish,
    isUnpublishing,
    isDirty
  } = useCampaignForm({ campaign })

  const [tab, setTab] = useState<BuilderTab>('content')
  const [countryStats, setCountryStats] = useState<CountryStats | null>(null)

  function isMediaBlocked(): boolean {
    const task = getUploadStatus(uploadKey)
    return task?.status === 'uploading' || task?.status === 'processing'
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      // Re-seed from the cache after a successful save so `dirty` clears
      // without a manual reset; Formik deep-compares initialValues so an
      // unrelated cache write does not wipe in-progress edits.
      enableReinitialize
      onSubmit={async (values, helpers) => {
        if (isMediaBlocked()) return
        await handleSubmit(values, helpers)
      }}
    >
      {({ values, isSubmitting, submitForm }) => {
        const dirty = isDirty(values)
        const uploadTask = getUploadStatus(uploadKey)
        const uploadInFlight =
          uploadTask?.status === 'uploading' ||
          uploadTask?.status === 'processing'
        return (
          <Form
            style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <UnsavedChangesGuard dirty={dirty || uploadInFlight} />
            <CampaignBuilderActions
              title={values.title !== '' ? values.title : campaign.title}
              isPublished={isPublished}
              publicUrl={publicUrl}
              dirty={dirty}
              isSubmitting={isSubmitting}
              isUnpublishing={isUnpublishing}
              submitBlocked={uploadInFlight}
              canPublish={canPublish}
              publishBlockedReason={publishBlockedReason}
              onSave={() => void submitForm()}
              onPublish={() => {
                setSubmitIntent('publish')
                void submitForm()
              }}
              onUnpublish={() => void handleUnpublish()}
            />
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              sx={{ alignItems: 'stretch' }}
            >
              <CampaignPreviewPane
                values={values}
                shareJourneys={pickOrdered(values.shareJourneyIds, sharePool)}
                templateJourneys={pickOrdered(
                  values.templateJourneyIds,
                  templatePool
                )}
                countryStats={countryStats}
                publicOrigin={publicOrigin}
              />
              <Box sx={{ flex: 1, minWidth: 0, px: { xs: 2, md: 4 }, py: 3 }}>
                <Tabs
                  value={tab}
                  onChange={(_event: SyntheticEvent, next: BuilderTab) =>
                    setTab(next)
                  }
                  sx={{ mb: 3 }}
                  aria-label={t('Campaign builder sections')}
                >
                  <Tab
                    value="content"
                    label={t('Content')}
                    data-testid="CampaignBuilderTabContent"
                  />
                  <Tab
                    value="journeys"
                    label={t('Journeys')}
                    data-testid="CampaignBuilderTabJourneys"
                  />
                  <Tab
                    value="analytics"
                    label={t('Analytics')}
                    data-testid="CampaignBuilderTabAnalytics"
                  />
                </Tabs>
                {/* Keep every tab mounted so Formik fields and the upload task survive tab switches. */}
                <Box sx={{ display: tab === 'content' ? 'block' : 'none' }}>
                  <CampaignSettingsForm
                    uploadKey={uploadKey}
                    uploadInFlight={uploadInFlight}
                  />
                </Box>
                <Box sx={{ display: tab === 'journeys' ? 'block' : 'none' }}>
                  <CampaignJourneysSection
                    shareJourneys={sharePool}
                    templateJourneys={templatePool}
                  />
                </Box>
                <Box sx={{ display: tab === 'analytics' ? 'block' : 'none' }}>
                  <CampaignAnalyticsPanel
                    campaign={campaign}
                    onCountryStats={setCountryStats}
                  />
                </Box>
              </Box>
            </Stack>
          </Form>
        )
      }}
    </Formik>
  )
}

function UnsavedChangesGuard({ dirty }: { dirty: boolean }): null {
  useUnsavedChangesGuard(dirty)
  return null
}

export function CampaignBuilder({
  campaignId
}: CampaignBuilderProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { data, loading, error } = useCampaignQuery({ id: campaignId })
  const campaign = data?.campaign

  if (campaign == null) {
    if (loading) {
      return (
        <Stack spacing={2} sx={{ p: 4 }} data-testid="CampaignBuilderLoading">
          <Skeleton variant="rectangular" height={64} />
          <Skeleton variant="rectangular" height={320} />
        </Stack>
      )
    }
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error != null
          ? t("Couldn't load this campaign. Refresh to try again.")
          : t('Campaign not found.')}
      </Alert>
    )
  }

  return (
    <MuxVideoUploadProvider>
      <CampaignBuilderForm campaign={campaign} />
    </MuxVideoUploadProvider>
  )
}
