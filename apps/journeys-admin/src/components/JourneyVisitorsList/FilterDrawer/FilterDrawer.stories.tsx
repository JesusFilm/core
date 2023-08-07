import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { journeysAdminConfig } from '../../../libs/storybook'
import { PageWrapper } from '../../NewPageWrapper'

import { ClearAllButton } from './ClearAllButton'
import { FilterDrawer } from './FilterDrawer'

const FilterDrawerStory = {
  ...journeysAdminConfig,
  component: FilterDrawer,
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof FilterDrawer>> = ({ ...args }) => {
  return (
    <MockedProvider>
      <FlagsProvider>
        <PageWrapper
          {...args}
          title="Visitors"
          backHref="/"
          sidePanelTitle="Filters"
        />
      </FlagsProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  titleAction: <ClearAllButton />,
  sidePanelChildren: (
    <FilterDrawer
      sortSetting="date"
      chatStarted={false}
      withPollAnswers={false}
      withSubmittedText={false}
      withIcon={false}
      hideInteractive={false}
    />
  )
}

export const Complete = Template.bind({})
Complete.args = {
  ...Default.args,
  sidePanelChildren: (
    <FilterDrawer
      sortSetting="date"
      chatStarted
      withPollAnswers
      withSubmittedText
      withIcon
      hideInteractive
    />
  )
}

export default FilterDrawerStory as Meta
