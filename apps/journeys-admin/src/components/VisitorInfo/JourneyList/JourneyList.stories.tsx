import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { getJourneysMock } from './utils/data'
import { JourneyList } from '.'

const JourneyListStory = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/VisitorInfo/JourneyList'
}

const Template: Story<ComponentProps<typeof JourneyList>> = ({ ...args }) => (
  <MockedProvider mocks={[getJourneysMock]}>
    <JourneyList {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default JourneyListStory as Meta
