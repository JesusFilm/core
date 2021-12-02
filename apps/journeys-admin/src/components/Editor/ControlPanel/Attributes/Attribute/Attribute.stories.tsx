import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { Attribute } from '.'
import { Palette } from '@mui/icons-material'

const AttributesStory = {
  ...journeysAdminConfig,
  component: Attribute,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Attribute'
}

export const Default: Story = () => {
  return (
    <Attribute
      icon={<Palette />}
      name="Style"
      value={'Dark'}
      description="Card Styling"
    />
  )
}

export default AttributesStory as Meta
