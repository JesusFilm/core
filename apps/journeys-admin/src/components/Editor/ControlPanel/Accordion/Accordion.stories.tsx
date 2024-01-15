import { Meta, StoryObj } from '@storybook/react'

import PaletteIcon from '@core/shared/ui/icons/Palette'

import { journeysAdminConfig } from '../../../../libs/storybook'

import { Accordion } from '.'

const AccordionStory: Meta<typeof Accordion> = {
  ...journeysAdminConfig,
  component: Accordion,
  title: 'Journeys-Admin/Editor/ControlPanel/Accordion'
}

export const Default: StoryObj<typeof Accordion> = {
  render: () => {
    return (
      <Accordion
        icon={<PaletteIcon />}
        name="Style"
        value="Dark"
        description="Card Styling"
      />
    )
  }
}

export const Empty: StoryObj<typeof Accordion> = {
  render: () => {
    return (
      <Accordion
        icon={<PaletteIcon />}
        name="Style"
        value=""
        description="Card Styling"
      />
    )
  }
}

export const Expanded: StoryObj<typeof Accordion> = {
  render: () => {
    return (
      <Accordion
        icon={<PaletteIcon />}
        name="Style"
        value="Dark"
        description="Card Styling"
        expanded
      />
    )
  }
}

export const Minimal: StoryObj<typeof Accordion> = {
  render: () => {
    return <Accordion icon={<PaletteIcon />} value="Palette" expanded />
  }
}

export default AccordionStory
