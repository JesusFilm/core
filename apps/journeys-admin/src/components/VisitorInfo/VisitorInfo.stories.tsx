import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../libs/storybook'

import { getVisitorMock } from './DetailsForm/DetailsFormData'

import { VisitorInfo } from '.'

const VisitorInfoDemo = {
  ...journeysAdminConfig,
  component: VisitorInfo,
  title: 'Journeys-Admin/VisitorInfo',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof VisitorInfo>> = ({ ...args }) => (
  <MockedProvider mocks={[getVisitorMock]}>
    <VisitorInfo {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default VisitorInfoDemo as Meta
