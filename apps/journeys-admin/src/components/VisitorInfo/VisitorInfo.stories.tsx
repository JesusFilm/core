import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../libs/storybook'
import { getVisitorMock } from './VisitorDetail/VisitorDetailForm/VisitorDetailFormData'
import { getVisitorEventsMock } from './VisitorJourneyList/VisitorJourneyListData'
import { VisitorInfo } from '.'

const VisitorInfoDemo = {
  ...simpleComponentConfig,
  component: VisitorInfo,
  title: 'Journeys-Admin/VisitorInfo',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof VisitorInfo>> = ({ ...args }) => (
  <MockedProvider mocks={[getVisitorMock, getVisitorEventsMock]}>
    <VisitorInfo {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default VisitorInfoDemo as Meta
