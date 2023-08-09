import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../../../../../../../libs/storybook'

import { HostListItem } from './HostListItem'

const HostListItemDemo = {
  ...journeysAdminConfig,
  component: HostListItem,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/HostedBy/HostListItem',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof HostListItem>> = ({
  title,
  location,
  src1,
  src2
}) => (
  <HostListItem
    id="hostId"
    title={title}
    location={location}
    src1={src1}
    src2={src2}
    onClick={noop}
  />
)

export const Default = Template.bind({})
Default.args = {
  title: `John "The Rock" Geronimo`,
  src1: 'https://tinyurl.com/3bxusmyb'
}

export const Empty = Template.bind({})
Empty.args = {
  title: `John "The Rock" Geronimo`
}

export const withLocation = Template.bind({})
withLocation.args = {
  ...Default.args,
  location: `Tokyo, Japan`
}

export const TwoAvatars = Template.bind({})
TwoAvatars.args = {
  ...withLocation.args,
  title: 'John G  & Siyang C',
  src2: 'https://tinyurl.com/3bxusmyb'
}

export default HostListItemDemo as Meta
