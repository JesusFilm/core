import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { Variant } from '.'

const VariantStory = {
  ...simpleComponentConfig,
  component: Variant,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Typography/Variant'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Variant />
    </MockedProvider>
  )
}

export default VariantStory as Meta
