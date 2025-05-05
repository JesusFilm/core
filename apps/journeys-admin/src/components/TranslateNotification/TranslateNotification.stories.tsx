import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { TranslateNotification } from './TranslateNotification'

const TranslateNotificationStory: Meta<typeof TranslateNotification> = {
  ...simpleComponentConfig,

  component: TranslateNotification,

  title: 'Journeys-Admin/TranslateNotification'
}

const Template: StoryObj<typeof TranslateNotification> = {
  render: ({ ...args }) => <TranslateNotification message={args.message} />
}

export const Default = {
  ...Template,

  args: {
    message: 'Translation in progress'
  }
}

export const LongMessage = {
  ...Template,

  args: {
    message:
      'Your journey content is being translated to multiple languages. This may take a few minutes.'
  }
}

export default TranslateNotificationStory
