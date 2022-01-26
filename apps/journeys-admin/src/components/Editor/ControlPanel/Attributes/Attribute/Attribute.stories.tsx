import { Story, Meta } from '@storybook/react'
import PaletteIcon from '@mui/icons-material/Palette'
import { EditorProvider } from '@core/journeys/ui'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { Attribute } from '.'

const AttributeStory = {
  ...journeysAdminConfig,
  component: Attribute,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Attribute'
}

export const Default: Story = () => {
  return (
    <EditorProvider>
      <Attribute
        id="custom-id"
        icon={<PaletteIcon />}
        name="Style"
        value={'Dark'}
        description="Card Styling"
      />
    </EditorProvider>
  )
}

export const Selected: Story = () => {
  return (
    <EditorProvider>
      <Attribute
        id="custom-id"
        icon={<PaletteIcon />}
        name="Style"
        value={'Dark'}
        description="Card Styling"
      />
    </EditorProvider>
  )
}

export default AttributeStory as Meta
