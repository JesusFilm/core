import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement } from 'react'
import { screen, userEvent } from 'storybook/test'

import {
  featuredMediaImageBlock,
  featuredMediaSectionBlock
} from '@core/journeys/ui/Campaign/testData'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import { CampaignFeaturedMediaLayout } from '../../../../__generated__/globalTypes'
import {
  CampaignEditorProvider,
  CampaignEditorState
} from '../CampaignEditorProvider'
import { campaign, campaignWithColumns, campaignWithRegions } from '../data'
import { TranslationRunContext } from '../TranslationRunProvider'

import { Inspector } from '.'

interface InspectorStoryProps {
  initialState?: Partial<CampaignEditorState>
  campaignProp?: Campaign
  isManager?: boolean
}

/** The Inspector over a campaign fixture, in its 328 px column. */
function InspectorStory({
  initialState,
  campaignProp = campaign,
  isManager = true
}: InspectorStoryProps): ReactElement {
  return (
    <MockedProvider>
      <CommandProvider>
        <CampaignEditorProvider
          campaign={campaignProp}
          initialState={initialState}
        >
          <TranslationRunContext.Provider
            value={{ start: () => undefined, cancel: () => undefined }}
          >
            <Box sx={{ display: 'flex', height: 720 }}>
              <Inspector isManager={isManager} />
            </Box>
          </TranslationRunContext.Provider>
        </CampaignEditorProvider>
      </CommandProvider>
    </MockedProvider>
  )
}

