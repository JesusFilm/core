import type { Meta, StoryObj } from '@storybook/nextjs'
import type { ComponentPropsWithoutRef } from 'react'

import {
  EditorProvider,
  type EditorState
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { MessagePlatform } from '../../../../../../../__generated__/globalTypes'
import type { JourneyFields as Journey } from '../../../../../../../__generated__/JourneyFields'

import { CanvasFooter } from './CanvasFooter'

const CanvasFooterStory: Meta<typeof CanvasFooter> = {
  ...simpleComponentConfig,
  component: CanvasFooter,
  title: 'Journeys-Admin/Editor/Slider/Content/Canvas/CanvasFooter'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof CanvasFooter> & {
    showAnalytics: boolean
  }
> = {
  render: ({ showAnalytics }) => {
    const journey = {
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
    } as unknown as Journey
    const initialState = {
      selectedStep: { id: 'step.id', children: [] },
      showAnalytics,
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
          <CanvasFooter scale={1} />
        </EditorProvider>
      </JourneyProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    showAnalytics: false
  }
}

export const Analytics = {
  ...Template,
  args: {
    showAnalytics: true
  }
}

export default CanvasFooterStory
