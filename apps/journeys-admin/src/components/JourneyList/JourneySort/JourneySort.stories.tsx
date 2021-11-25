import { Story, Meta } from '@storybook/react'
import JourneySort, { SortBy } from '.'

import { journeysAdminConfig } from '../../../libs/storybook'

const JourneySortDemo = {
  ...journeysAdminConfig,
  component: JourneySort,
  title: 'Journeys-Admin/JourneyList/JourneySort'
}

const Template: Story = () => (
  <JourneySort
    sortBy={SortBy.UNDEFINED}
    setSortBy={() => {
      console.log()
    }}
    open
  />
)

// Mobile Light is hidden in story - left as is since dark mode sufficiently captures scenario
export const Default = Template.bind({})

export default JourneySortDemo as Meta
