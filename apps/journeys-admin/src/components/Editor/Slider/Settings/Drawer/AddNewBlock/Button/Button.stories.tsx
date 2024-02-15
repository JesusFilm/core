import { Meta, StoryObj } from '@storybook/react'

import PaletteIcon from '@core/shared/ui/icons/Palette'

import { journeysAdminConfig } from '../../../../libs/storybook'

import { Button } from '.'

const ButtonStory: Meta<typeof Button> = {
  ...journeysAdminConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/ControlPanel/Button'
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

export default ButtonStory
