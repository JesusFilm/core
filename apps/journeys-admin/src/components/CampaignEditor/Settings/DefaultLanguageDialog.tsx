import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { isMachineTranslatable } from '@core/journeys/ui/useCampaignAiTranslateSubscription'
import { Dialog } from '@core/shared/ui/Dialog'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { languageNames } from '../LanguagesPanel/LanguagesPanel'
import { useTranslationRun } from '../TranslationRunProvider'
import {
  missingCountOf,
  useCampaignDefaultLanguageSwap
} from '../utils/useCampaignDefaultLanguageSwap'

interface DefaultLanguageDialogProps {
  campaign: Campaign
  /** The language to make the default; the dialog is closed when absent. */
  languageId?: string
  onClose: () => void
  /** The swap went through: the campaign was refetched with every text moved. */
  onChanged: () => void
}

/**
 * Confirms a change of the campaign's default language. The API refuses the
 * change until every text exists in the new language (`CONFLICT` with a
 * count); the dialog then offers "Machine-translate missing into <language>",
 * which hands the run to the editor's TranslationRunProvider (progress, Cancel
 * and the end message live there) and closes. The provider asks for the
 * change again once that run completes. The change is a server-side atomic
 * swap, not a Command, so undo never touches it.
 */
export function DefaultLanguageDialog({
  campaign,
  languageId,
  onClose,
  onChanged
}: DefaultLanguageDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { run, start } = useTranslationRun()
  const swapDefaultLanguage = useCampaignDefaultLanguageSwap()
  const [changing, setChanging] = useState(false)
  const [missingCount, setMissingCount] = useState<number>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    setMissingCount(undefined)
    setError(undefined)
  }, [languageId])

  const target = campaign.languages.find(
    (language) => language.languageId === languageId
  )
  const current = campaign.languages.find(
    (language) => language.languageId === campaign.defaultLanguageId
  )
  const targetName = target == null ? '' : languageNames(target).autonym
  const currentName = current == null ? '' : languageNames(current).autonym
  const manualOnly = languageId != null && !isMachineTranslatable(languageId)

  async function changeDefaultLanguage(): Promise<void> {
    if (languageId == null) return
    setError(undefined)
    setChanging(true)
    try {
      await swapDefaultLanguage(campaign.id, languageId)
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
    } finally {
      setChanging(false)
    }
  }

  function handleMachineTranslate(): void {
    if (languageId == null) return
    start(
      { campaignId: campaign.id, languageId, mode: 'missing' },
      targetName,
      {
        thenSwapDefaultLanguage: true,
        onDefaultLanguageChanged: onChanged
      }
    )
    onClose()
  }

  return (
    <Dialog
      open={languageId != null}
      onClose={changing ? undefined : onClose}
      dialogTitle={{
        title: t('Change default language?'),
        closeButton: !changing
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
          <Button onClick={onClose}>{t('Cancel')}</Button>
        )
      }
      loading={changing}
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
                disabled={run != null}
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
        {error != null && (
          <Typography color="error" data-testid="CampaignDefaultLanguageError">
            {error}
          </Typography>
        )}
      </Stack>
    </Dialog>
  )
}
