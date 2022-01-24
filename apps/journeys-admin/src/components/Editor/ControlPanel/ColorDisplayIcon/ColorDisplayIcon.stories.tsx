import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { TypographyColor } from '../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '.'

const ColorDisplayIconStory = {
  ...simpleComponentConfig,
  component: ColorDisplayIcon,
  title: 'Journeys-Admin/Editor/ControlPanel/ColorDisplayIcon'
}

export const Default: Story = () => {
  return <ColorDisplayIcon color={TypographyColor.secondary} />
}

export default ColorDisplayIconStory as Meta
