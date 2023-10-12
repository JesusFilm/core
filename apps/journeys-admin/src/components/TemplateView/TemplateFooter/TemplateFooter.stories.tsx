import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../libs/storybook'

import { TemplateFooter } from './TemplateFooter'

const TemplateFooterStory: Meta<typeof TemplateFooter> = {
  ...simpleComponentConfig,
  component: TemplateFooter,
  title: 'Journeys-Admin/TemplateView/TemplateFooter'
}

const Template: StoryObj<typeof TemplateFooter> = {
  render: () => {
    return (
      <MockedProvider>
        <TemplateFooter />
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template
}

export default TemplateFooterStory
