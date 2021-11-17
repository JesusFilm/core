import { journeyAdminConfig } from '../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { ReactElement } from 'react'

const AccessAvatarsDemo = {
  ...journeyAdminConfig,
  component: AccessAvatars,
  title: 'JourneyAdmin/AccessAvatarDemo'
}

const Template: Story<ReactElement> = ({ ...props }) => (
  <AccessAvatars {...props} />
)

export const Default = Template.bind({})
Default.args = [
  {
    id: '1',
    firstName: '1',
    lastName: '1',
    image: '1',
    email: '1'
  },
  {
    id: '1',
    firstName: '1',
    lastName: '1',
    image: '1',
    email: '1'
  },
  {
    id: '1',
    firstName: '1',
    lastName: '1',
    image: '1',
    email: '1'
  },
  {
    id: '1',
    firstName: '1',
    lastName: '1',
    image: '1',
    email: '1'
  }
]

export default AccessAvatarsDemo as Meta
