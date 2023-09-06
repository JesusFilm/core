import { Meta, Story } from '@storybook/react'

import Palette from '@core/shared/ui/icons/Palette'

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
      icon={<Palette />}
      name="Style"
      value="Dark"
      description="Card Styling"
    />
  )
}

export const Empty: Story = () => {
  return (
    <Button
      icon={<Palette />}
      name="Style"
      value=""
      description="Card Styling"
    />
  )
}

export const Selected: Story = () => {
  return (
    <Button
      icon={<Palette />}
      name="Style"
      value="Dark"
      description="Card Styling"
      selected
    />
  )
}

export const Minimal: Story = () => {
  return <Button icon={<Palette />} value="Palette" selected />
}

export default ButtonStory as Meta
