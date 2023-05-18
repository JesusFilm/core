import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { journeysAdminConfig } from '../../../libs/storybook'
import { PageWrapper } from '../../NewPageWrapper'

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

const Template: Story<
  ComponentProps<typeof FilterDrawer> & {
    templates?: boolean
  }
> = ({ templates = true, ...args }) => {
  return (
    <MockedProvider>
      <FlagsProvider>
        <PageWrapper
          {...args}
          title="Visitors"
          backHref="/"
          sidePanelTitle="Filters"
          sidePanelChildren={<FilterDrawer />}
        />
      </FlagsProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default FilterDrawerStory as Meta
