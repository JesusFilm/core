import { CombinedGraphQLErrors } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import {
  MouseEvent,
  ReactElement,
  ReactNode,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  PREVIEW_IFRAME_ALLOW,
  PREVIEW_IFRAME_SANDBOX,
  qrCodeFileName
} from '@core/journeys/ui/Campaign'
import { QrCodeCanvas, downloadQrCodePng } from '@core/journeys/ui/QrCodeCanvas'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import CopyToIcon from '@core/shared/ui/icons/CopyTo'
import Download2Icon from '@core/shared/ui/icons/Download2'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import {
  Language as AutocompleteLanguage,
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions as CampaignRegion,
  GetCampaign_campaign_regions_languages as CampaignRegionLanguage
} from '../../../../__generated__/GetCampaign'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { useCampaignRegionLanguageCreateMutation } from '../../../libs/useCampaignRegionLanguageCreateMutation'
import { useCampaignRegionLanguageDeleteMutation } from '../../../libs/useCampaignRegionLanguageDeleteMutation'
import { useCampaignRegionLanguageUpdateMutation } from '../../../libs/useCampaignRegionLanguageUpdateMutation'
import { campaignShareLink, journeyPreviewAddress } from '../campaignAddress'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { JourneyPasteField } from '../Pickers/JourneyPasteField'
import { useSnapshotRefreshCommand } from '../utils/useSnapshotRefreshCommand'

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

/** The three states a Share Language can be in on the canvas. */
export type ShareLanguageState = 'live' | 'unpublished' | 'unlinked'

export function shareLanguageState(
  regionLanguage: Pick<CampaignRegionLanguage, 'journeyId' | 'journey'>
): ShareLanguageState {
  if (regionLanguage.journeyId == null) return 'unlinked'
  return regionLanguage.journey?.status === JourneyStatus.published
    ? 'live'
    : 'unpublished'
}

function fieldMessageOf(error: unknown): string | undefined {
  if (!CombinedGraphQLErrors.is(error)) return undefined
  return error.errors[0]?.message
}

function stop(event: MouseEvent<HTMLElement>): void {
  event.stopPropagation()
}

interface PhoneFrameProps {
  children: ReactNode
}

