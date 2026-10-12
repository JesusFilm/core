import { CombinedGraphQLErrors } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { MouseEvent, ReactElement, useMemo, useRef, useState } from 'react'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import {
  Language as AutocompleteLanguage,
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions_languages as CampaignRegionLanguage
} from '../../../../__generated__/GetCampaign'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { useCampaignRegionLanguageCreateMutation } from '../../../libs/useCampaignRegionLanguageCreateMutation'
import { useCampaignRegionLanguageDeleteMutation } from '../../../libs/useCampaignRegionLanguageDeleteMutation'
import { useCampaignRegionLanguageUpdateMutation } from '../../../libs/useCampaignRegionLanguageUpdateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { JourneyPasteField } from '../Pickers/JourneyPasteField'

interface ShareSectionEditProps {
  /** The Share section this editor sits in. */
  block: Pick<CampaignBlock, 'id'>
}

/** The editor label of a Share Language: autonym plus local name when they differ. */
export function regionLanguageLabel(
  regionLanguage: Pick<CampaignRegionLanguage, 'languageId' | 'language'>
): string {
  const names = regionLanguage.language.name
  const autonym = names.find((name) => name.primary)?.value
  const local = names.find((name) => !name.primary)?.value
  if (autonym == null) return local ?? regionLanguage.languageId
  return local != null && local !== autonym ? `${autonym} (${local})` : autonym
}

/**
 * The languages "Add language" offers: the campaign's Page Languages first,
 * in their order, then the full api-languages catalogue, with the region's
 * existing Share Languages left out.
 */
export function addLanguageOptions(
  campaign: Pick<Campaign, 'languages'>,
  catalogue: AutocompleteLanguage[],
  taken: ReadonlySet<string>
): AutocompleteLanguage[] {
  const pageLanguages: AutocompleteLanguage[] = [...campaign.languages]
    .sort((a, b) => a.order - b.order)
    .map((campaignLanguage) => ({
      id: campaignLanguage.languageId,
      name: campaignLanguage.language.name,
      slug: null
    }))
  const pageIds = new Set(pageLanguages.map((language) => language.id))
  return [
    ...pageLanguages,
    ...catalogue.filter((language) => !pageIds.has(language.id))
  ].filter((language) => !taken.has(language.id))
}

function fieldMessageOf(error: unknown): string | undefined {
  if (!CombinedGraphQLErrors.is(error)) return undefined
  return error.errors[0]?.message
}

interface ShareLanguageRowProps {
  regionLanguage: CampaignRegionLanguage
  onRemove: () => void
  onLink: (url: string) => Promise<void>
  onUnlink: () => Promise<void>
}

/**
 * One Share Language: its label, then the linked journey's snapshot title
 * with a warning when that journey is no longer published, or the paste
 * field for an Unlinked Language. Unlinked and unpublished languages are
 * marked as hidden from visitors.
 */
function ShareLanguageRow({
  regionLanguage,
  onRemove,
  onLink,
  onUnlink
}: ShareLanguageRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [pasting, setPasting] = useState(false)
  const linked = regionLanguage.journeyId != null
  const live = regionLanguage.journey?.status === JourneyStatus.published

  return (
    <Stack
      spacing={1.5}
      data-testid={`ShareLanguageRow-${regionLanguage.languageId}`}
      sx={{
        p: 2,
        borderRadius: 1,
        backgroundColor: 'var(--campaign-band-card)',
        border: '1px solid var(--campaign-band-border)'
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography
          variant="subtitle1"
          component="span"
          data-testid="ShareLanguageLabel"
          sx={{ flexGrow: 1, color: 'var(--campaign-band-heading)' }}
        >
          {regionLanguageLabel(regionLanguage)}
        </Typography>
        {!linked && (
          <Chip
            size="small"
            label={t('Hidden until a journey is linked')}
            data-testid="ShareLanguageHidden"
          />
        )}
        {linked && !live && (
          <Chip
            size="small"
            color="warning"
            label={t('Journey unpublished')}
            data-testid="ShareLanguageUnpublished"
          />
        )}
        <IconButton
          size="small"
          aria-label={t('Remove language')}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <Trash2Icon fontSize="small" />
        </IconButton>
      </Stack>
      {linked && (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography
            variant="body2"
            data-testid="ShareLanguageJourney"
            sx={{ flexGrow: 1, color: 'var(--campaign-band-text)' }}
            noWrap
          >
            {regionLanguage.title ?? regionLanguage.journeyId}
            {regionLanguage.journey?.slug != null && (
              <Typography
                component="span"
                variant="caption"
                sx={{ ml: 1, color: 'var(--campaign-band-muted)' }}
              >
                /{regionLanguage.journey.slug}
              </Typography>
            )}
          </Typography>
          <Button
            size="small"
            color="inherit"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation()
              setPasting((previous) => !previous)
            }}
          >
            {t('Swap journey')}
          </Button>
          <Button
            size="small"
            color="inherit"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation()
              void onUnlink()
            }}
          >
            {t('Unlink')}
          </Button>
        </Stack>
      )}
      {(!linked || pasting) && (
        <JourneyPasteField
          label={linked ? t('New journey link') : t('Pick a journey')}
          onLink={async (url) => {
            await onLink(url)
            setPasting(false)
          }}
        />
      )}
    </Stack>
  )
}

/**
 * The Share section on the editor canvas: every Share Language of the
 * region being rendered, linked or not, each with its journey paste field,
 * and "Add language" offering the Page Languages first, then the full
 * catalogue through the language autocomplete. Never Commands: linking
 * creates the Campaign QR Code on the server and undo does not touch it.
 */
export function ShareSectionEdit({
  block
}: ShareSectionEditProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { campaign, currentRegion } = useCampaignEditor()
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })
  const [languageCreate] = useCampaignRegionLanguageCreateMutation()
  const [languageUpdate] = useCampaignRegionLanguageUpdateMutation()
  const [languageDelete] = useCampaignRegionLanguageDeleteMutation()
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
    () => addLanguageOptions(campaign, languagesData?.languages ?? [], taken),
    [campaign, languagesData, taken]
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

  return (
    <Box
      ref={containerRef}
      data-testid="ShareSectionEdit"
      onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      sx={{ width: '100%', maxWidth: 720 }}
    >
      <Stack spacing={2}>
        {regionLanguages.map((regionLanguage) => (
          <ShareLanguageRow
            key={regionLanguage.id}
            regionLanguage={regionLanguage}
            onRemove={() => {
              void handleRemove(regionLanguage)
            }}
            onLink={async (url) => {
              await languageUpdate({
                variables: { id: regionLanguage.id, input: { url } }
              })
            }}
            onUnlink={() => handleUnlink(regionLanguage)}
          />
        ))}
        <Box data-testid="ShareSectionAddLanguage">
          <LanguageAutocomplete
            languages={options}
            loading={languagesLoading}
            disableSort
            onChange={(option) => {
              void handleAdd(option)
            }}
            helperText={t(
              'Add language: your page languages come first, then every language.'
            )}
            popper={{
              container: () => containerRef.current?.ownerDocument.body ?? null
            }}
          />
        </Box>
      </Stack>
    </Box>
  )
}
