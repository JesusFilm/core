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
import QrCode2Icon from '@core/shared/ui/icons/QrCode2'
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
import {
  CampaignStringKey,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { translationValue } from '../../../libs/useCampaignBlockTextMutation'
import { useCampaignRegionLanguageCreateMutation } from '../../../libs/useCampaignRegionLanguageCreateMutation'
import { useCampaignRegionLanguageDeleteMutation } from '../../../libs/useCampaignRegionLanguageDeleteMutation'
import { useCampaignRegionLanguageUpdateMutation } from '../../../libs/useCampaignRegionLanguageUpdateMutation'
import { shareLanguageLabel } from '../blockLabel'
import { campaignShareLink, journeyPreviewAddress } from '../campaignAddress'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { HOVER_OUTLINE_SX } from '../Canvas/hoverOutline'
import { SelectionBadge } from '../Canvas/SelectionBadge'
import { JourneyPasteField } from '../Pickers/JourneyPasteField'
import { JourneyPicker } from '../Pickers/JourneyPicker'
import { useShareLanguageLinkCommand } from '../utils/useShareLanguageLinkCommand'
import { useSnapshotRefreshCommand } from '../utils/useSnapshotRefreshCommand'

interface ShareSectionEditProps {
  /** The Share section this editor sits in. */
  block: Pick<CampaignBlock, 'id'>
}

/**
 * A Campaign String as the visitor reads it in the previewed language: its
 * translation there, else its default-language wording, else `fallback`
 * (what the public page shows for a row the campaign lacks or left blank).
 */
export function campaignStringText(
  campaign: Pick<Campaign, 'strings' | 'defaultLanguageId'>,
  key: CampaignStringKey,
  previewLanguageId: string,
  fallback: string
): string {
  const string = campaign.strings.find((candidate) => candidate.key === key)
  if (string == null) return fallback
  const translated =
    previewLanguageId === campaign.defaultLanguageId
      ? ''
      : translationValue(string.valueTranslations, previewLanguageId)
  if (translated.trim() !== '') return translated
  return string.value.trim() === '' ? fallback : string.value
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

/** The public phone's screen width (300px frame less the bezel); the canvas iframe renders at this width and scales. */
const PUBLIC_SCREEN_WIDTH = 284
const PUBLIC_SCREEN_HEIGHT = 584
/** The canvas phone's screen (220px frame less the 6px bezel), at the public screen's aspect. */
const CANVAS_SCREEN_WIDTH = 208
const CANVAS_SCREEN_HEIGHT = Math.round(
  (PUBLIC_SCREEN_HEIGHT * CANVAS_SCREEN_WIDTH) / PUBLIC_SCREEN_WIDTH
)
const CANVAS_BEZEL = 6

/** The phone-shaped frame the public page previews a journey in; on the canvas it also holds the empty states. */
function PhoneFrame({ children }: PhoneFrameProps): ReactElement {
  return (
    <Box
      data-testid="ShareLanguagePhone"
      sx={{
        position: 'relative',
        // Fixed sizes rather than an aspect ratio: in a column layout the
        // scaled iframe's unscaled box would otherwise stretch the frame.
        width: CANVAS_SCREEN_WIDTH + CANVAS_BEZEL * 2,
        height: CANVAS_SCREEN_HEIGHT + CANVAS_BEZEL * 2,
        flexShrink: 0,
        // The journey embed rounds itself at 16px; scaled to the canvas that
        // is 12px, so the screen clips there and the bezel adds its 6px.
        p: `${CANVAS_BEZEL}px`,
        borderRadius: '18px',
        backgroundColor: 'var(--campaign-band-heading)'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: CANVAS_SCREEN_WIDTH,
          height: CANVAS_SCREEN_HEIGHT,
          borderRadius: '12px',
          overflow: 'hidden',
          clipPath: 'inset(0 round 12px)',
          backgroundColor: 'var(--campaign-band-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </Box>
      <Box
        aria-hidden
        data-testid="ShareLanguagePhoneBezel"
        sx={{
          // A composited iframe escapes the screen's rounded clip on some
          // displays, so the bezel is also painted over the screen's corners
          // from above. This must sit outside the clipping box: a spread
          // shadow inside it would be clipped away with the corners.
          position: 'absolute',
          inset: `${CANVAS_BEZEL}px`,
          borderRadius: '12px',
          boxShadow: `0 0 0 ${CANVAS_BEZEL}px var(--campaign-band-heading)`,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    </Box>
  )
}

interface ShareLanguageRowProps {
  /** The Share section the row sits in; clicking the row selects it. */
  hostBlockId: string
  campaign: Campaign
  region: CampaignRegion
  regionLanguage: CampaignRegionLanguage
  onRemove: () => void
  onLink: (url: string) => Promise<void>
  onUnlink: () => Promise<void>
  onRefresh: () => void
  /** Mint the Campaign QR Code and short link for the linked journey when the row has none. */
  onCreateQrCode: () => Promise<void>
  onCopied: (shortLink: string) => void
}

/**
 * One Share Language on the canvas, as the visitor will see it: the phone
 * frame, the Share Link, Copy link and Download QR code. A live-published
 * journey previews in the frame with Open journey (the public page in a new
 * tab), Refresh from journey, Swap and Unlink beside it, and Create QR code
 * when the row has no Campaign QR Code yet. An Unlinked Language shows the frame with the "Pick a journey"
 * call to action that opens the journey picker, copy and download disabled. A
 * journey that is no longer published shows the "Journey unpublished"
 * warning in the frame instead of that call to action.
 */
function ShareLanguageRow({
  hostBlockId,
  campaign,
  region,
  regionLanguage,
  onRemove,
  onLink,
  onUnlink,
  onRefresh,
  onCreateQrCode,
  onCopied
}: ShareLanguageRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { previewLanguageId },
    selectBlock
  } = useCampaignEditor()
  const rowId = `${hostBlockId}__${regionLanguage.languageId}`
  const [pasting, setPasting] = useState(false)
  const state = shareLanguageState(regionLanguage)
  const shortLink =
    state === 'live' ? campaignShareLink(regionLanguage.qrCode) : undefined
  const slug = regionLanguage.journey?.slug
  const openLabel = campaignStringText(
    campaign,
    CampaignStringKey.open,
    previewLanguageId,
    t('Open')
  )
  const copyLabel = campaignStringText(
    campaign,
    CampaignStringKey.copy,
    previewLanguageId,
    t('Copy link')
  )
  const downloadLabel = campaignStringText(
    campaign,
    CampaignStringKey.downloadQr,
    previewLanguageId,
    t('Download QR code')
  )

  async function handleLink(url: string): Promise<void> {
    await onLink(url)
    setPasting(false)
  }

  async function handleCopy(): Promise<void> {
    if (shortLink == null) return
    await navigator.clipboard.writeText(shortLink)
    onCopied(shortLink)
  }

  function handleDownload(): void {
    if (shortLink == null) return
    downloadQrCodePng(
      shortLink,
      qrCodeFileName(campaign, region, regionLanguage)
    )
  }

  // A row holding a QR code is never deleted from the editor: the API
  // refuses it, so the bin is disabled and points at Unlink instead.
  const removeButton = (
    <IconButton
      size="small"
      aria-label={t('Remove language')}
      disabled={regionLanguage.qrCode != null}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        stop(event)
        onRemove()
      }}
    >
      <Trash2Icon fontSize="small" />
    </IconButton>
  )

  return (
    <Stack
      spacing={2}
      id={rowId}
      data-testid={`ShareLanguageRow-${regionLanguage.languageId}`}
      data-state={state}
      data-hoverable
      onClick={(event: MouseEvent<HTMLElement>) => {
        stop(event)
        selectBlock(hostBlockId)
      }}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        p: 2,
        borderRadius: 1,
        backgroundColor: 'var(--campaign-band-card)',
        border: '1px solid var(--campaign-band-border)',
        ...HOVER_OUTLINE_SX
      }}
    >
      <SelectionBadge
        id={rowId}
        label={shareLanguageLabel(t)}
        selected={false}
      />
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
        {regionLanguage.qrCode != null ? (
          <Tooltip title={t('This language has a QR code. Unlink it instead.')}>
            <span>{removeButton}</span>
          </Tooltip>
        ) : (
          removeButton
        )}
      </Stack>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
      >
        <PhoneFrame>
          {state === 'live' && slug != null && (
            // Fills the screen so the scaled iframe starts at its top-left
            // corner rather than being centred by its larger layout box.
            <Box
              sx={{
                position: 'relative',
                width: CANVAS_SCREEN_WIDTH,
                height: CANVAS_SCREEN_HEIGHT,
                overflow: 'hidden'
              }}
            >
              <Box
                component="iframe"
                data-testid="ShareLanguagePhoneIframe"
                src={journeyPreviewAddress(slug)}
                title={regionLanguage.title ?? slug}
                sandbox={PREVIEW_IFRAME_SANDBOX}
                allow={PREVIEW_IFRAME_ALLOW}
                loading="lazy"
                sx={{
                  // Rendered at the public phone's screen width and scaled
                  // down, so the journey lays out as it does on the public
                  // page (filling the screen) rather than in a narrower
                  // layout with its own square-cornered card.
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  display: 'block',
                  width: PUBLIC_SCREEN_WIDTH,
                  height: PUBLIC_SCREEN_HEIGHT,
                  transform: `scale(${CANVAS_SCREEN_WIDTH / PUBLIC_SCREEN_WIDTH})`,
                  transformOrigin: 'top left',
                  border: 0,
                  backgroundColor: '#000000'
                }}
              />
            </Box>
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
              <Tooltip title={openLabel}>
                <IconButton
                  component="a"
                  href={shortLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={openLabel}
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
            <QrCodeCanvas value={shortLink} size={72} cornerRadius="6px" />
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
                {copyLabel}
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
                {downloadLabel}
              </Button>
            </Stack>
          </Stack>
          {state !== 'unlinked' && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              {regionLanguage.journeyUrl != null && (
                <Button
                  size="small"
                  color="inherit"
                  component="a"
                  href={regionLanguage.journeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LinkExternalIcon fontSize="small" />}
                  data-testid="ShareLanguageOpenJourney"
                  onClick={stop}
                >
                  {t('Open journey')}
                </Button>
              )}
              {regionLanguage.journeyId != null &&
                regionLanguage.qrCode == null && (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<QrCode2Icon fontSize="small" />}
                    data-testid="ShareLanguageCreateQrCode"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      stop(event)
                      void onCreateQrCode()
                    }}
                  >
                    {t('Create QR code')}
                  </Button>
                )}
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
            <Stack spacing={1.5}>
              <JourneyPicker
                label={
                  state === 'unlinked'
                    ? t('Search your journeys')
                    : t('Search for a new journey')
                }
                statuses={[JourneyStatus.published]}
                autoFocus
                onLink={handleLink}
              />
              <JourneyPasteField
                label={t('or paste a link')}
                compact
                onLink={handleLink}
              />
            </Stack>
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
  const { link } = useShareLanguageLinkCommand()
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

  /** Re-link the same journey: the API mints the missing Campaign QR Code and short link, and leaves an existing one alone. */
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
