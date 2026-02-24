import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { watchConfig } from '../../../libs/storybook/config'

import { ContainerDescription } from './ContainerDescription'

const ContainerDescriptionStory: Meta<typeof ContainerDescription> = {
  ...watchConfig,
  component: ContainerDescription,
  title: 'Watch/VideoContainerPage/ContainerDescription',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof ContainerDescription> = {
  render: ({ ...args }) => <ContainerDescription {...args} />
}
export const Default = {
  ...Template,
  args: {
    value:
      'This is where the description will go, to the left hand side of the share button',
    openDialog: noop
  }
}

export default ContainerDescriptionStory
