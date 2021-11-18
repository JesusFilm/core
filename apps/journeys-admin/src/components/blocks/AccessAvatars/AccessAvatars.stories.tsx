import { journeyAdminConfig } from '../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { AvatarsArray } from './AccessAvatars'

const AccessAvatarsDemo = {
  ...journeyAdminConfig,
  component: AccessAvatars,
  title: 'JourneyAdmin/AccessAvatarDemo'
}

const Template: Story = () => <AccessAvatars accessAvatarsProps={avatars} />

export const Default: Story<AvatarsArray> = Template.bind({})

const avatars = [
  {
    id: '1',
    firstName: '1',
    lastName: '1',
    image: 'https://source.unsplash.com/random/300x300',
    email: '1'
  },
  {
    id: '2',
    firstName: '2',
    lastName: '2',
    image: 'https://source.unsplash.com/random/300x300',
    email: '2'
  },
  {
    id: '3',
    firstName: '3',
    lastName: '3',
    image: 'https://source.unsplash.com/random/300x300',
    email: '3'
  },
  {
    id: '4',
    firstName: '4',
    lastName: '4',
    image: 'https://source.unsplash.com/random/300x300',
    email: '4'
  }
]

export default AccessAvatarsDemo as Meta