const InspectorMeta: Meta<typeof InspectorStory> = {
  ...journeysAdminConfig,
  component: InspectorStory,
  title: 'Journeys-Admin/CampaignEditor/Inspector',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof InspectorStory>

/** The campaign with `patch` applied over the block `blockId`. */
function withBlockPatch(
  source: Campaign,
  blockId: string,
  patch: Record<string, unknown>
): Campaign {
  return {
    ...source,
    blocks: source.blocks.map((block) =>
      block.id === blockId ? { ...block, ...patch } : block
    )
  }
}

async function openColoursTab(): Promise<void> {
  await userEvent.click(await screen.findByRole('tab', { name: 'Colours' }))
}

/** Nothing selected, Style: the campaign Theme. */
export const NothingSelectedStyle: Story = {
  args: { initialState: { inspectorTab: 'style' } }
}

/** Nothing selected, Settings: title, slug, default language, status and Delete campaign. */
export const NothingSelectedSettings: Story = {
  args: { initialState: { inspectorTab: 'settings' } }
}

/** A hero section, Style: Background and Colours. */
export const SectionStyle: Story = {
  args: { initialState: { selectedBlockId: 'heroId', inspectorTab: 'style' } }
}

/** A hero section, Settings: the media slot. */
export const SectionSettings: Story = {
  args: {
    initialState: { selectedBlockId: 'heroId', inspectorTab: 'settings' }
  }
}

/** A Featured Media section, Settings: the media slot, the side by side layout and which side the media sits on. */
export const FeaturedMediaSettings: Story = {
  args: {
    campaignProp: {
      ...campaign,
      blocks: [
        ...campaign.blocks,
        featuredMediaSectionBlock as CampaignBlock,
        featuredMediaImageBlock as CampaignBlock
      ]
    },
    initialState: {
      selectedBlockId: 'featuredMediaId',
      inspectorTab: 'settings'
    }
  }
}

/** A stacked Featured Media section, Settings: the layout is Stacked and the media side is disabled. */
export const FeaturedMediaStackedSettings: Story = {
  args: {
    campaignProp: {
      ...campaign,
      blocks: [
        ...campaign.blocks,
        {
          ...featuredMediaSectionBlock,
          layout: CampaignFeaturedMediaLayout.stacked
        } as CampaignBlock,
        featuredMediaImageBlock as CampaignBlock
      ]
    },
    initialState: {
      selectedBlockId: 'featuredMediaId',
      inspectorTab: 'settings'
    }
  }
}

/** An Analytics section, Settings: the map toggle. */
export const AnalyticsSettings: Story = {
  args: {
    initialState: {
      selectedBlockId: 'landingAnalyticsId',
      inspectorTab: 'settings'
    }
  }
}

/** A Region Switcher, Settings: the variant. */
export const RegionSwitcherSettings: Story = {
  args: {
    initialState: {
      selectedBlockId: 'landingSwitcherId',
      inspectorTab: 'settings'
    }
  }
}

/** A Journey List, Settings: the display. */
export const JourneyListSettings: Story = {
  args: {
    initialState: {
      selectedBlockId: 'landingJourneyListId',
      inspectorTab: 'settings'
    }
  }
}

/** The header, Settings: the logo. */
export const ChromeSettings: Story = {
  args: {
    initialState: { selectedBlockId: 'headerId', inspectorTab: 'settings' }
  }
}

/** A hero's Colours, every row inherited from the band: orange dots. */
export const SectionColoursInherited: Story = {
  args: { initialState: { selectedBlockId: 'heroId', inspectorTab: 'style' } },
  play: openColoursTab
}

/** A hero's Colours with two overrides set: blue dots on Heading and Button, orange on the rest, Reset on the picker. */
export const SectionColoursSet: Story = {
  args: {
    campaignProp: withBlockPatch(campaign, 'heroId', {
      headingColor: '#B62D1C',
      buttonColor: '#3AA74A'
    }),
    initialState: { selectedBlockId: 'heroId', inspectorTab: 'style' }
  },
  play: openColoursTab
}

/** A Columns section, Style: Ratio above Background and Colours. */
export const ColumnsSectionStyle: Story = {
  args: {
    campaignProp: campaignWithColumns,
    initialState: { selectedBlockId: 'columnsId', inspectorTab: 'style' }
  }
}

/** An empty column slot, Style: styled by its section, with the link to Columns. */
export const ColumnSlotStyle: Story = {
  args: {
    campaignProp: campaignWithColumns,
    initialState: { selectedBlockId: 'slotRightId', inspectorTab: 'style' }
  }
}

/** A section in a column, Style: Background and Colours. */
export const ColumnChildStyle: Story = {
  args: {
    campaignProp: campaignWithColumns,
    initialState: { selectedBlockId: 'slotRichTextId', inspectorTab: 'style' }
  }
}

/** A section in a column, Settings: change type and swap. */
export const ColumnChildSettings: Story = {
  args: {
    campaignProp: campaignWithColumns,
    initialState: {
      selectedBlockId: 'slotRichTextId',
      inspectorTab: 'settings'
    }
  }
}

/** An empty column slot, Settings: choose a type and swap. */
export const ColumnSlotSettings: Story = {
  args: {
    campaignProp: campaignWithColumns,
    initialState: { selectedBlockId: 'slotRightId', inspectorTab: 'settings' }
  }
}

/** A text Extra with its own align and colour: blue dots, Reset enabled. */
export const TextExtraStyleSet: Story = {
  args: {
    campaignProp: withBlockPatch(campaign, 'journeyListNoteId', {
      align: 'center',
      color: '#B62D1C'
    }),
    initialState: {
      selectedBlockId: 'journeyListNoteId',
      inspectorTab: 'style'
    }
  }
}

/** A button Extra with its own align and colours: blue dots, Reset enabled. */
export const ButtonExtraStyleSet: Story = {
  args: {
    campaignProp: withBlockPatch(campaign, 'heroButtonId', {
      align: 'right',
      color: '#3AA74A',
      labelColor: '#FFFFFF'
    }),
    initialState: { selectedBlockId: 'heroButtonId', inspectorTab: 'style' }
  }
}

/** A text Extra, Style: size, align and colour, inherited from its section (orange) with the "Inherits from" link in the header. */
export const TextExtraStyle: Story = {
  args: {
    initialState: {
      selectedBlockId: 'journeyListNoteId',
      inspectorTab: 'style'
    }
  }
}

/** A button Extra, Style: variant, size, align and colours, inherited from its section (orange). */
export const ButtonExtraStyle: Story = {
  args: {
    initialState: { selectedBlockId: 'heroButtonId', inspectorTab: 'style' }
  }
}

/** A button Extra, Settings: the link, inline — web address, section or region. */
export const ButtonExtraSettings: Story = {
  args: {
    initialState: { selectedBlockId: 'heroButtonId', inspectorTab: 'settings' }
  }
}

/** A journey card, Settings: the snapshot title and description and Refresh from journey. */
export const JourneyCardSettings: Story = {
  args: {
    initialState: {
      selectedBlockId: 'landingJourneyId',
      inspectorTab: 'settings'
    }
  }
}

/** A journey card, Style: styled by its section. */
export const JourneyCardStyle: Story = {
  args: {
    initialState: { selectedBlockId: 'landingJourneyId', inspectorTab: 'style' }
  }
}

/** A region card, Style: styled by its section. */
export const RegionCardStyle: Story = {
  args: {
    campaignProp: campaignWithRegions,
    initialState: {
      selectedRegionId: 'eurRegionId',
      selectedBlockId: 'landingSwitcherId',
      inspectorTab: 'style'
    }
  }
}

/** A region card, Settings: the region's settings, list / unlist and Open page. */
export const RegionCardSettings: Story = {
  args: {
    campaignProp: campaignWithRegions,
    initialState: {
      selectedRegionId: 'eurRegionId',
      selectedBlockId: 'landingSwitcherId',
      inspectorTab: 'settings'
    }
  }
}

/** A carousel card, Settings: title and description. */
export const CarouselCardSettings: Story = {
  args: {
    campaignProp: {
      ...campaign,
      blocks: [
        ...campaign.blocks,
        {
          __typename: 'CampaignVideoBlock',
          id: 'cardId',
          campaignId: 'campaignId',
          pageId: 'landingPageId',
          regionId: null,
          parentBlockId: 'carouselId',
          parentOrder: 0,
          source: 'youTube',
          videoId: 'abc',
          videoVariantLanguageId: null,
          title: 'A carousel card',
          description: 'What the card is about',
          image: null,
          duration: null,
          mediaVideo: null
        }
      ]
    },
    initialState: { selectedBlockId: 'cardId', inspectorTab: 'settings' }
  }
}

export default InspectorMeta
