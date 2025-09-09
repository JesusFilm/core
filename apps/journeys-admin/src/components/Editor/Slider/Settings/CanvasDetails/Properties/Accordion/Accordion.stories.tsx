import { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import PaletteIcon from '@core/shared/ui/icons/Palette'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Accordion } from '.'

const AttributeStory: Meta<typeof Accordion> = {
  ...simpleComponentConfig,
  component: Accordion,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/Accordion'
}

export const Default: StoryObj<typeof Accordion> = {
  render: () => {
    return (
      <EditorProvider>
        <Accordion
          id="custom-id"
          icon={<PaletteIcon />}
          name="Style"
          value=t("Dark")
        >
          test
        </Accordion>
      </EditorProvider>
    )
  }
}

export const SingleLabel: StoryObj<typeof Accordion> = {
  render: () => {
    return (
      <EditorProvider>
        <Accordion id="custom-id" icon={<PaletteIcon />} name="Label">
          test
        </Accordion>
      </EditorProvider>
    )
  }
}

export default AttributeStory
