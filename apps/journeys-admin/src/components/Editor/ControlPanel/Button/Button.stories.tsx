import PaletteIcon from '@mui/icons-material/Palette'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../../libs/storybook'

import { Button } from '.'

const ButtonStory: Meta<typeof Button> = {
  ...journeysAdminConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/ControlPanel/Button'
}

export const Default: StoryObj<typeof Button> = {
  render: () => {
    return (
      <Button
        icon={<PaletteIcon />}
        name="Style"
        value="Dark"
        description="Card Styling"
      />
    )
  }
}

export const Empty: StoryObj<typeof Button> = {
  render: () => {
    return (
      <Button
        icon={<PaletteIcon />}
        name="Style"
        value=""
        description="Card Styling"
      />
    )
  }
}

export const Selected: StoryObj<typeof Button> = {
  render: () => {
    return (
      <Button
        icon={<PaletteIcon />}
        name="Style"
        value="Dark"
        description="Card Styling"
        selected
      />
    )
  }
}

export const Minimal: StoryObj<typeof Button> = {
  render: () => {
    return <Button icon={<PaletteIcon />} value="Palette" selected />
  }
}

export default ButtonStory
