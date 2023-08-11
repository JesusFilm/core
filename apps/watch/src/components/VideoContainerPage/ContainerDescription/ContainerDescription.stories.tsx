import { ComponentStory, Meta } from '@storybook/react'
import noop from 'lodash/noop'

import { watchConfig } from '../../../libs/storybook/config'

import { ContainerDescription } from './ContainerDescription'

const ContainerDescriptionStory = {
  ...watchConfig,
  component: ContainerDescription,
  title: 'Watch/VideoContainerPage/ContainerDescription',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: ComponentStory<typeof ContainerDescription> = ({ ...args }) => (
  <ContainerDescription {...args} />
)

export const Default = Template.bind({})

Default.args = {
  value:
    'This is where the description will go, to the left hand side of the share button',
  openDialog: noop
}

export default ContainerDescriptionStory as Meta
