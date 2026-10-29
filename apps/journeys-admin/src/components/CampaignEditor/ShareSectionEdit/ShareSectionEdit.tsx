import { CombinedGraphQLErrors } from '@apollo/client'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TFunction } from 'i18next'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useMemo, useRef } from 'react'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import {
  Language as AutocompleteLanguage,
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions_languages as CampaignRegionLanguage
} from '../../../../__generated__/GetCampaign'
import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { useCampaignRegionLanguageCreateMutation } from '../../../libs/useCampaignRegionLanguageCreateMutation'
import { useCampaignRegionLanguageDeleteMutation } from '../../../libs/useCampaignRegionLanguageDeleteMutation'
import { useCampaignRegionLanguageUpdateMutation } from '../../../libs/useCampaignRegionLanguageUpdateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaignStringText } from '../utils/campaignStringText'
import { handleStopPropagation } from '../utils/handleStopPropagation'
import { useCampaignRegionLanguageLinkCommand } from '../utils/useCampaignRegionLanguageLinkCommand'
import { useCampaignRegionLanguageSnapshotRefreshCommand } from '../utils/useCampaignRegionLanguageSnapshotRefreshCommand'

import { regionLanguageLabel, shareLanguageState } from './shareLanguage'
import { ShareLanguageRow } from './ShareLanguageRow'

interface ShareSectionEditProps {
  /** The Share section this editor sits in. */
  block: Pick<CampaignBlock, 'id'>
}

/**
 * The languages "Add language" offers: the full api-languages catalogue with
 * the region's existing Share Languages left out; the language autocomplete
 * sorts them by name as it does everywhere else.
 */
export function addLanguageOptions(
  catalogue: AutocompleteLanguage[],
  taken: ReadonlySet<string>
): AutocompleteLanguage[] {
  return catalogue.filter((language) => !taken.has(language.id))
}

function fieldMessageOf(error: unknown): string | undefined {
  if (!CombinedGraphQLErrors.is(error)) return undefined
  return error.errors[0]?.message
}

/** The Share Selector preview chip's label: the language, and why it is hidden while it is. */
function selectorPreviewLabel(
  t: TFunction,
  regionLanguage: CampaignRegionLanguage
): string {
  const language = regionLanguageLabel(regionLanguage)
  const state = shareLanguageState(regionLanguage)
  if (state === 'unlinked')
    return t('{{language}} · hidden until a journey is linked', { language })
  if (state === 'unpublished')
    return t('{{language}} · hidden while unpublished', { language })
  return language
}

/**
 * The Share section on the editor canvas: a preview of the public selector
 * (every Share Language, the unlinked ones marked hidden until a journey is
 * linked), then every language of the region being rendered as the visitor
 * will see it, and "Add language" offering the full catalogue through the
 * same language autocomplete as everywhere else. Add, remove and
 * unlink are plain saves; linking and swapping a journey are Commands
 * (a swap retargets the same short link, so undo is safe), and so is "Refresh
 * from journey", confirmed only when the author edited the snapshot.
 */
