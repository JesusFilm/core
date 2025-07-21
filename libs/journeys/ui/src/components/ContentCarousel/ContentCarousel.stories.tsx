import Stack from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent, waitFor } from 'storybook/test'
import { ComponentProps } from 'react'

import { journeyUiConfig } from '../../libs/journeyUiConfig'

import { ContentCarousel } from './ContentCarousel'

const ContentCarouselStory: Meta<typeof ContentCarousel> = {
  ...journeyUiConfig,
  component: ContentCarousel,
  title: 'Shared-Ui/ContentCarousel',
  parameters: {
    ...journeyUiConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof ContentCarousel>> = {
  render: ({ ...args }) => {
    return (
      <Stack
        sx={{ backgroundColor: 'background.paper', p: 10, overflow: 'hidden' }}
      >
        <ContentCarousel
          {...args}
          items={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => {
            return { id: `${number}`, title: `item ${number}` }
          })}
          renderItem={(itemProps) => (
            <Stack sx={{ border: '1px solid grey' }} data-testid="item">
              <Stack
                sx={{ width: 200, height: 200, backgroundColor: 'divider' }}
              />
              <Typography variant="subtitle2" align="center">
                {itemProps.item != null
                  ? itemProps.item.title
                  : 'custom placeholder'}
              </Typography>
            </Stack>
          )}
          breakpoints={
            args.breakpoints != null
              ? args.breakpoints
              : {
                  '0': {
                    slidesPerGroup: 1
                  }
                }
          }
        />
        <Typography sx={{ mt: 16 }}>
          This component takes any item and renders it in a carousel.
        </Typography>
        <Typography>
          It can also implement custom navigation at different breakpoints with
          the breakpoints prop.
        </Typography>
      </Stack>
    )
  }
}

export const Default = {
  ...Template,
  play: async () => {
    await waitFor(async () => {
      await userEvent.hover(screen.getByRole('group', { name: '1 / 12' }))
    })
  }
}

export const Loading = {
  ...Template,
  args: {
    loading: true,
    cardSpacing: 5
  }
}

export const Heading = {
  ...Default,
  args: {
    heading: 'Heading'
  }
}

export const Breakpoints = {
  ...Default,
  args: {
    cardSpacing: 5,
    breakpoints: {
      '0': {
        slidesPerGroup: 1,
        spaceBetween: 20
      },
      '600': {
        slidesPerGroup: 3,
        spaceBetween: 40
      },
      '1200': {
        slidesPerGroup: 5,
        spaceBetween: 40
      }
    }
  }
}

export default ContentCarouselStory
