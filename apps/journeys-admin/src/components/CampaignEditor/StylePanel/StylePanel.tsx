import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo, useState } from 'react'

import { campaignImageSource, resolveBand } from '@core/journeys/ui/Campaign'

import {
  CampaignBackgroundKind,
  CampaignBackgroundOverlay,
  CampaignImageSlot
} from '../../../../__generated__/globalTypes'
import {
  CampaignSectionStyleInput,
  CampaignStyledBlock,
  SECTION_OVERRIDE_FIELDS,
  SectionOverrideField,
  useCampaignSectionStyleMutation
} from '../../../libs/useCampaignSectionStyleMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { ColourRows } from '../ColourRows'
import { PaletteColorPicker } from '../PaletteColorPicker'
import { ImagePicker } from '../Pickers/ImagePicker'
import { useCampaignOwnedImageCommand } from '../utils/useCampaignOwnedImageCommand'
import { previousOf } from '../utils/useCampaignStyleCommand'

type StyleTab = 'background' | 'colours'

/** The six Section Background kinds, in the Background tab's order. */
export const BACKGROUND_KINDS = [
  CampaignBackgroundKind.none,
  CampaignBackgroundKind.surface,
  CampaignBackgroundKind.contrast,
  CampaignBackgroundKind.primary,
  CampaignBackgroundKind.custom,
  CampaignBackgroundKind.image
] as const

/** The overlay strengths over an image cover; null on the block means medium. */
export const BACKGROUND_OVERLAYS = [
  CampaignBackgroundOverlay.light,
  CampaignBackgroundOverlay.medium,
  CampaignBackgroundOverlay.heavy
] as const

interface StylePanelProps {
  block: CampaignStyledBlock
}

/**
 * A section's Style: the Background tab sets the Section Background kind
 * and, for `custom`, its colour, or for `image`, its cover (upload or
 * paste) and overlay; the Colours tab sets the five overrides. Every change
 * is one Command through the section type's update mutation — picking a
 * cover creates the owned image and writes the kind and overlay as one. The
 * custom colour and each override commit on picker blur; clearing an
 * override writes null. Only the pure hex and https rules are checked here;
 * the API's message is shown verbatim otherwise.
 */
