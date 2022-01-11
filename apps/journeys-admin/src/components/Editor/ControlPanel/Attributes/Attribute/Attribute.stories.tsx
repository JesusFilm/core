import { Story, Meta } from '@storybook/react'
import PaletteIcon from '@mui/icons-material/Palette'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { EditorProvider } from '../../../Context'
import { Attribute } from '.'

const AttributesStory = {
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
    <EditorProvider initialState={{ selectedAttributeId: 'custom-id' }}>
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

export default AttributesStory as Meta
