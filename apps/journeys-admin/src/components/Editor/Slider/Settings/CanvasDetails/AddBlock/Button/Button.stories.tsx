import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent, waitFor } from 'storybook/test'
import { ComponentProps } from 'react'

import PaletteIcon from '@core/shared/ui/icons/Palette'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Button } from '.'

const ButtonStory: Meta<typeof Button> = {
  ...simpleComponentConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/AddBlock/Button'
}

const Template: StoryObj<ComponentProps<typeof Button>> = {
  render: ({ ...args }) => {
    return <Button {...args} />
  }
}

export const Default: StoryObj<typeof Button> = {
  render: () => {
    return <Button icon={<PaletteIcon />} value="Dark" />
  }
}

export const HoverState = {
  ...Template,
  args: {
    icon: <PaletteIcon />,
    value: 'Hover'
  },
  play: async () => {
    await waitFor(async () => {
      await userEvent.hover(screen.getByRole('button'))
    })
  }
}

export default ButtonStory
