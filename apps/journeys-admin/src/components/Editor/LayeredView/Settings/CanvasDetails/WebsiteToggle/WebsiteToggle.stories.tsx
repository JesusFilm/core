import { MockedProvider } from '@apollo/client/testing'
import { StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { WebsiteToggle } from '.'

const WebsiteToggleDemo = {
  ...simpleComponentConfig,
  component: WebsiteToggle,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/WebsiteToggle'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof WebsiteToggle>> = {
  render: () => (
    <MockedProvider>
      <JourneyProvider>
        <EditorProvider>
          <WebsiteToggle />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export default WebsiteToggleDemo
