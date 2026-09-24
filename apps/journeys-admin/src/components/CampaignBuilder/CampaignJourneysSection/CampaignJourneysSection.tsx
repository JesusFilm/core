import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo } from 'react'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyPickerField } from '../../TemplateGalleryPageList/CollectionDialog/JourneyPickerField'
import { CampaignFormValues } from '../useCampaignForm'

import { CampaignJourneyOrderList } from './CampaignJourneyOrderList'

interface CampaignJourneysSectionProps {
  /** Team journeys that are not templates — the share-panel pool. */
  shareJourneys: readonly Journey[]
  /** Team template journeys — the customizable-collection pool. */
  templateJourneys: readonly Journey[]
}

export function pickOrdered(
  ids: readonly string[],
  pool: readonly Journey[]
): Journey[] {
  const byId = new Map(pool.map((journey) => [journey.id, journey]))
  return ids
    .map((id) => byId.get(id))
    .filter((journey): journey is Journey => journey != null)
}

/** The two journey pickers (share panel + template collection) with ordering. */
export function CampaignJourneysSection({
  shareJourneys,
  templateJourneys
}: CampaignJourneysSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { values, setFieldValue, setFieldTouched, isSubmitting } =
    useFormikContext<CampaignFormValues>()

  const selectedShare = useMemo(
    () => pickOrdered(values.shareJourneyIds, shareJourneys),
    [values.shareJourneyIds, shareJourneys]
  )
  const selectedTemplates = useMemo(
    () => pickOrdered(values.templateJourneyIds, templateJourneys),
    [values.templateJourneyIds, templateJourneys]
  )
  const hasDraftShare = selectedShare.some(
    (journey) => journey.status === JourneyStatus.draft
  )

  return (
    <Stack spacing={4} data-testid="CampaignJourneysSection">
      <Stack spacing={2}>
        <JourneyPickerField
          label={t('Share panel journeys')}
          placeholder={t('Pick one journey per language')}
          availableJourneys={shareJourneys}
          journeyIds={values.shareJourneyIds}
          disabled={isSubmitting}
          onChange={(next) => {
            void setFieldValue('shareJourneyIds', next)
          }}
          onTouch={() => {
            void setFieldTouched('shareJourneyIds', true, false)
          }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t(
            'Visitors pick a language and get that journey as a link and QR code. Use one journey per language.'
          )}
        </Typography>
        {hasDraftShare && (
          <Alert severity="warning" data-testid="CampaignDraftJourneyAlert">
            {t(
              'Draft journeys will not appear on the public page until they are published.'
            )}
          </Alert>
        )}
        <CampaignJourneyOrderList
          journeys={selectedShare}
          disabled={isSubmitting}
          onChange={(next) => {
            void setFieldValue('shareJourneyIds', next)
          }}
        />
      </Stack>

      <Stack spacing={2}>
        <JourneyPickerField
          label={t('Templates to customize')}
          placeholder={t('Pick templates to feature')}
          availableJourneys={templateJourneys}
          journeyIds={values.templateJourneyIds}
          disabled={isSubmitting}
          onChange={(next) => {
            void setFieldValue('templateJourneyIds', next)
          }}
          onTouch={() => {
            void setFieldTouched('templateJourneyIds', true, false)
          }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t(
            'Shown as a collection visitors can open and copy into their own team.'
          )}
        </Typography>
        <CampaignJourneyOrderList
          journeys={selectedTemplates}
          disabled={isSubmitting}
          onChange={(next) => {
            void setFieldValue('templateJourneyIds', next)
          }}
        />
      </Stack>
    </Stack>
  )
}
