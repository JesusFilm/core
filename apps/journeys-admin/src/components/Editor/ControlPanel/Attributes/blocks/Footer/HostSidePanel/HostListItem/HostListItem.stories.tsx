import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { journeysAdminConfig } from '../../../../../../../../libs/storybook'

import { HostListItem } from './HostListItem'

const HostListItemDemo: Meta<typeof HostListItem> = {
  ...journeysAdminConfig,
  component: HostListItem,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/HostedBy/HostListItem',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof HostListItem> = {
  render: ({ title, location, src1, src2 }) => (
    <HostListItem
      id="hostId"
      title={title}
      location={location}
      src1={src1}
      src2={src2}
      onClick={noop}
    />
  )
}

export const Default = {
  ...Template,
  args: {
    title: `John "The Rock" Geronimo`,
    src1: 'https://tinyurl.com/3bxusmyb'
  }
}

export const Empty = {
  ...Template,
  args: {
    title: `John "The Rock" Geronimo`
  }
}

export const WithLocation = {
  ...Template,
  args: {
    ...Default.args,
    location: `Tokyo, Japan`
  }
}

export const TwoAvatars = {
  ...Template,
  args: {
    ...WithLocation.args,
    title: 'John G  & Siyang C',
    src2: 'https://tinyurl.com/3bxusmyb'
  }
}

export default HostListItemDemo
