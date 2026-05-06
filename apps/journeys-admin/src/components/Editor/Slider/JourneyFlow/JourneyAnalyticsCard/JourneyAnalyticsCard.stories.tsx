import { StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyAnalyticsCard } from '.'

const JourneyAnalyticsCardDemo = {
  ...simpleComponentConfig,
  component: JourneyAnalyticsCard,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/JourneyAnalyticsCard'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof JourneyAnalyticsCard>
> = {
  render: ({ args }) => {
    const initialState = {
      analytics: {
        ...args
      }
    } as unknown as EditorState

    return (
      <EditorProvider initialState={initialState}>
        <JourneyAnalyticsCard />
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    totalVisitors: 1000000,
    chatsStarted: 1500,
    linksVisited: 100
  }
}

export default JourneyAnalyticsCardDemo