/** The phone-shaped frame the public page previews a journey in; on the canvas it also holds the empty states. */
function PhoneFrame({ children }: PhoneFrameProps): ReactElement {
  return (
    <Box
      data-testid="ShareLanguagePhone"
      sx={{
        width: 220,
        flexShrink: 0,
        aspectRatio: '9 / 18',
        borderRadius: 6,
        border: '8px solid var(--campaign-band-heading)',
        backgroundColor: 'var(--campaign-band-card)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {children}
    </Box>
  )
}

interface ShareLanguageRowProps {
  campaign: Campaign
  region: CampaignRegion
  regionLanguage: CampaignRegionLanguage
  onRemove: () => void
  onLink: (url: string) => Promise<void>
  onUnlink: () => Promise<void>
  onRefresh: () => void
  onCopied: (shortLink: string) => void
}

/**
 * One Share Language on the canvas, as the visitor will see it: the phone
 * frame, the Share Link, Copy link and Download QR code. A live-published
 * journey previews in the frame with Refresh from journey, Swap and Unlink
 * beside it. An Unlinked Language shows the frame with the "Pick a journey"
 * call to action that opens the paste field, copy and download disabled. A
 * journey that is no longer published shows the "Journey unpublished"
 * warning in the frame instead of that call to action.
 */
function ShareLanguageRow({
  campaign,
  region,
  regionLanguage,
  onRemove,
  onLink,
  onUnlink,
  onRefresh,
  onCopied
}: ShareLanguageRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [pasting, setPasting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = shareLanguageState(regionLanguage)
  const shortLink =
    state === 'live' ? campaignShareLink(regionLanguage.qrCode) : undefined
  const slug = regionLanguage.journey?.slug

  async function handleCopy(): Promise<void> {
    if (shortLink == null) return
    await navigator.clipboard.writeText(shortLink)
    onCopied(shortLink)
  }

  function handleDownload(): void {
    const canvas = canvasRef.current
    if (canvas == null) return
    downloadQrCodePng(canvas, qrCodeFileName(campaign, region, regionLanguage))
  }

  return (
    <Stack
      spacing={2}
      data-testid={`ShareLanguageRow-${regionLanguage.languageId}`}
      data-state={state}
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
        {state === 'unlinked' && (
          <Chip
            size="small"
            label={t('Hidden until a journey is linked')}
            data-testid="ShareLanguageHidden"
          />
        )}
        {state === 'unpublished' && (
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
            stop(event)
            onRemove()
          }}
        >
          <Trash2Icon fontSize="small" />
        </IconButton>
      </Stack>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
      >
        <PhoneFrame>
          {state === 'live' && slug != null && (
            <Box
              component="iframe"
              data-testid="ShareLanguagePhoneIframe"
              src={journeyPreviewAddress(slug)}
              title={regionLanguage.title ?? slug}
              sandbox={PREVIEW_IFRAME_SANDBOX}
              allow={PREVIEW_IFRAME_ALLOW}
              loading="lazy"
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                border: 0,
                backgroundColor: '#000000'
              }}
            />
          )}
          {state === 'unlinked' && (
            <Button
              variant="contained"
              size="small"
              data-testid="ShareLanguagePick"
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                stop(event)
                setPasting(true)
              }}
            >
              {t('Pick a journey')}
            </Button>
          )}
          {state === 'unpublished' && (
            <Typography
              variant="body2"
              align="center"
              data-testid="ShareLanguageUnpublishedWarning"
              sx={{ p: 2, color: 'warning.main' }}
            >
              {t(
                'Journey unpublished. Visitors cannot see this language until it is published again or another journey is linked.'
              )}
            </Typography>
          )}
        </PhoneFrame>
        <Stack spacing={2} sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
          {state !== 'unlinked' && (
            <Typography
              variant="body2"
              data-testid="ShareLanguageJourney"
              sx={{ color: 'var(--campaign-band-text)' }}
              noWrap
            >
              {regionLanguage.title ?? regionLanguage.journeyId}
              {slug != null && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, color: 'var(--campaign-band-muted)' }}
                >
                  /{slug}
                </Typography>
              )}
            </Typography>
          )}
          {shortLink != null && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography
                variant="body2"
                data-testid="ShareLanguageShortLink"
                noWrap
                sx={{ color: 'var(--campaign-band-text)' }}
              >
                {shortLink.replace(/^https?:\/\//, '')}
              </Typography>
              <Tooltip title={t('Open')}>
                <IconButton
                  component="a"
                  href={shortLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('Open')}
                  size="small"
                  onClick={stop}
                >
                  <LinkExternalIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <QrCodeCanvas value={shortLink} size={72} canvasRef={canvasRef} />
            <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<CopyToIcon />}
                disabled={shortLink == null}
                data-testid="ShareLanguageCopy"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  stop(event)
                  void handleCopy()
                }}
              >
                {t('Copy link')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Download2Icon />}
                disabled={shortLink == null}
                data-testid="ShareLanguageDownload"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  stop(event)
                  handleDownload()
                }}
              >
                {t('Download QR code')}
              </Button>
            </Stack>
          </Stack>
          {state !== 'unlinked' && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              {state === 'live' && (
                <Button
                  size="small"
                  color="inherit"
                  data-testid="ShareLanguageRefresh"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    stop(event)
                    onRefresh()
                  }}
                >
                  {t('Refresh from journey')}
                </Button>
              )}
              <Button
                size="small"
                color="inherit"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  stop(event)
                  setPasting((previous) => !previous)
                }}
              >
                {t('Swap journey')}
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  stop(event)
                  void onUnlink()
                }}
              >
                {t('Unlink')}
              </Button>
            </Stack>
          )}
          {pasting && (
            <JourneyPasteField
              label={
                state === 'unlinked' ? t('Journey link') : t('New journey link')
              }
              autoFocus
              onLink={async (url) => {
                await onLink(url)
                setPasting(false)
              }}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}

/**
 * The Share section on the editor canvas: a preview of the public selector
 * (every Share Language, the unlinked ones marked hidden until a journey is
 * linked), then every language of the region being rendered as the visitor
 * will see it, and "Add language" offering the Page Languages first, then
 * the full catalogue through the language autocomplete. Add, remove, link,
 * swap and unlink are not Commands (linking creates the Campaign QR Code on
 * the server and undo does not touch it); "Refresh from journey" is one,
 * confirmed only when the author edited the snapshot.
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
  const { requestRefresh, pending, confirmRefresh, cancelRefresh } =
    useSnapshotRefreshCommand()
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

  function handleCopied(): void {
    enqueueSnackbar(t('Link copied'), {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <Box
      ref={containerRef}
      data-testid="ShareSectionEdit"
      onClick={stop}
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
                label={
                  state === 'unlinked'
                    ? t('{{language}} · hidden until a journey is linked', {
                        language: regionLanguageLabel(regionLanguage)
                      })
                    : state === 'unpublished'
                      ? t('{{language}} · hidden while unpublished', {
                          language: regionLanguageLabel(regionLanguage)
                        })
                      : regionLanguageLabel(regionLanguage)
                }
              />
            )
          })}
        </Stack>
        {regionLanguages.map((regionLanguage) => (
          <ShareLanguageRow
            key={regionLanguage.id}
            campaign={campaign}
            region={region}
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
            onRefresh={() => requestRefresh(regionLanguage)}
            onCopied={handleCopied}
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
