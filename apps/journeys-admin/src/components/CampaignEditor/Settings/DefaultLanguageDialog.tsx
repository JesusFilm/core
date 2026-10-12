import { CombinedGraphQLErrors } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { TranslationProgressBar } from '@core/journeys/ui/TranslationProgressBar'
import {
  CampaignAiTranslateVariables,
  isMachineTranslatable,
  useCampaignAiTranslateSubscription
} from '@core/journeys/ui/useCampaignAiTranslateSubscription'
import { Dialog } from '@core/shared/ui/Dialog'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { GET_CAMPAIGN } from '../../../libs/useCampaignQuery'
import { useCampaignUpdateMutation } from '../../../libs/useCampaignUpdateMutation'
import { languageNames } from '../LanguagesPanel/LanguagesPanel'

interface DefaultLanguageDialogProps {
  campaign: Campaign
  /** The language to make the default; the dialog is closed when absent. */
  languageId?: string
  onClose: () => void
  /** The swap went through: the campaign was refetched with every text moved. */
  onChanged: () => void
}

function missingCountOf(error: unknown): number | undefined {
  if (!CombinedGraphQLErrors.is(error)) return undefined
  const conflict = error.errors.find(
    (graphQLError) =>
      graphQLError.extensions?.code === 'CONFLICT' &&
      graphQLError.extensions?.field === 'defaultLanguageId'
  )
  const count = conflict?.extensions?.count
  return typeof count === 'number' ? count : undefined
}

/**
 * Confirms a change of the campaign's default language. The API refuses the
 * change until every text exists in the new language (`CONFLICT` with a
 * count); the dialog then offers "Machine-translate missing into <language>"
 * and, when that run completes, asks for the change again. The change is a
 * server-side atomic swap, not a Command, so undo never touches it.
 */
export function DefaultLanguageDialog({
  campaign,
  languageId,
  onClose,
  onChanged
}: DefaultLanguageDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const client = useApolloClient()
  const [campaignUpdate, { loading: changing }] = useCampaignUpdateMutation()
  const [missingCount, setMissingCount] = useState<number>()
  const [sweep, setSweep] = useState<CampaignAiTranslateVariables>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    setMissingCount(undefined)
    setSweep(undefined)
    setError(undefined)
  }, [languageId])

  const { data: sweepData } = useCampaignAiTranslateSubscription({
    variables: sweep,
    onError: (sweepError) => {
      setError(sweepError.message)
      setSweep(undefined)
    },
    onComplete: () => {
      setSweep(undefined)
      void changeDefaultLanguage()
    }
  })

  const target = campaign.languages.find(
    (language) => language.languageId === languageId
  )
  const current = campaign.languages.find(
    (language) => language.languageId === campaign.defaultLanguageId
  )
  const targetName = target == null ? '' : languageNames(target).autonym
  const currentName = current == null ? '' : languageNames(current).autonym
  const translating = sweep != null
  const manualOnly = languageId != null && !isMachineTranslatable(languageId)

  async function changeDefaultLanguage(): Promise<void> {
    if (languageId == null) return
    setError(undefined)
    try {
      await campaignUpdate({
        variables: {
          id: campaign.id,
          input: { defaultLanguageId: languageId }
        },
        refetchQueries: [
          { query: GET_CAMPAIGN, variables: { id: campaign.id } }
        ],
        awaitRefetchQueries: true
      })
      client.cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'campaignTranslations'
      })
      client.cache.gc()
      setMissingCount(undefined)
      onChanged()
    } catch (updateError) {
      const count = missingCountOf(updateError)
      if (count != null) {
        setMissingCount(count)
        return
      }
      setError(
        updateError instanceof Error
          ? updateError.message
          : t('Could not change the default language')
      )
    }
  }

  function handleMachineTranslate(): void {
    if (languageId == null) return
    setError(undefined)
    setSweep({ campaignId: campaign.id, languageId, mode: 'missing' })
  }

  return (
    <Dialog
      open={languageId != null}
      onClose={translating || changing ? undefined : onClose}
      dialogTitle={{
        title: t('Change default language?'),
        closeButton: !translating && !changing
      }}
      dialogAction={
        missingCount == null
          ? {
              onSubmit: () => {
                void changeDefaultLanguage()
              },
              submitLabel: t('Change'),
              closeLabel: t('Cancel')
            }
          : undefined
      }
      dialogActionChildren={
        missingCount == null ? undefined : (
          <Button onClick={onClose} disabled={translating}>
            {t('Cancel')}
          </Button>
        )
      }
      loading={changing || translating}
      testId="CampaignDefaultLanguageDialog"
    >
      <Stack spacing={3}>
        {missingCount == null ? (
          <Typography>
            {t(
              'Every text moves to {{current}} as its translation, and {{language}} becomes the language you write in. Machine translations that become the default lose their machine-translated mark.',
              { current: currentName, language: targetName }
            )}
          </Typography>
        ) : (
          <Stack spacing={2} data-testid="CampaignDefaultLanguageConflict">
            <Typography>
              {t(
                '{{count}} texts have no translation in {{language}} yet, so it cannot become the default.',
                { count: missingCount, language: targetName }
              )}
            </Typography>
            {manualOnly ? (
              <Typography color="text.secondary">
                {t(
                  'Machine translation does not cover this language. Write the missing lines in the Translations view, then try again.'
                )}
              </Typography>
            ) : (
              <Button
                variant="outlined"
                disabled={translating}
                onClick={handleMachineTranslate}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('Machine-translate missing into {{language}}', {
                  language: targetName
                })}
              </Button>
            )}
          </Stack>
        )}
        {translating && (
          <Stack data-testid="CampaignDefaultLanguageSweep">
            <TranslationProgressBar
              progress={
                sweepData?.campaignAiTranslateSubscription.progress ?? 0
              }
              message={
                sweepData?.campaignAiTranslateSubscription.message ??
                t('Starting translation...')
              }
            />
          </Stack>
        )}
        {error != null && (
          <Typography color="error" data-testid="CampaignDefaultLanguageError">
            {error}
          </Typography>
        )}
      </Stack>
    </Dialog>
  )
}
