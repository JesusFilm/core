import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { TypographyColor } from '../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '.'

const ColorDisplayIconStory = {
  ...simpleComponentConfig,
  component: ColorDisplayIcon,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography'
}

export const Default: Story = () => {
  const color: TypographyColor = TypographyColor.primary
  return <ColorDisplayIcon color={color} />
}

export default ColorDisplayIconStory as Meta
