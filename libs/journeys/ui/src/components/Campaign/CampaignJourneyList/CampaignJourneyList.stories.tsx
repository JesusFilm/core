import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import {
  CampaignJourneyListDisplay,
  CampaignPageKind
} from '../../../../__generated__/globalTypes'
import {
  campaignStoryConfig,
  landingTree,
  regionTree
} from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignJourneyList } from './CampaignJourneyList'

const meta: Meta<typeof CampaignJourneyList> = {
  ...campaignStoryConfig(),
  component: CampaignJourneyList,
  title: 'Journeys-Ui/Campaign/CampaignJourneyList'
}

/** The list with every journey card removed. */
function emptyList(
  block: CampaignTreeOf<'CampaignJourneyListBlock'>
): CampaignTreeOf<'CampaignJourneyListBlock'> {
  return { ...block, children: [] }
}

type Story = StoryObj<ComponentProps<typeof CampaignJourneyList>>

export const Default: Story = {
  args: {
    block: landingTree(
      'landingJourneyListId'
    ) as CampaignTreeOf<'CampaignJourneyListBlock'>
  }
}

const journeyList = landingTree(
  'landingJourneyListId'
) as CampaignTreeOf<'CampaignJourneyListBlock'>

/** Cards in a grid that fills at 260 px from `md`, one column below it. */
export const Grid: Story = {
  args: {
    block: { ...journeyList, display: CampaignJourneyListDisplay.grid }
  }
}

/** One full-width row per card, the image beside the text from `md`. */
export const List: Story = {
  args: {
    block: { ...journeyList, display: CampaignJourneyListDisplay.list }
  }
}

/** A list with no live journey card keeps its heading and prints the noJourneys string beneath it. */
export const EmptyLanding: Story = {
  args: {
    block: emptyList(
      landingTree(
        'landingJourneyListId'
      ) as CampaignTreeOf<'CampaignJourneyListBlock'>
    )
  }
}

/** The same empty state on a Region Page whose region has no journeys yet. */
export const EmptyRegion: Story = {
  ...campaignStoryConfig(CampaignPageKind.regionTemplate),
  args: {
    block: emptyList(
      regionTree(
        'regionJourneyListId'
      ) as CampaignTreeOf<'CampaignJourneyListBlock'>
    )
  }
}

export default meta
