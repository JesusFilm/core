import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import { getVisitorMock } from './DetailsForm/DetailsFormData'

import { VisitorInfo } from '.'

const VisitorInfoDemo: Meta<typeof VisitorInfo> = {
  ...journeysAdminConfig,
  component: VisitorInfo,
  title: 'Journeys-Admin/VisitorInfo',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof VisitorInfo> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={[getVisitorMock]}>
      <VisitorInfo {...args} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'visitorId'
  }
}

export default VisitorInfoDemo
