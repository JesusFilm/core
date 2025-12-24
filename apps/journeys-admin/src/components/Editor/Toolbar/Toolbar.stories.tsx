import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'

import { Toolbar } from '.'

const Demo: Meta<typeof Toolbar> = {
  ...journeysAdminConfig,
  component: Toolbar,
  title: 'Journeys-Admin/Editor/Toolbar'
}

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: null,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1649866725673-16dc15de5c29?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1009&q=80',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: '',
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const Template: StoryObj<
  ComponentProps<typeof Toolbar> & { primaryImageBlock: ImageBlock }
> = {
  render: ({ primaryImageBlock }) => {
    return (
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              title: 'My awesome journey',
              description: 'My awesome journey description',
              status: JourneyStatus.published,
              primaryImageBlock,
              tags: []
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <Stack direction="row">
              <Toolbar />
            </Stack>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template
}

export const WithJourneyImage = {
  ...Template,
  args: {
    primaryImageBlock: image
  }
}

export default Demo
