import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo, useState } from 'react'

import { TranslationProgressBar } from '@core/journeys/ui/TranslationProgressBar'
import {
  CampaignAiTranslateVariables,
  isMachineTranslatable,
  useCampaignAiTranslateSubscription
} from '@core/journeys/ui/useCampaignAiTranslateSubscription'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignTranslationFilter,
  CampaignTranslationGroup
} from '../../../../__generated__/globalTypes'
import { useCampaignTranslationsQuery } from '../../../libs/useCampaignTranslationsQuery'
import { languageNames } from '../LanguagesPanel/LanguagesPanel'

import { TranslationRowItem } from './TranslationRow'
import {
  TRANSLATION_FILTERS,
  TRANSLATION_GROUPS,
  TranslationFilter,
  matchesFilter,
  rowKey
} from './translationRows'

interface TranslationsViewProps {
  campaign: Campaign
  /** The language to open on; the first non-default campaign language when absent or the default. */
  initialLanguageId?: string
}

/**
 * The review surface for translated text: one campaign language at a time,
 * every Translated Field grouped Interface, Landing page, Region page and
 * Regions, filtered All, Needs review, Machine-translated, Missing or Edited.
 * The list is read once with every row and filtered here, so a row an author
 * edits turns Edited and leaves a Needs review or Missing filter as soon as
 * the write lands. Only languages other than the default are listed: the
 * default's text is the field itself. "Machine-translate missing" fills the
 * language's gaps with progress, never touching a line a person wrote; it
 * runs only when pressed, not after edits. A language the model does not
 * support is manual only and has no such button.
 */
export function TranslationsView({
  campaign,
  initialLanguageId
}: TranslationsViewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const languages = useMemo(
    () =>
      campaign.languages
        .filter(
          (language) => language.languageId !== campaign.defaultLanguageId
        )
        .sort((a, b) => a.order - b.order),
    [campaign.languages, campaign.defaultLanguageId]
  )
  const [chosenLanguageId, setChosenLanguageId] = useState(initialLanguageId)
  const [filter, setFilter] = useState<TranslationFilter>('all')
  const [translating, setTranslating] = useState<CampaignAiTranslateVariables>()
  const [translateError, setTranslateError] = useState<string>()
  const { data: progressData } = useCampaignAiTranslateSubscription({
    variables: translating,
    onError: (error) => {
      setTranslateError(error.message)
      setTranslating(undefined)
    },
    onComplete: () => setTranslating(undefined)
  })
  const languageId = languages.some(
    (language) => language.languageId === chosenLanguageId
  )
    ? chosenLanguageId
    : languages[0]?.languageId
  const queryVariables =
    languageId == null
      ? undefined
      : {
          campaignId: campaign.id,
          languageId,
          filter: CampaignTranslationFilter.all
        }
  const { data, loading, error } = useCampaignTranslationsQuery(queryVariables)

  const groupLabels: Record<CampaignTranslationGroup, string> = {
    [CampaignTranslationGroup.interface]: t('Interface'),
    [CampaignTranslationGroup.landing]: t('Landing page'),
    [CampaignTranslationGroup.region]: t('Region page'),
    [CampaignTranslationGroup.regions]: t('Regions')
  }
  const filterLabels: Record<TranslationFilter, string> = {
    all: t('All'),
    needsReview: t('Needs review'),
    machine: t('Machine-translated'),
    missing: t('Missing'),
    edited: t('Edited')
  }

  if (languageId == null || queryVariables == null)
    return (
      <Stack
        spacing={1}
        data-testid="TranslationsView"
        sx={{ p: 4, width: 640 }}
      >
        <Typography variant="h6">{t('Translations')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Add a language to the campaign to start translating it.')}
        </Typography>
      </Stack>
    )

  const rows = (data?.campaignTranslations ?? []).filter((row) =>
    matchesFilter(row, filter)
  )
  const manualOnly = !isMachineTranslatable(languageId)

  function handleMachineTranslateMissing(): void {
    if (languageId == null) return
    setTranslateError(undefined)
    setTranslating({ campaignId: campaign.id, languageId, mode: 'missing' })
  }

  return (
    <Stack spacing={3} data-testid="TranslationsView" sx={{ p: 4, width: 640 }}>
      <Stack spacing={1}>
        <Typography variant="h6">{t('Translations')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'Review each line in a language. Editing a line saves it as your own wording.'
          )}
        </Typography>
      </Stack>
      <TextField
        select
        size="small"
        label={t('Language')}
        value={languageId}
        disabled={translating != null}
        onChange={(event) => setChosenLanguageId(event.target.value)}
      >
        {languages.map((language) => {
          const { autonym, localName } = languageNames(language)
          return (
            <MenuItem key={language.id} value={language.languageId}>
              {localName == null ? autonym : `${autonym} · ${localName}`}
            </MenuItem>
          )
        })}
      </TextField>
      {manualOnly ? (
        <Typography
          variant="body2"
          color="text.secondary"
          data-testid="TranslationsManualOnly"
        >
          {t(
            'Manual only: machine translation does not cover this language, so write each line yourself.'
          )}
        </Typography>
      ) : (
        <Button
          variant="outlined"
          size="small"
          disabled={translating != null}
          onClick={handleMachineTranslateMissing}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('Machine-translate missing')}
        </Button>
      )}
      {translating != null && (
        <Stack data-testid="TranslationsProgress">
          <TranslationProgressBar
            progress={
              progressData?.campaignAiTranslateSubscription.progress ?? 0
            }
            message={
              progressData?.campaignAiTranslateSubscription.message ??
              t('Starting translation...')
            }
          />
        </Stack>
      )}
      {translateError != null && (
        <Alert severity="error" data-testid="TranslationsTranslateError">
          {translateError}
        </Alert>
      )}
      <Stack
        direction="row"
        role="group"
        aria-label={t('Filter')}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        {TRANSLATION_FILTERS.map((option) => (
          <Chip
            key={option}
            label={filterLabels[option]}
            color={option === filter ? 'primary' : 'default'}
            variant={option === filter ? 'filled' : 'outlined'}
            aria-pressed={option === filter}
            onClick={() => setFilter(option)}
          />
        ))}
      </Stack>
      {loading && data == null && (
        <Stack sx={{ alignItems: 'center' }}>
          <CircularProgress />
        </Stack>
      )}
      {error != null && <Alert severity="error">{error.message}</Alert>}
      {data != null && rows.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          data-testid="TranslationsEmpty"
        >
          {t('Nothing to show here.')}
        </Typography>
      )}
      {TRANSLATION_GROUPS.map((group) => {
        const groupRows = rows.filter((row) => row.group === group)
        if (groupRows.length === 0) return null
        return (
          <Stack key={group} data-testid={`TranslationGroup-${group}`}>
            <Typography variant="subtitle1" component="h3">
              {groupLabels[group]}
            </Typography>
            <Divider />
            {groupRows.map((row) => (
              <TranslationRowItem
                key={rowKey(row)}
                row={row}
                languageId={languageId}
                queryVariables={queryVariables}
              />
            ))}
          </Stack>
        )
      })}
    </Stack>
  )
}
