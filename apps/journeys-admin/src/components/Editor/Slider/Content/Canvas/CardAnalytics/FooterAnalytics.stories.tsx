import { Meta, StoryObj } from '@storybook/react'
import { FooterAnalytics } from '.'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

const Demo: Meta<typeof FooterAnalytics> = {
  ...simpleComponentConfig,
  component: FooterAnalytics,
  title: 'Journeys-Admin/Editor/Slider/Content/Canvas/FooterAnalytics'
}

const Template: StoryObj<typeof FooterAnalytics> = {
  render: (args) => (
    <EditorProvider initialState={args.initialState}>
      <FooterAnalytics />
    </EditorProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    initialState: {
      selectedStep: {
        id: 'step1.id'
      },
      showAnalytics: true,
      analytics: {
        stepMap: new Map([
          [
            'step1.id',
            {
              eventMap: new Map([
                ['footerThumbsUpButtonClick', 10],
                ['footerThumbsDownButtonClick', 2],
                ['footerChatButtonClick', 5]
              ])
            }
          ]
        ])
      }
    }
  }
}

export default Demo
