import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { VisitorInfoProvider } from '../VisitorInfoProvider'
import { getVisitorMock } from './VisitorDetailForm/VisitorDetailFormData'
import { VisitorDetail } from '.'

const VisitorDetailDemo = {
  ...simpleComponentConfig,
  component: VisitorDetail,
  title: 'Journeys-Admin/VisitorInfo/VisitorDetail'
}

const Template: Story<ComponentProps<typeof VisitorDetail>> = ({ ...args }) => (
  <MockedProvider mocks={[getVisitorMock]}>
    <VisitorInfoProvider>
      <VisitorDetail {...args} />
    </VisitorInfoProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default VisitorDetailDemo as Meta