export function StylePanel({ block }: StylePanelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addOwnedImage, addStyle, error } = useCampaignOwnedImageCommand()
  const writeStyle = useCampaignSectionStyleMutation()
  const [tab, setTab] = useState<StyleTab>('background')
  /** The author chose Image but the section has no cover yet: the picker shows, no Command until a picture is kept. */
  const [choosingCover, setChoosingCover] = useState(false)
  const band = useMemo(
    () => resolveBand(block, campaign.theme),
    [block, campaign.theme]
  )
  const coverBlock = campaign.blocks.find(
    (candidate) => candidate.id === block.coverBlockId
  )
  const cover = campaignImageSource(
    coverBlock?.__typename === 'CampaignImageBlock' ? coverBlock : null
  )

  function addSectionStyle(
    target: CampaignStyledBlock,
    input: CampaignSectionStyleInput
  ): void {
    addStyle({
      block: target,
      input,
      previous: previousOf(target, input),
      run: writeStyle
    })
  }

  const kindLabels: Record<(typeof BACKGROUND_KINDS)[number], string> = {
    none: t('None'),
    surface: t('Surface'),
    contrast: t('Contrast'),
    primary: t('Primary'),
    custom: t('Custom'),
    image: t('Image')
  }
  const overlayLabels: Record<(typeof BACKGROUND_OVERLAYS)[number], string> = {
    light: t('Light'),
    medium: t('Medium'),
    heavy: t('Heavy')
  }
  const overrideLabels: Record<SectionOverrideField, string> = {
    headingColor: t('Heading'),
    textColor: t('Text'),
    buttonColor: t('Button'),
    buttonTextColor: t('Button text'),
    accentColor: t('Accent')
  }
  const bandValues: Record<SectionOverrideField, string> = {
    headingColor: band.heading,
    textColor: band.text,
    buttonColor: band.button,
    buttonTextColor: band.buttonLabel,
    accentColor: band.accent
  }

  function handleKindChange(
    _event: unknown,
    kind: CampaignBackgroundKind | null
  ): void {
    if (kind == null) return
    if (kind !== CampaignBackgroundKind.image) setChoosingCover(false)
    if (kind === block.backgroundKind && !choosingCover) return
    if (kind === CampaignBackgroundKind.image && cover == null) {
      setChoosingCover(true)
      return
    }
    addSectionStyle(block, { backgroundKind: kind })
  }

  /** A kept picture: the cover is created and the kind and overlay written as one Command. */
  function handleCoverPick(src: string): void {
    setChoosingCover(false)
    const input = (imageId: string): CampaignSectionStyleInput => ({
      backgroundKind: CampaignBackgroundKind.image,
      coverBlockId: imageId,
      backgroundOverlay:
        block.backgroundOverlay ?? CampaignBackgroundOverlay.medium
    })
    addOwnedImage({
      owner: block,
      slot: CampaignImageSlot.cover,
      src,
      input,
      previous: previousOf(block, input('')),
      imageIdOf: (fields) => fields.coverBlockId,
      write: writeStyle
    })
  }

  function handleOverlayChange(
    _event: unknown,
    overlay: CampaignBackgroundOverlay | null
  ): void {
    if (overlay == null || overlay === (block.backgroundOverlay ?? 'medium'))
      return
    addSectionStyle(block, { backgroundOverlay: overlay })
  }

  const showingImage =
    choosingCover || block.backgroundKind === CampaignBackgroundKind.image

  return (
    <Stack
      spacing={4}
      data-testid="CampaignStylePanel"
      data-block-id={block.id}
    >
      <Tabs
        value={tab}
        onChange={(_event, next: StyleTab) => setTab(next)}
        aria-label={t('Style')}
        variant="fullWidth"
      >
        <Tab value="background" label={t('Background')} />
        <Tab value="colours" label={t('Colours')} />
      </Tabs>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      {tab === 'background' && (
        <Stack spacing={4} role="tabpanel" data-testid="StyleBackgroundTab">
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            // Six kinds in a 360px drawer: stacked, so the panel never
            // scrolls sideways.
            orientation="vertical"
            value={
              choosingCover
                ? CampaignBackgroundKind.image
                : block.backgroundKind
            }
            onChange={handleKindChange}
            aria-label={t('Background')}
          >
            {BACKGROUND_KINDS.map((kind) => (
              <ToggleButton key={kind} value={kind}>
                {kindLabels[kind]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {block.backgroundKind === CampaignBackgroundKind.custom && (
            <PaletteColorPicker
              label={t('Custom colour')}
              value={block.backgroundColor}
              fallback={campaign.theme.backgroundColor}
              onCommit={(hex) =>
                addSectionStyle(block, { backgroundColor: hex })
              }
              testId="StyleBackgroundColor"
            />
          )}
          {showingImage && (
            <Stack spacing={3} data-testid="StyleBackgroundImage">
              {cover != null && !choosingCover && (
                <>
                  <Box
                    component="img"
                    src={cover.src}
                    alt={cover.alt ?? ''}
                    data-testid="StyleBackgroundCover"
                    sx={{
                      width: '100%',
                      maxHeight: 140,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    size="small"
                    value={
                      block.backgroundOverlay ??
                      CampaignBackgroundOverlay.medium
                    }
                    onChange={handleOverlayChange}
                    aria-label={t('Overlay')}
                  >
                    {BACKGROUND_OVERLAYS.map((overlay) => (
                      <ToggleButton key={overlay} value={overlay}>
                        {overlayLabels[overlay]}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setChoosingCover(true)}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {t('Replace image')}
                  </Button>
                </>
              )}
              {(cover == null || choosingCover) && (
                <ImagePicker
                  teamId={campaign.teamId}
                  onPick={handleCoverPick}
                  pickLabel={t('Use as background')}
                  testId="StyleCoverPicker"
                />
              )}
            </Stack>
          )}
        </Stack>
      )}
      {tab === 'colours' && (
        <Stack spacing={4} role="tabpanel" data-testid="StyleColoursTab">
          <ColourRows
            label={t('Colour overrides')}
            rows={SECTION_OVERRIDE_FIELDS.map((field) => ({
              key: field,
              label: overrideLabels[field],
              value: block[field],
              inherited: bandValues[field]
            }))}
            rowTestId="StyleOverride"
            pickerTestId="StyleOverrideColor"
            onCommit={(field, hex) => addSectionStyle(block, { [field]: hex })}
            onReset={(field) => addSectionStyle(block, { [field]: null })}
          />
        </Stack>
      )}
    </Stack>
  )
}
