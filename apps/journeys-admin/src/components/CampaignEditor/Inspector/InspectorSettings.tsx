import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import ArrowLeftIcon from '@core/shared/ui/icons/ArrowLeft'
import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'
import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'
import TranslateIcon from '@core/shared/ui/icons/Translate'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import { isCampaignMediaOwner } from '../../../libs/useCampaignMediaSlotMutation'
import { campaignPermanentAddress } from '../campaignAddress'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { CarouselCardEdit } from '../CarouselCardEdit'
import { CarouselEdit } from '../CarouselEdit'
import { ChromeEdit } from '../ChromeEdit'
import { ImageSectionEdit } from '../ImageSectionEdit'
import { LanguagesPanel } from '../LanguagesPanel'
import { LinkChip } from '../LinkChip'
import { MediaSectionEdit } from '../MediaSectionEdit'
import { RegionSettings } from '../RegionSettings'
import { Settings } from '../Settings'
import { TranslationsView } from '../TranslationsView'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'
import { useJourneyCardSnapshotRefreshCommand } from '../utils/useJourneyCardSnapshotRefreshCommand'

import { ColumnControls } from './ColumnControls'

/**
 * What the nothing-selected Settings tab shows in place of the campaign
 * settings, until the Localize panel lands: the Languages panel, or the
 * Translations view with or without the default-language promotion notice.
 */
export type InspectorInlineView =
  | { view: 'languages' }
  | { view: 'translations'; promotionNotice: boolean }

interface InspectorSettingsProps {
  campaign: Campaign
  isManager: boolean
  inline?: InspectorInlineView
  onInlineChange?: (inline?: InspectorInlineView) => void
}

interface SectionEditorProps {
  block: CampaignBlock
}

/** The header, an Image section, a Video Carousel and the sections with a Media Slot have an editor; every other section edits its text in place. */
function SectionEditor({ block }: SectionEditorProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  if (block.__typename === 'CampaignHeaderBlock')
    return <ChromeEdit block={block} />
  if (block.__typename === 'CampaignImageBlock')
    return <ImageSectionEdit block={block} />
  if (block.__typename === 'CampaignVideoCarouselBlock')
    return <CarouselEdit block={block} />
  if (isCampaignMediaOwner(block)) return <MediaSectionEdit block={block} />
  return (
    <Typography variant="body2" color="text.secondary">
      {t('Edit its text directly on the page.')}
    </Typography>
  )
}

/**
 * The Inspector's Settings tab, switched on the selection: campaign settings
 * when nothing is selected, the editor that opened in the Edit drawer for a
 * section, the link chip for a button Extra, title and description for a
 * carousel card, Refresh from journey for a journey card, the region's
 * settings with list / unlist and Open page for a region card, and the type
 * controls for a column slot.
 */
export function InspectorSettings({
  campaign,
  isManager,
  inline,
  onInlineChange
}: InspectorSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    selection,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const { setListed } = useCampaignRegionCommand()
  const { refreshSnapshot, confirmDialog } =
    useJourneyCardSnapshotRefreshCommand()
  const { block, region } = selection

  switch (selection.kind) {
    case 'campaign': {
      if (inline != null)
        return (
          <Stack spacing={3} data-testid="InspectorInlineView">
            <Button
              size="small"
              color="secondary"
              startIcon={<ArrowLeftIcon />}
              onClick={() => onInlineChange?.(undefined)}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('Back to settings')}
            </Button>
            {inline.view === 'languages' ? (
              <LanguagesPanel campaign={campaign} />
            ) : (
              <TranslationsView
                campaign={campaign}
                initialLanguageId={previewLanguageId}
                showPromotionNotice={inline.promotionNotice}
                onPromotionNoticeClose={() =>
                  onInlineChange?.({
                    view: 'translations',
                    promotionNotice: false
                  })
                }
              />
            )}
          </Stack>
        )
      return (
        <Stack spacing={5}>
          <Settings
            campaign={campaign}
            isManager={isManager}
            onDefaultLanguageChanged={() =>
              onInlineChange?.({ view: 'translations', promotionNotice: true })
            }
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Globe1Icon />}
              onClick={() => onInlineChange?.({ view: 'languages' })}
            >
              {t('Languages')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<TranslateIcon />}
              onClick={() =>
                onInlineChange?.({
                  view: 'translations',
                  promotionNotice: false
                })
              }
            >
              {t('Translations')}
            </Button>
          </Stack>
        </Stack>
      )
    }
    case 'section':
    case 'chrome':
      return block != null ? (
        <SectionEditor key={block.id} block={block} />
      ) : (
        <></>
      )
    case 'column':
      return (
        <Stack spacing={4}>
          <ColumnControls />
          {block != null && <SectionEditor key={block.id} block={block} />}
        </Stack>
      )
    case 'slot':
      return <ColumnControls />
    case 'text':
      return (
        <Typography variant="body2" color="text.secondary">
          {t('Edit this text directly on the page.')}
        </Typography>
      )
    case 'button':
      return block?.__typename === 'CampaignButtonBlock' ? (
        <Stack spacing={2}>
          <Typography variant="subtitle2">{t('Link')}</Typography>
          <LinkChip block={block} />
        </Stack>
      ) : (
        <></>
      )
    case 'card':
      return block?.__typename === 'CampaignVideoBlock' ? (
        <CarouselCardEdit key={block.id} block={block} />
      ) : (
        <></>
      )
    case 'journey':
      return block?.__typename === 'CampaignJourneyBlock' ? (
        <Stack spacing={2}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowRefresh6Icon />}
            onClick={() => {
              void refreshSnapshot(block)
            }}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('Refresh from journey')}
          </Button>
          {confirmDialog}
        </Stack>
      ) : (
        <></>
      )
    case 'region':
      return region != null ? (
        <Stack spacing={5}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LinkExternalIcon />}
              href={`${campaignPermanentAddress(campaign.slug)}/${region.slug}`}
              target="_blank"
              rel="noopener"
            >
              {t('Open page')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={region.listed ? <EyeClosedIcon /> : <EyeOpenIcon />}
              onClick={() => setListed(region, !region.listed)}
            >
              {region.listed ? t('Unlist') : t('List on switcher')}
            </Button>
          </Stack>
          <RegionSettings key={region.id} region={region} />
        </Stack>
      ) : (
        <></>
      )
  }
}
