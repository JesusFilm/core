import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Variant } from '.'

const VariantStory = {
  ...simpleComponentConfig,
  component: Variant,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Variant'
}

export const Default: Story = () => {
  return <Variant id={'button-variant-id'} variant={null} />
}

export default VariantStory as Meta
