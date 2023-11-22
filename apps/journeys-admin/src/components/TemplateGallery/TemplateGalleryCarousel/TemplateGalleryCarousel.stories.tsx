import Stack from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../../libs/storybook'

import { TemplateGalleryCarousel } from './TemplateGalleryCarousel'

const TemplateGalleryCarouselStory: Meta<typeof TemplateGalleryCarousel> = {
  ...journeysAdminConfig,
  component: TemplateGalleryCarousel,
  title: 'Journeys-Admin/TemplateGalleryCarousel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof TemplateGalleryCarousel>> = {
  render: ({ ...args }) => {
    return (
      <Stack
        sx={{ backgroundColor: 'background.paper', p: 10, overflow: 'hidden' }}
      >
        <TemplateGalleryCarousel
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
    loadingBreakpoints: 5
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

export default TemplateGalleryCarouselStory
