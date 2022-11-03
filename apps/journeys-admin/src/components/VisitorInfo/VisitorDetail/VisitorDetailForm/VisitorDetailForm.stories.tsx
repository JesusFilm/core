import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { getVisitorMock, visitorUpdateMock } from './VisitorDetailFormData'
import { VisitorDetailForm } from '.'

const VisitorDetailFormDemo = {
  ...simpleComponentConfig,
  component: VisitorDetailForm,
  title: 'Journeys-Admin/VisitorInfo/VisitorDetail/VisitorDetailForm'
}

const Template: Story<ComponentProps<typeof VisitorDetailForm>> = ({
  ...args
}) => (
  <MockedProvider mocks={[getVisitorMock, visitorUpdateMock]}>
    <VisitorDetailForm {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default VisitorDetailFormDemo as Meta
