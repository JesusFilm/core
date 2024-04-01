import { Meta, StoryObj } from '@storybook/react'

import PaletteIcon from '@core/shared/ui/icons/Palette'

import { journeysAdminConfig } from '../../../../../../../libs/storybook'

import { Button } from '.'

const ButtonStory: Meta<typeof Button> = {
  ...journeysAdminConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/AddBlock/Button'
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

export const HoverState: StoryObj<typeof Button> = {
  render: () => {
    return (
      <div className="simulate-hover">
        <Button icon={<PaletteIcon />} value="Hover" />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'This story simulates the hover state of the button.'
      }
    }
  }
}

export default ButtonStory
