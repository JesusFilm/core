import { Meta, StoryObj } from '@storybook/react'

import PaletteIcon from '@core/shared/ui/icons/Palette'

import { journeysAdminConfig } from '../../../../../libs/storybook'

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
      >
        test
      </Accordion>
    )
  }
}

export default AccordionStory
