import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { ActiveSlide, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'

import { SocialPreview } from './SocialPreview'

const SocialPreviewStory: Meta<typeof SocialPreview> = {
  ...journeysAdminConfig,
  component: SocialPreview,
  title: 'Journeys-Admin/Editor/Slider/Content/Social/SocialPreview'
}

type Story = StoryObj<
  ComponentProps<typeof SocialPreview> & { journey: Journey }
>

const Template: Story = {
  render: (args) => (
    <Box
      overflow="Hidden"
      alignItems="flex-start"
      position="relative"
      maxHeight={500}
    >
      <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
        <EditorProvider
          initialState={{
            activeSlide: ActiveSlide.Content
          }}
        >
          <SocialPreview />
        </EditorProvider>
      </JourneyProvider>
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {}
  }
}

export const Filled = {
  ...Template,
  args: {
    journey: {
      seoTitle: 'Where did Jesus body go',
      seoDescription: 'This is a descripion that fills up the area used.',
      describe: 'This is a description',
      seoLink: 'a',
      slug: 'exampleLinkExtension',
      primaryImageBlock: {
        id: 'image1.id',
        __typename: 'ImageBlock',
        parentBlockId: null,
        parentOrder: 0,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'random image from unsplash',
        width: 1920,
        height: 1080,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
      }
    }
  }
}

export default SocialPreviewStory
