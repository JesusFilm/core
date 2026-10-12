import { CombinedGraphQLErrors } from '@apollo/client'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo, useState } from 'react'

import { TranslationProgressBar } from '@core/journeys/ui/TranslationProgressBar'
import {
  CampaignAiTranslateVariables,
  isMachineTranslatable,
  useCampaignAiTranslateSubscription
} from '@core/journeys/ui/useCampaignAiTranslateSubscription'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'
import type { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_languages as CampaignLanguage
} from '../../../../__generated__/GetCampaign'
import { useCampaignLanguageAddMutation } from '../../../libs/useCampaignLanguageAddMutation'
import { useCampaignLanguageRemoveMutation } from '../../../libs/useCampaignLanguageRemoveMutation'

interface LanguagesPanelProps {
  campaign: Campaign
}

/** Autonym first, the English name beside it when it differs. */
export function languageNames(language: CampaignLanguage): {
  autonym: string
  localName?: string
} {
  const names = language.language.name
  const autonym =
    names.find((name) => name.primary)?.value ??
    names[0]?.value ??
    language.languageId
  const localName = names.find((name) => !name.primary)?.value
  return {
    autonym,
    localName:
      localName != null && localName !== autonym ? localName : undefined
  }
}

function messageOf(error: unknown): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0] != null)
    return error.errors[0].message
  return error instanceof Error ? error.message : String(error)
}

/**
 * The campaign's Page Languages: the current list in selector order with
 * Remove on each (the default language cannot be removed; the API's
 * `CONFLICT` message is shown verbatim when a removal is refused), and the
 * shared language autocomplete (autonym plus English name) to add one
 * through `campaignLanguageAdd`. Neither is a Command. Adding a language
 * machine-translates the whole campaign into it, with progress; a language
 * the model does not support is marked "manual only" and is added without
 * that run.
 */
export function LanguagesPanel({
  campaign
}: LanguagesPanelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [error, setError] = useState<string>()
  const [sweep, setSweep] = useState<CampaignAiTranslateVariables>()
  const [languageAdd, { loading: adding }] = useCampaignLanguageAddMutation()
  const [languageRemove, { loading: removing }] =
    useCampaignLanguageRemoveMutation()
  const { data, loading } = useLanguagesQuery({ languageId: '529' })
  const { data: sweepData } = useCampaignAiTranslateSubscription({
    variables: sweep,
    onError: (sweepError) => {
      setError(sweepError.message)
      setSweep(undefined)
    },
    onComplete: () => setSweep(undefined)
  })

  const languages = useMemo(
    () => [...campaign.languages].sort((a, b) => a.order - b.order),
    [campaign.languages]
  )
  const options = useMemo(() => {
    const taken = new Set(languages.map((language) => language.languageId))
    return data?.languages.filter((language) => !taken.has(language.id)) ?? []
  }, [data, languages])

  async function handleAdd(option?: LanguageOption): Promise<void> {
    if (option == null) return
    setError(undefined)
    try {
      await languageAdd({
        variables: { campaignId: campaign.id, languageId: option.id }
      })
      if (isMachineTranslatable(option.id))
        setSweep({
          campaignId: campaign.id,
          languageId: option.id,
          mode: 'missing'
        })
    } catch (addError) {
      setError(messageOf(addError))
    }
  }

  async function handleRemove(language: CampaignLanguage): Promise<void> {
    setError(undefined)
    try {
      await languageRemove({
        variables: { campaignId: campaign.id, languageId: language.languageId }
      })
    } catch (removeError) {
      setError(messageOf(removeError))
    }
  }

  return (
    <Stack
      spacing={3}
      data-testid="CampaignLanguagesPanel"
      sx={{ p: 4, width: 400 }}
    >
      <Stack spacing={1}>
        <Typography variant="h6">{t('Languages')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'Visitors read the campaign in one of these languages. The default language is the one you write in; every other language is a translation of it.'
          )}
        </Typography>
      </Stack>
      <List disablePadding data-testid="CampaignLanguagesList">
        {languages.map((language) => {
          const isDefault = language.languageId === campaign.defaultLanguageId
          const { autonym, localName } = languageNames(language)
          const manualOnly =
            !isDefault && !isMachineTranslatable(language.languageId)
          const removeButton = (
            <IconButton
              edge="end"
              aria-label={t('Remove {{language}}', { language: autonym })}
              disabled={isDefault || removing}
              onClick={async () => await handleRemove(language)}
            >
              <Trash2Icon />
            </IconButton>
          )
          return (
            <ListItem
              key={language.id}
              disableGutters
              data-testid={`CampaignLanguage-${language.languageId}`}
              secondaryAction={
                isDefault ? (
                  <Tooltip title={t('The default language cannot be removed')}>
                    <span>{removeButton}</span>
                  </Tooltip>
                ) : (
                  removeButton
                )
              }
            >
              <ListItemText
                primary={autonym}
                secondary={[
                  localName,
                  isDefault ? t('Default') : undefined,
                  manualOnly ? t('Manual only') : undefined
                ]
                  .filter((part) => part != null)
                  .join(' · ')}
              />
            </ListItem>
          )
        })}
      </List>
      <LanguageAutocomplete
        onChange={async (option) => await handleAdd(option)}
        value={undefined}
        languages={options}
        loading={loading || adding}
        disabled={adding || sweep != null}
        helperText={t('Add a language')}
      />
      {sweep != null && (
        <Stack data-testid="CampaignLanguageSweep">
          <TranslationProgressBar
            progress={sweepData?.campaignAiTranslateSubscription.progress ?? 0}
            message={
              sweepData?.campaignAiTranslateSubscription.message ??
              t('Starting translation...')
            }
          />
        </Stack>
      )}
      {error != null && (
        <Alert severity="error" data-testid="CampaignLanguagesError">
          {error}
        </Alert>
      )}
    </Stack>
  )
}
