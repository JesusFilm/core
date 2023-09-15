import { Meta, StoryObj } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import PaletteIcon from '@core/shared/ui/icons/Palette'

import { simpleComponentConfig } from '../../../../../libs/storybook'

import { Attribute } from '.'

const AttributeStory: Meta<typeof Attribute> = {
  ...simpleComponentConfig,
  component: Attribute,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Attribute'
}

export const Default: StoryObj<typeof Attribute> = {
  render: () => {
    return (
      <EditorProvider>
        <Attribute
          id="custom-id"
          icon={<PaletteIcon />}
          name="Style"
          value="Dark"
          description="Card Styling"
        />
      </EditorProvider>
    )
  }
}

export default AttributeStory
