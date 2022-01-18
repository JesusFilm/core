import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { TypographyColor } from '../../../../../../../../__generated__/globalTypes'
import { TextColor } from '.'

const TextColorStory = {
  ...journeysAdminConfig,
  component: TextColor,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/TextColor'
}

export const Default: Story = () => {
  return <TextColor id={'text-color-id'} color={TypographyColor.primary} />
}

export default TextColorStory as Meta
