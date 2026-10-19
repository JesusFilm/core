import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import { isCampaignMediaOwner } from '../../../libs/useCampaignMediaSlotMutation'
import { AnalyticsSettings } from '../AnalyticsSettings'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { CarouselCardEdit } from '../CarouselCardEdit'
import { CarouselEdit } from '../CarouselEdit'
import { ChromeEdit } from '../ChromeEdit'
import { HeroSettings } from '../HeroSettings'
import { ImageSectionEdit } from '../ImageSectionEdit'
import { JourneyCardSettings } from '../JourneyCardSettings'
import { JourneyListSettings } from '../JourneyListSettings'
import { LinkSettings } from '../LinkSettings'
import { MediaSectionEdit } from '../MediaSectionEdit'
import { RegionSettings } from '../RegionSettings'
import { RegionSwitcherSettings } from '../RegionSwitcherSettings'
import { Settings } from '../Settings'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'

import { ColumnControls } from './ColumnControls'

interface InspectorSettingsProps {
  campaign: Campaign
  isManager: boolean
  /** The default language was swapped; the shell opens Localize on Translations. */
  onDefaultLanguageChanged?: () => void
}

interface SectionEditorProps {
  block: CampaignBlock
}

/** The header, an Image section, a Video Carousel, the sections with a Media Slot (the hero also its height), the Analytics section, the Region Switcher and the Journey List have an editor; every other section edits its text in place. */
function SectionEditor({ block }: SectionEditorProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  if (block.__typename === 'CampaignHeaderBlock')
    return <ChromeEdit block={block} />
  if (block.__typename === 'CampaignImageBlock')
    return <ImageSectionEdit block={block} />
  if (block.__typename === 'CampaignVideoCarouselBlock')
    return <CarouselEdit block={block} />
  if (block.__typename === 'CampaignHeroBlock')
    return (
      <Stack spacing={4}>
        <MediaSectionEdit block={block} />
        <HeroSettings block={block} />
      </Stack>
    )
  if (isCampaignMediaOwner(block)) return <MediaSectionEdit block={block} />
  if (block.__typename === 'CampaignAnalyticsBlock')
    return <AnalyticsSettings block={block} />
  if (block.__typename === 'CampaignRegionSwitcherBlock')
    return <RegionSwitcherSettings block={block} />
  if (block.__typename === 'CampaignJourneyListBlock')
    return <JourneyListSettings block={block} />
  return (
    <Typography variant="body2" color="text.secondary">
      {t('Edit its text directly on the page.')}
    </Typography>
  )
}

/**
 * The Inspector's Settings tab, switched on the selection: campaign settings
 * when nothing is selected, the editor that opened in the Edit drawer for a
 * section with the per-type toggles (analytics map, switcher variant,
 * journey-list display, media side), the link settings for a button Extra,
 * title and description for a carousel card, the snapshot text and Refresh
 * from journey for a journey card, the region's settings with list / unlist
 * and Edit page (the editor switches to that region's page, where its
 * journeys are linked and previewed) for a region card, and the type
 * controls for a column slot.
 */
export function InspectorSettings({
  campaign,
  isManager,
  onDefaultLanguageChanged
}: InspectorSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    selection,
    dispatch,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const { setListed } = useCampaignRegionCommand()
  const { block, region } = selection

  switch (selection.kind) {
    case 'campaign':
      return (
        <Settings
          campaign={campaign}
          isManager={isManager}
          onDefaultLanguageChanged={onDefaultLanguageChanged}
        />
      )
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
        <LinkSettings block={block} />
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
        <JourneyCardSettings key={block.id} block={block} />
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
              startIcon={<Edit2Icon />}
              onClick={() =>
                dispatch({
                  type: 'SetPageKindAction',
                  pageKind: CampaignPageKind.regionTemplate,
                  regionId: region.id
                })
              }
            >
              {t('Edit page')}
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
          <RegionSettings
            key={region.id}
            region={region}
            translationLanguageId={
              previewLanguageId === campaign.defaultLanguageId
                ? undefined
                : previewLanguageId
            }
          />
        </Stack>
      ) : (
        <></>
      )
  }
}
