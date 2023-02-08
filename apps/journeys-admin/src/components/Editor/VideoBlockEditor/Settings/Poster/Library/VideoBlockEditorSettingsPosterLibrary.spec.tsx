import { MockedProvider } from '@apollo/client/testing'
import type { TreeBlock } from '@core/journeys/ui/block'
import { render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { VideoBlockSource } from '../../../../../../../__generated__/globalTypes'

import {
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../../__generated__/GetJourney'

import { VideoBlockEditorSettingsPosterLibrary } from './VideoBlockEditorSettingsPosterLibrary'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'Translation',
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
  },
  posterBlockId: null,
  children: []
}

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: video.id,
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

const onClose = jest.fn()

describe('VideoBlockEditorSettingsPosterLibrary', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('opens the image library', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <VideoBlockEditorSettingsPosterLibrary
          selectedBlock={image}
          parentBlockId={video.id}
          onClose={onClose}
          open
        />
      </MockedProvider>
    )
    expect(getByTestId('ImageLibrary')).toBeInTheDocument()
  })

  // TODO: Add relevant tests back in once unplash and cloudflare functionality is in

  // describe('No existing Image', () => {
  //   it('creates a new image poster block', async () => {
  //     const cache = new InMemoryCache()
  //     cache.restore({
  //       ['Journey:' + journey.id]: {
  //         blocks: [{ __ref: `VideoBlock:${video.id}` }],
  //         id: journey.id,
  //         __typename: 'Journey'
  //       }
  //     })
  //     const videoBlockResult = jest.fn(() => ({
  //       data: {
  //         videoBlockUpdate: {
  //           id: video.id,
  //           posterBlockId: image.id,
  //           __typename: 'VideoBlock'
  //         }
  //       }
  //     }))
  //     const imageBlockResult = jest.fn(() => ({
  //       data: {
  //         imageBlockCreate: {
  //           id: image.id,
  //           src: image.src,
  //           alt: image.alt,
  //           __typename: 'ImageBlock',
  //           parentBlockId: video.id,
  //           width: image.width,
  //           height: image.height,
  //           parentOrder: image.parentOrder,
  //           blurhash: image.blurhash
  //         }
  //       }
  //     }))
  //     const { getByRole } = render(
  //       <MockedProvider
  //         cache={cache}
  //         mocks={[
  //           {
  //             request: {
  //               query: POSTER_IMAGE_BLOCK_CREATE,
  //               variables: {
  //                 input: {
  //                   journeyId: journey.id,
  //                   parentBlockId: video.id,
  //                   src: image.src,
  //                   alt: image.alt
  //                 }
  //               }
  //             },
  //             result: imageBlockResult
  //           },
  //           {
  //             request: {
  //               query: VIDEO_BLOCK_POSTER_IMAGE_UPDATE,
  //               variables: {
  //                 id: video.id,
  //                 journeyId: journey.id,
  //                 input: {
  //                   posterBlockId: image.id
  //                 }
  //               }
  //             },
  //             result: videoBlockResult
  //           }
  //         ]}
  //       >
  //         <JourneyProvider value={{ journey, admin: true }}>
  //           <VideoBlockEditorSettingsPosterLibrary
  //             selectedBlock={null}
  //             parentBlockId={video.id}
  //             onClose={onClose}
  //             open
  //           />
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //     const textBox = getByRole('textbox')
  //     fireEvent.change(textBox, {
  //       target: { value: image.src }
  //     })
  //     fireEvent.blur(textBox)
  //     await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())
  //     await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
  //     await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
  //     expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
  //       { __ref: `VideoBlock:${video.id}` },
  //       { __ref: `ImageBlock:${image.id}` }
  //     ])
  //   })
  // })
  // describe('Existing image poster', () => {
  //   const existingImageBlock: ImageBlock = {
  //     ...image,
  //     src: 'https://example.com/image2.jpg',
  //     alt: 'https://example.com/image2.jpg'
  //   }

  //   it('updates image cover block', async () => {
  //     const cache = new InMemoryCache()
  //     cache.restore({
  //       ['Journey:' + journey.id]: {
  //         blocks: [
  //           { __ref: `VideoBlock:${video.id}` },
  //           { __ref: `ImageBlock:${image.id}` }
  //         ],
  //         id: journey.id,
  //         __typename: 'Journey'
  //       }
  //     })
  //     const imageBlockResult = jest.fn(() => ({
  //       data: {
  //         imageBlockUpdate: {
  //           id: image.id,
  //           src: image.src,
  //           alt: image.alt,
  //           __typename: 'ImageBlock',
  //           parentBlockId: video.id,
  //           width: image.width,
  //           height: image.height,
  //           parentOrder: image.parentOrder,
  //           blurhash: image.blurhash
  //         }
  //       }
  //     }))
  //     const { getByRole } = render(
  //       <MockedProvider
  //         cache={cache}
  //         mocks={[
  //           {
  //             request: {
  //               query: POSTER_IMAGE_BLOCK_UPDATE,
  //               variables: {
  //                 id: image.id,
  //                 journeyId: journey.id,
  //                 input: {
  //                   src: image.src,
  //                   alt: image.alt
  //                 }
  //               }
  //             },
  //             result: imageBlockResult
  //           }
  //         ]}
  //       >
  //         <JourneyProvider value={{ journey, admin: true }}>
  //           <VideoBlockEditorSettingsPosterLibrary
  //             selectedBlock={existingImageBlock}
  //             parentBlockId={video.id}
  //             onClose={onClose}
  //             open
  //           />
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //     const textBox = getByRole('textbox')
  //     fireEvent.change(textBox, {
  //       target: { value: image.src }
  //     })
  //     fireEvent.blur(textBox)
  //     await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())
  //     await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
  //     await waitFor(() => expect(textBox).toHaveValue(image.src))
  //     expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
  //       { __ref: `VideoBlock:${video.id}` },
  //       { __ref: `ImageBlock:${image.id}` }
  //     ])
  //   })
  //   it('deletes an image block', async () => {
  //     const cache = new InMemoryCache()
  //     cache.restore({
  //       ['Journey:' + journey.id]: {
  //         blocks: [
  //           { __ref: `VideoBlock:${video.id}` },
  //           { __ref: `ImageBlock:${image.id}` }
  //         ],
  //         id: journey.id,
  //         __typename: 'Journey'
  //       }
  //     })
  //     const videoBlockResult = jest.fn(() => ({
  //       data: {
  //         videoBlockUpdate: {
  //           id: video.id,
  //           posterBlockId: null,
  //           __typename: 'CardBlock'
  //         }
  //       }
  //     }))
  //     const blockDeleteResult = jest.fn(() => ({
  //       data: {
  //         blockDelete: []
  //       }
  //     }))
  //     const { getByTestId } = render(
  //       <MockedProvider
  //         cache={cache}
  //         mocks={[
  //           {
  //             request: {
  //               query: BLOCK_DELETE_FOR_POSTER_IMAGE,
  //               variables: {
  //                 id: image.id,
  //                 parentBlockId: image.parentBlockId,
  //                 journeyId: journey.id
  //               }
  //             },
  //             result: blockDeleteResult
  //           },
  //           {
  //             request: {
  //               query: VIDEO_BLOCK_POSTER_IMAGE_UPDATE,
  //               variables: {
  //                 id: video.id,
  //                 journeyId: journey.id,
  //                 input: {
  //                   posterBlockId: null
  //                 }
  //               }
  //             },
  //             result: videoBlockResult
  //           }
  //         ]}
  //       >
  //         <JourneyProvider value={{ journey, admin: true }}>
  //           <VideoBlockEditorSettingsPosterLibrary
  //             selectedBlock={image}
  //             parentBlockId={video.id}
  //             onClose={onClose}
  //             open
  //           />
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //     const button = getByTestId('imageBlockHeaderDelete')
  //     fireEvent.click(button)
  //     await waitFor(() => expect(blockDeleteResult).toHaveBeenCalled())
  //     await waitFor(() => expect(videoBlockResult).toHaveBeenCalled())
  //     expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
  //       { __ref: `VideoBlock:${video.id}` }
  //     ])
  //   })
  // })
})
