import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'

import PaletteIcon from '@core/shared/ui/icons/Palette'

import { journeysAdminConfig } from '../../../../../../../libs/storybook'

import { Button } from '.'

const ButtonStory: Meta<typeof Button> = {
  ...journeysAdminConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/AddBlock/Button'
}

const Template: StoryObj<typeof Button> = {
  render: ({ ...args }) => {
    return <Button {...args} />
  }
}

export const Default: StoryObj<typeof Button> = {
  render: () => {
    return <Button icon={<PaletteIcon />} value="Dark" />
  }
}

export const Empty: StoryObj<typeof Button> = {
  render: () => {
    return <Button icon={<PaletteIcon />} value="" />
  }
}

export const HoverState = {
  ...Template,
  play: async () => {
    await waitFor(async () => {
      await userEvent.hover(screen.getByRole('button'))
    })
  }
}

export default ButtonStory
