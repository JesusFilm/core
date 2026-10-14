import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement } from 'react'

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
import {
  CampaignEditorProvider,
  CampaignEditorState
} from '../CampaignEditorProvider'
import { campaign, campaignWithColumns, campaignWithRegions } from '../data'

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
          <Box sx={{ display: 'flex', height: 720 }}>
            <Inspector isManager={isManager} />
          </Box>
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

/** A Featured Media section, Settings: the media slot and which side the media sits on. */
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

/** A text Extra, Style: size, align and colour. */
export const TextExtraStyle: Story = {
  args: {
    initialState: {
      selectedBlockId: 'journeyListNoteId',
      inspectorTab: 'style'
    }
  }
}

/** A button Extra, Style: variant, size and colours. */
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
