import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStatus
} from '../../../../../__generated__/globalTypes'
import { campaignOpenPageHref } from '../../../../libs/campaignAddress'
import { AnalyticsSettings } from '../../AnalyticsSettings'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { CarouselCardSettings } from '../../CarouselCardSettings'
import { CarouselSettings } from '../../CarouselSettings'
import { ChromeSettings } from '../../ChromeSettings'
import { HeroSettings } from '../../HeroSettings'
import { ImageSectionSettings } from '../../ImageSectionSettings'
import { JourneyCardSettings } from '../../JourneyCardSettings'
import { JourneyListSettings } from '../../JourneyListSettings'
import { LinkSettings } from '../../LinkSettings'
import { MediaSectionSettings } from '../../MediaSectionSettings'
import { RegionSettings } from '../../RegionSettings'
import { RegionSwitcherSettings } from '../../RegionSwitcherSettings'
import { SectionWordingSettings } from '../../SectionWordingSettings'
import { Settings } from '../../Settings'
import { useCampaignRegionCommand } from '../../utils/useCampaignRegionCommand'
import { ColumnControls } from '../ColumnControls'

/** What every Settings body is given; only the campaign's own settings read it. */
export interface InspectorSettingsProps {
  campaign: Campaign
  isManager: boolean
  /** The default language was swapped; the shell opens Localize on Translations. */
  onDefaultLanguageChanged?: () => void
}

type CampaignBlockTypename = CampaignBlock['__typename']
type BlockOf<Typename extends CampaignBlockTypename> = Extract<
  CampaignBlock,
  { __typename: Typename }
>
type SectionEditorTable = {
  [Typename in CampaignBlockTypename]?: (
    block: BlockOf<Typename>
  ) => ReactElement
}

/**
 * The sections with an editor of their own, by type: the header, an Image
 * section, a Video Carousel, the sections with a Media Slot (the hero also its
 * height), the Analytics section, the Region Switcher and the Journey List.
 * Every other section edits its text in place.
 */
const SECTION_EDITORS: SectionEditorTable = {
  CampaignHeaderBlock: (block) => <ChromeSettings block={block} />,
  CampaignImageBlock: (block) => <ImageSectionSettings block={block} />,
  CampaignVideoCarouselBlock: (block) => <CarouselSettings block={block} />,
  CampaignHeroBlock: (block) => (
    <Stack spacing={4}>
      <MediaSectionSettings block={block} />
      <HeroSettings block={block} />
    </Stack>
  ),
  CampaignFeaturedMediaBlock: (block) => <MediaSectionSettings block={block} />,
  CampaignAnalyticsBlock: (block) => <AnalyticsSettings block={block} />,
  CampaignRegionSwitcherBlock: (block) => (
    <RegionSwitcherSettings block={block} />
  ),
  CampaignJourneyListBlock: (block) => <JourneyListSettings block={block} />
}

function sectionEditorOf<Typename extends CampaignBlockTypename>(
  typename: Typename,
  block: BlockOf<Typename>
): ReactElement | undefined {
  return SECTION_EDITORS[typename]?.(block)
}

interface SectionEditorProps {
  block: CampaignBlock
}

function SectionEditor({ block }: SectionEditorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    sectionEditorOf(block.__typename, block) ?? (
      <Typography variant="body2" color="text.secondary">
        {t('Edit its text directly on the page.')}
      </Typography>
    )
  )
}

/** The campaign's settings, when nothing is selected. */
export function CampaignSettings({
  campaign,
  isManager,
  onDefaultLanguageChanged
}: InspectorSettingsProps): ReactElement {
  return (
    <Settings
      campaign={campaign}
      isManager={isManager}
      onDefaultLanguageChanged={onDefaultLanguageChanged}
    />
  )
}

/** A section's or chrome block's editor, then the wording it reads. */
export function SectionSettings(): ReactElement {
  const {
    selection: { block }
  } = useCampaignEditor()
  if (block == null) return <></>
  return (
    <Stack spacing={4}>
      <SectionEditor key={block.id} block={block} />
      <SectionWordingSettings block={block} />
    </Stack>
  )
}

/** A section in a Column Slot: the slot's type controls above its own settings. */
export function ColumnSettings(): ReactElement {
  const {
    selection: { block }
  } = useCampaignEditor()
  return (
    <Stack spacing={4}>
      <ColumnControls />
      {block != null && <SectionEditor key={block.id} block={block} />}
      {block != null && <SectionWordingSettings block={block} />}
    </Stack>
  )
}

/** A text Extra edits on the page. */
export function TextSettings(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Typography variant="body2" color="text.secondary">
      {t('Edit this text directly on the page.')}
    </Typography>
  )
}

/** A button Extra's link. */
export function ButtonSettings(): ReactElement {
  const {
    selection: { block }
  } = useCampaignEditor()
  if (block?.__typename !== 'CampaignButtonBlock') return <></>
  return <LinkSettings block={block} />
}

/** A carousel card's title and description. */
export function CarouselCardSettingsBody(): ReactElement {
  const {
    selection: { block }
  } = useCampaignEditor()
  if (block?.__typename !== 'CampaignVideoBlock') return <></>
  return <CarouselCardSettings key={block.id} block={block} />
}

/** A journey card's snapshot text and Refresh from journey. */
export function JourneyCardSettingsBody(): ReactElement {
  const {
    selection: { block }
  } = useCampaignEditor()
  if (block?.__typename !== 'CampaignJourneyBlock') return <></>
  return <JourneyCardSettings key={block.id} block={block} />
}

/**
 * A region card: Edit page (the editor switches to that region's page, where
 * its journeys are linked and previewed), Open page (the region's public page,
 * through the same refresh route as Publish; disabled while the campaign is a
 * draft), list / unlist, and the region's settings.
 */
export function RegionCardSettings(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    selection: { region },
    dispatch
  } = useCampaignEditor()
  const { setListed } = useCampaignRegionCommand()
  if (region == null) return <></>
  const published = campaign.status === CampaignStatus.published

  function handleEditPage(): void {
    if (region == null) return
    dispatch({
      type: 'SetPageKindAction',
      pageKind: CampaignPageKind.regionTemplate,
      regionId: region.id
    })
  }

  function handleListedToggle(): void {
    if (region == null) return
    setListed(region, !region.listed)
  }

  return (
    <Stack spacing={5}>
      <Stack spacing={1}>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Edit2Icon />}
            onClick={handleEditPage}
          >
            {t('Edit page')}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LinkExternalIcon />}
            {...(published
              ? {
                  href: campaignOpenPageHref(campaign.id, region.slug),
                  target: '_blank',
                  rel: 'noopener'
                }
              : {})}
            disabled={!published}
            aria-describedby={
              published ? undefined : 'RegionOpenPageDraftCaption'
            }
          >
            {t('Open page')}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={region.listed ? <EyeClosedIcon /> : <EyeOpenIcon />}
            onClick={handleListedToggle}
          >
            {region.listed ? t('Unlist') : t('List on switcher')}
          </Button>
        </Stack>
        {!published && (
          <Typography
            id="RegionOpenPageDraftCaption"
            variant="caption"
            color="text.secondary"
          >
            {t('The page goes live when you publish.')}
          </Typography>
        )}
      </Stack>
      <RegionSettings key={region.id} region={region} />
    </Stack>
  )
}
