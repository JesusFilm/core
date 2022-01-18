import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { FontVariant } from '.'

const FontVariantStory = {
  ...simpleComponentConfig,
  component: FontVariant,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/FontVariant'
}

export const Default: Story = () => {
  return <FontVariant id={'text-color-id'} variant={null} />
}

export default FontVariantStory as Meta
