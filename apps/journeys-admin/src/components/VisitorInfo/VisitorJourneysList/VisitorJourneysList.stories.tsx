import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../../libs/storybook'

import { getJourneysMock } from './utils/data'

import { VisitorJourneysList } from '.'

const JourneyListStory = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/VisitorInfo/VisitorJourneysList'
}

const Template: Story<ComponentProps<typeof VisitorJourneysList>> = ({
  ...args
}) => (
  <MockedProvider mocks={[getJourneysMock]}>
    <VisitorJourneysList {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default JourneyListStory as Meta
