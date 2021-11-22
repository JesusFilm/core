import { journeyAdminConfig, StoryCard } from '../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { AvatarsArray } from './AccessAvatars'

const AccessAvatarsDemo = {
  ...journeyAdminConfig,
  component: AccessAvatars,
  title: 'JourneyAdmin/AccessAvatarDemo' // remove demo
}

const Template: Story = ({ ...args }) => (
  <StoryCard>
    <AccessAvatars accessAvatarsProps={args.accessAvatarsProps.slice(0, 1)} />
    <br />
    <AccessAvatars accessAvatarsProps={args.accessAvatarsProps.slice(0, 3)} />
    <br />
    <AccessAvatars accessAvatarsProps={args.accessAvatarsProps} />
  </StoryCard>
)

export const Default: Story<AvatarsArray> = Template.bind({})
Default.args = {
  accessAvatarsProps: [
    {
      id: '1',
      firstName: 'Amin',
      lastName: 'Person',
      image: 'https://source.unsplash.com/random/300x300',
      email: 'amin@email.com'
    },
    {
      id: '2',
      firstName: 'Horace',
      lastName: 'Reader',
      image: 'https://source.unsplash.com/random/300x301',
      email: 'horace@email.com'
    },
    {
      id: '3',
      firstName: 'Coral',
      lastName: 'Ortega',
      // image: 'https://source.unsplash.com/random/301x300',
      email: 'coral@email.com'
    },
    {
      id: '4',
      firstName: 'Effie',
      lastName: 'Lowe',
      image: 'https://source.unsplash.com/random/302x300',
      email: 'effie@email.com'
    }
  ]
}

export default AccessAvatarsDemo as Meta
