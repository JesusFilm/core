import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { journeysAdminConfig } from '../../../../../../../../../libs/storybook'
import { HostListItem } from './HostListItem'

const HostListItemDemo = {
  ...journeysAdminConfig,
  component: HostListItem,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/HostedBy/HostOptions',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

// todo: render the card component based on prop arrays.

const Template: Story<ComponentProps<typeof HostListItem>> = ({
  hostTitle,
  hostLocation,
  avatarSrc1,
  avatarSrc2
}) => (
  <HostListItem
    hostTitle={hostTitle}
    hostLocation={hostLocation}
    avatarSrc1={avatarSrc1}
    avatarSrc2={avatarSrc2}
  />
)

export const Default = Template.bind({})
Default.args = {
  hostTitle: `John "The Rock" Geronimo`,
  avatarSrc1: 'https://tinyurl.com/3bxusmyb'
}

export const Empty = Template.bind({})
Empty.args = {
  hostTitle: `John "The Rock" Geronimo`
}

export const withLocation = Template.bind({})
withLocation.args = {
  ...Default.args,
  hostLocation: `Tokyo, Japan`
}

export const TwoAvatars = Template.bind({})
TwoAvatars.args = {
  ...withLocation.args,
  hostTitle: 'John G  & Siyang C',
  avatarSrc2: 'https://tinyurl.com/3bxusmyb'
}

export default HostListItemDemo as Meta
