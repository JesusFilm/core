import { Story, Meta } from '@storybook/react'
import PaletteIcon from '@mui/icons-material/Palette'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Button } from '.'

const ButtonStory = {
  ...journeysAdminConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/ControlPanel/Button'
}

export const Default: Story = () => {
  return (
    <Button
      icon={<PaletteIcon />}
      name="Style"
      value="Dark"
      description="Card Styling"
    />
  )
}

export const Selected: Story = () => {
  return (
    <Button
      icon={<PaletteIcon />}
      name="Style"
      value="Dark"
      description="Card Styling"
      selected
    />
  )
}

export const Minimal: Story = () => {
  return <Button icon={<PaletteIcon />} value="Palette" selected />
}

export default ButtonStory as Meta
