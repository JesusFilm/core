import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { Alert, AlertProps } from './Alert'

const AlertStory = {
  ...simpleComponentConfig,
  component: Alert,
  title: 'Journeys-Admin/JourneyView/Menu/Alert'
}

const Template: Story<AlertProps> = ({ ...args }) => (
  <MockedProvider>
    <Alert {...args} />
  </MockedProvider>
)

export const Success = Template.bind({})
Success.args = {
  message: 'Success!',
  open: true,
  setOpen: () => {
    return undefined
  }
}

export default AlertStory as Meta