export function ShareSectionEdit({
  block
}: ShareSectionEditProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const {
    campaign,
    currentRegion,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })
  const [languageCreate] = useCampaignRegionLanguageCreateMutation()
  const [languageUpdate] = useCampaignRegionLanguageUpdateMutation()
  const [languageDelete] = useCampaignRegionLanguageDeleteMutation()
  const { link } = useCampaignRegionLanguageLinkCommand()
  const { requestRefresh, pending, confirmRefresh, cancelRefresh } =
    useCampaignRegionLanguageSnapshotRefreshCommand()
  const regionLanguages = useMemo(
    () =>
      currentRegion == null
        ? []
        : [...currentRegion.languages].sort((a, b) => a.order - b.order),
    [currentRegion]
  )
  const taken = useMemo(
    () => new Set(regionLanguages.map((language) => language.languageId)),
    [regionLanguages]
  )
  const options = useMemo(
    () => addLanguageOptions(languagesData?.languages ?? [], taken),
    [languagesData, taken]
  )

  if (currentRegion == null) return null
  const region = currentRegion

  function notify(error: unknown, fallback: string): void {
    enqueueSnackbar(
      fieldMessageOf(error) ??
        (error instanceof Error ? error.message : fallback),
      { variant: 'error', preventDuplicate: true }
    )
  }

  async function handleAdd(option?: LanguageOption): Promise<void> {
    if (option == null || taken.has(option.id)) return
    try {
      await languageCreate({
        variables: { regionId: region.id, languageId: option.id }
      })
    } catch (error) {
      notify(error, t('Could not add language'))
    }
  }

  async function handleRemove(
    regionLanguage: CampaignRegionLanguage
  ): Promise<void> {
    try {
      await languageDelete({
        variables: { id: regionLanguage.id },
        optimisticResponse: {
          campaignRegionLanguageDelete: {
            __typename: 'CampaignRegionLanguage',
            id: regionLanguage.id,
            regionId: regionLanguage.regionId
          }
        }
      })
    } catch (error) {
      notify(error, t('Could not remove language'))
    }
  }

  async function handleUnlink(
    regionLanguage: CampaignRegionLanguage
  ): Promise<void> {
    try {
      await languageUpdate({
        variables: { id: regionLanguage.id, input: { journeyId: null } }
      })
    } catch (error) {
      notify(error, t('Could not unlink journey'))
    }
  }

  /** Re-link the same journey: the API mints the missing Campaign QR Code and short link, and keeps the snapshot, an edited one included. */
  async function handleCreateQrCode(
    regionLanguage: CampaignRegionLanguage
  ): Promise<void> {
    if (regionLanguage.journeyId == null) return
    try {
      await languageUpdate({
        variables: {
          id: regionLanguage.id,
          input: { journeyId: regionLanguage.journeyId }
        }
      })
    } catch (error) {
      notify(error, t('Could not create QR code'))
    }
  }

  function handleCopied(): void {
    enqueueSnackbar(
      campaignStringText(
        campaign,
        CampaignStringKey.copied,
        previewLanguageId,
        t('Link copied')
      ),
      {
        variant: 'success',
        preventDuplicate: true
      }
    )
  }

  return (
    <Box
      ref={containerRef}
      data-testid="ShareSectionEdit"
      onClick={handleStopPropagation}
      sx={{ width: '100%', maxWidth: 720 }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          data-testid="ShareSelectorPreview"
          sx={{ flexWrap: 'wrap', alignItems: 'center' }}
        >
          {regionLanguages.map((regionLanguage) => {
            const state = shareLanguageState(regionLanguage)
            return (
              <Chip
                key={regionLanguage.id}
                size="small"
                variant={state === 'live' ? 'filled' : 'outlined'}
                data-testid={`ShareSelectorPreview-${regionLanguage.languageId}`}
                data-state={state}
                label={selectorPreviewLabel(t, regionLanguage)}
              />
            )
          })}
        </Stack>
        {regionLanguages.map((regionLanguage) => (
          <ShareLanguageRow
            key={regionLanguage.id}
            hostBlockId={block.id}
            campaign={campaign}
            region={region}
            regionLanguage={regionLanguage}
            onRemove={() => {
              void handleRemove(regionLanguage)
            }}
            onLink={(url) => link(regionLanguage, url)}
            onUnlink={() => handleUnlink(regionLanguage)}
            onRefresh={() => requestRefresh(regionLanguage)}
            onCreateQrCode={() => handleCreateQrCode(regionLanguage)}
            onCopied={handleCopied}
          />
        ))}
        <Box data-testid="ShareSectionAddLanguage">
          <LanguageAutocomplete
            languages={options}
            loading={languagesLoading}
            onChange={(option) => {
              void handleAdd(option)
            }}
            helperText={t('Add a language')}
            popper={{
              container: () => containerRef.current?.ownerDocument.body ?? null
            }}
          />
        </Box>
      </Stack>
      <Dialog
        open={pending != null}
        onClose={cancelRefresh}
        dialogTitle={{ title: t('Replace your wording?'), closeButton: true }}
        dialogAction={{
          onSubmit: confirmRefresh,
          submitLabel: t('Refresh'),
          closeLabel: t('Cancel')
        }}
        testId="ShareSnapshotRefreshDialog"
      >
        <Typography gutterBottom>
          {t(
            'The title and description here differ from the journey’s. Refreshing replaces them with what the journey says now.'
          )}
        </Typography>
        <Typography>{t('You can undo this afterwards.')}</Typography>
      </Dialog>
    </Box>
  )
}
