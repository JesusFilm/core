import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { userEvent } from 'storybook/test'

import { VideoBlockSource } from '../../../__generated__/globalTypes'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { VIDEO_START_EVENT_CREATE } from '../VideoEvents/VideoEvents'

import { Video } from '.'

const Demo: Meta<typeof Video> = {
  ...journeyUiConfig,
  component: Video,
  title: 'Journeys-Ui/Video',
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const emptyVideo: Omit<ComponentProps<typeof Video>, 'source'> = {
  __typename: 'VideoBlock',
  id: 'video1.id',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  autoplay: false,
  muted: false,
  videoId: null,
  videoVariantLanguageId: null,
  title: null,
  description: null,
  duration: null,
  image: null,
  mediaVideo: null,
  startAt: null,
  endAt: null,
  posterBlockId: null,
  fullsize: null,
  action: null,
  objectFit: null,
  children: []
}

const startVideoMock = {
  request: {
    query: VIDEO_START_EVENT_CREATE,
    variables: {
      id: 'uuid',
      blockId: 'video0.id',
      position: 30
    }
  },
  result: {
    data: {
      id: 'uuid'
    }
  }
}

const Template: StoryObj<typeof Video> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={[startVideoMock]}>
      <Box
        sx={{
          position: 'relative',
          minHeight: 'inherit',
          height: '100%'
        }}
      >
        <Video {...args} />
      </Box>
    </MockedProvider>
  )
}

export const Default = { ...Template, args: { ...emptyVideo } }

export const Arclight = {
  ...Template,
  args: {
    ...Default.args,
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    video: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'VideoTitle',
          value: 'FallingPlates'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      }
    }
  }
}

export const Youtube = {
  ...Template,
  args: {
    ...Default.args,
    source: VideoBlockSource.youTube,
    videoId: 'F7k5pqBVinA'
  }
}

export const Autoplay = {
  ...Template,
  args: {
    ...Arclight.args,
    autoplay: true
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export const Muted = {
  ...Template,
  args: {
    ...Arclight.args,
    muted: true
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export const StartAndEndAt = {
  ...Template,
  args: {
    ...Arclight.args,
    startAt: 20,
    endAt: 60
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export const Poster = {
  ...Template,
  args: {
    ...Arclight.args,
    posterBlockId: 'posterBlockId',
    children: [
      {
        id: 'posterBlockId',
        __typename: 'ImageBlock',
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'random image from unsplash',
        width: 1600,
        height: 1067,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
        parentBlockId: 'videoBlockId',
        parentOrder: 0,
        children: []
      }
    ]
  }
}

export const WithSettingsMenuOpen = {
  ...Template,
  args: {
    ...Arclight.args
  },
  play: async ({
    canvasElement,
    step
  }: {
    canvasElement: HTMLElement
    step: (name: string, play: () => Promise<void>) => Promise<void>
  }) => {
    await step('Wait for video player to initialize', async () => {
      const videoEl = canvasElement.querySelector('.video-js')
      if (videoEl) {
        await userEvent.click(videoEl)
      }
    })

    await step('Click settings button', async () => {
      const desktopControls = canvasElement.querySelector(
        '[data-testid="desktop-controls"]'
      )
      if (desktopControls) {
        const buttons = desktopControls.querySelectorAll('button')

        if (buttons.length >= 2) {
          const settingsButton = buttons[buttons.length - 2]
          await userEvent.click(settingsButton)
          return
        }
      }
    })
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the video with the settings menu open for quality selection.'
      }
    }
  }
}

export const WithQualityMenuOpen = {
  ...Template,
  args: {
    ...Arclight.args
  },
  play: async ({
    canvasElement,
    step
  }: {
    canvasElement: HTMLElement
    step: (name: string, play: () => Promise<void>) => Promise<void>
  }) => {
    await step('Wait for video player to initialize', async () => {
      const videoEl = canvasElement.querySelector('.video-js')
      if (videoEl) {
        await userEvent.click(videoEl)
      }
    })

    await step('Click settings button', async () => {
      const desktopControls = canvasElement.querySelector(
        '[data-testid="desktop-controls"]'
      )
      if (desktopControls) {
        const buttons = desktopControls.querySelectorAll('button')
        if (buttons.length >= 2) {
          const settingsButton = buttons[buttons.length - 2]
          await userEvent.click(settingsButton)
        }
      }
    })

    await step('Click on Quality option', async () => {
      const settingsMenu = document.getElementById('settings-menu')
      if (settingsMenu) {
        const menuItems = settingsMenu.querySelectorAll('li')

        if (menuItems.length > 0) {
          await userEvent.click(menuItems[0])
        }
      }
    })
  },
  parameters: {
    chromatic: { disableSnapshot: false },
    docs: {
      description: {
        story: 'Shows the video with the quality selection menu open.'
      }
    }
  }
}

export default Demo
