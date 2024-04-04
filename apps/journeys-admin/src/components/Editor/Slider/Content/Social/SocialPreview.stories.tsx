import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { ActiveSlide, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { journey } from '../../Settings/GoalDetails/data'

import { Message } from './Message/Message'
import { Post } from './Post/Post'
import { SocialPreview } from './SocialPreview'

const SocialPreviewStory: Meta<typeof SocialPreview> = {
  ...journeysAdminConfig,
  component: SocialPreview,
  title: 'Journeys-Admin/Editor/Slider/Content/Social/SocialPreview'
}

const filledJourney = {
  title: 'Where did Jesus body go',
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
    journey: {
      ...journey
    }
  }
}

export const Filled = {
  ...Template,
  args: {
    ...filledJourney
  }
}

export const MessageMobile = {
  render: (args) => (
    <JourneyProvider value={{ journey: args.filledJourney, variant: 'admin' }}>
      <Box
        data-testid="SocialPreview"
        width="100%"
        height="100%"
        alignItems="center"
        display="flex"
      >
        <Swiper
          modules={[Pagination]}
          id="social-swiper"
          slidesPerView={1}
          centeredSlides
          slideToClickedSlide
          pagination={{ clickable: true }}
          spaceBetween={80}
          initialSlide={1}
        >
          <SwiperSlide
            key={0}
            style={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Post />
          </SwiperSlide>
          <SwiperSlide
            key={1}
            style={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Message />
          </SwiperSlide>
        </Swiper>
      </Box>
    </JourneyProvider>
  )
}

export default SocialPreviewStory
