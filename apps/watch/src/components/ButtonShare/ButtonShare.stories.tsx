import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { watchConfig } from '../../libs/storybook'

import { ButtonShare } from '.'

const ButtonShareStory: Meta<typeof ButtonShare> = {
  ...watchConfig,
  component: ButtonShare,
  title: 'Watch/ButtonShare',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof ButtonShare> = {
  render: () => (
    <>
      <ButtonShare variant="icon" onClick={noop} />
      <ButtonShare variant="button" onClick={noop} />
    </>
  )
}

export const Default = { ...Template }

export default ButtonShareStory
