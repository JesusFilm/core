import { Story, Meta } from '@storybook/react'
import { ReactElement, useState } from 'react'
import { JourneySort, SortBy } from '.'
import { journeysAdminConfig } from '../../../libs/storybook'

const JourneySortMock = (): ReactElement => {
  const [sortBy, setSortBy] = useState(SortBy.UNDEFINED)
  return <JourneySort sortBy={sortBy} setSortBy={setSortBy} open={true} />
}

const JourneySortDemo = {
  ...journeysAdminConfig,
  component: JourneySort,
  title: 'Journeys-Admin/JourneyList/JourneySort'
}

const Template: Story = () => <JourneySortMock />

// Mobile Light is hidden in story - left as is since dark mode sufficiently captures scenario
export const Default = Template.bind({})

export default JourneySortDemo as Meta
