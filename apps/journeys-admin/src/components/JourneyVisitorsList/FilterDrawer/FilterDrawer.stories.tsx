import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { PageWrapper } from '../../PageWrapper'

import { ClearAllButton } from './ClearAllButton'
import { FilterDrawer } from './FilterDrawer'

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
        journeyId="123"
        sortSetting="date"
        chatStarted={false}
        withPollAnswers={false}
        withSubmittedText={false}
        withIcon={false}
        hideInteractive={false}
        handleClearAll={noop}
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
        journeyId="123"
        sortSetting="date"
        chatStarted
        withPollAnswers
        withSubmittedText
        withIcon
        hideInteractive
        handleClearAll={noop}
      />
    )
  }
}

export default FilterDrawerStory
