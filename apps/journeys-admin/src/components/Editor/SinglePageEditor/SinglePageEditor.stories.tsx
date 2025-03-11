import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'

import {
  ActiveContent,
  ActiveSlide,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { EDIT_TOOLBAR_HEIGHT } from '../constants'

import { SinglePageEditor } from './SinglePageEditor'

const SinglePageEditorStory = {
  component: SinglePageEditor,
  title: 'Journeys-Admin/Editor/SinglePageEditor',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof SinglePageEditor> = {
  render: () => {
    const journey = {
      __typename: 'Journey',
      id: 'journey-id',
      title: 'Journey Title',
      description: 'Journey Description',
      slug: 'journey-slug',
      createdAt: '2021-11-19T12:34:56.647Z',
      publishedAt: null,
      status: null,
      language: null,
      themeMode: null,
      themeName: null,
      blocks: []
    } as unknown as Journey

    return (
      <Box sx={{ height: '100vh' }}>
        {/* Mock toolbar space */}
        <Box sx={{ height: `${EDIT_TOOLBAR_HEIGHT}px`, bgcolor: 'grey.300' }} />
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas
            }}
          >
            <SinglePageEditor />
          </EditorProvider>
        </JourneyProvider>
      </Box>
    )
  }
}

export const Default = {
  ...Template
}

export default SinglePageEditorStory as Meta
