import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import type { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { PageWrapper } from '../../PageWrapper'

import { ClearAllButton } from './ClearAllButton'
import { FilterDrawer } from './FilterDrawer'

const journey = {
  id: '123',
  slug: 'test-journey'
} as Journey

const FilterDrawerStory: Meta<typeof FilterDrawer> = {
  ...journeysAdminConfig,
  component: FilterDrawer,
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof FilterDrawer> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <PageWrapper
          {...args}
          title="Visitors"
          backHref="/"
          sidePanelTitle="Filters"
        />
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    titleAction: <ClearAllButton />,
    sidePanelChildren: (
      <FilterDrawer
        journey={journey}
        sortSetting="date"
        chatStarted={false}
        withPollAnswers={false}
        withSubmittedText={false}
        withIcon={false}
        hideInteractive={false}
      />
    )
  }
}

export const Complete = {
  ...Template,
  args: {
    ...Default.args,
    sidePanelChildren: (
      <FilterDrawer
        journey={journey}
        sortSetting="date"
        chatStarted
        withPollAnswers
        withSubmittedText
        withIcon
        hideInteractive
      />
    )
  }
}

export default FilterDrawerStory
