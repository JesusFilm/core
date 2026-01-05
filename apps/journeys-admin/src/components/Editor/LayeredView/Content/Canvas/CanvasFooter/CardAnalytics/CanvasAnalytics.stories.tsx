import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithRef } from 'react'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'
import {
  JourneyFields_chatButtons as ChatButton,
  JourneyFields as Journey
} from '../../../../../../../../__generated__/JourneyFields'

import { CardAnalytics } from './CardAnalytics'

const CardAnalyticsStory: Meta<typeof CardAnalytics> = {
  ...simpleComponentConfig,
  component: CardAnalytics,
  title:
    'Journeys-Admin/Editor/Slider/Content/Canvas/CanvasFooter/CardAnalytics'
}

const Template: StoryObj<
  ComponentPropsWithRef<typeof CardAnalytics> & {
    chatButtons: ChatButton[]
  }
> = {
  render: ({ chatButtons }) => {
    const journey = {
      chatButtons
    } as unknown as Journey
    const initialState = {
      selectedStep: { id: 'step.id' },
      analytics: {
        stepMap: new Map([
          [
            'step.id',
            {
              eventMap: new Map([
                ['footerThumbsUpButtonClick', 1],
                ['footerThumbsDownButtonClick', 2]
              ])
            }
          ]
        ]),
        targetMap: new Map([
          ['step.id->link:https://chatButton1.com:facebook', 3],
          ['step.id->link:https://chatButton2.com:custom', 4]
        ])
      }
    } as unknown as EditorState

    return (
      <JourneyProvider value={{ journey }}>
        <EditorProvider initialState={initialState}>
          <CardAnalytics />
        </EditorProvider>
      </JourneyProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    chatButtons: []
  }
}

export const Filled = {
  ...Template,
  args: {
    chatButtons: [
      {
        __typename: 'ChatButtonBlock',
        id: 'chatButton1.id',
        link: 'https://chatButton1.com',
        platform: MessagePlatform.facebook
      },
      {
        __typename: 'ChatButtonBlock',
        id: 'chatButton2.id',
        link: 'https://chatButton2.com',
        platform: MessagePlatform.custom
      }
    ]
  }
}

export default CardAnalyticsStory
