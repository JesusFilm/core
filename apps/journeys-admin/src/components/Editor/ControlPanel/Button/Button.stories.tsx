import { Meta, StoryObj } from '@storybook/react'

import Palette from '@core/shared/ui/icons/Palette'

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
        icon={<Palette />}
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
        icon={<Palette />}
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
        icon={<Palette />}
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
    return <Button icon={<Palette />} value="Palette" selected />
  }
}

export default ButtonStory
