import type { TreeBlock } from '@core/journeys/ui/block'
import { fireEvent, render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../../__generated__/GetJourney'
import { BackgroundMediaImage } from './BackgroundMediaImage'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children: []
}

describe('BackgroundMediaImage', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('opens the image library', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <BackgroundMediaImage cardBlock={card} />
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    expect(getByTestId('ImageLibrary')).toBeInTheDocument()
  })

  // TODO: Add relevant tests back in once unplash and cloudflare functionality is in

  // it('creates a new image cover block', async () => {
  //   const cache = new InMemoryCache()
  //   cache.restore({
  //     ['Journey:' + journey.id]: {
  //       blocks: [{ __ref: `CardBlock:${card.id}` }],
  //       id: journey.id,
  //       __typename: 'Journey'
  //     },
  //     [`CardBlock:${card.id}`]: { ...card }
  //   })
  //   const imageBlockResult = jest.fn(() => ({
  //     data: {
  //       imageBlockCreate: image
  //     }
  //   }))
  //   const { getByRole } = render(
  //     <MockedProvider
  //       cache={cache}
  //       mocks={[
  //         {
  //           request: {
  //             query: CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE,
  //             variables: {
  //               input: {
  //                 journeyId: journey.id,
  //                 parentBlockId: card.id,
  //                 src: image.src,
  //                 alt: image.alt,
  //                 isCover: true
  //               }
  //             }
  //           },
  //           result: imageBlockResult
  //         }
  //       ]}
  //     >
  //       <JourneyProvider value={{ journey, admin: true }}>
  //         <SnackbarProvider>
  //           <BackgroundMediaImage cardBlock={card} />
  //         </SnackbarProvider>
  //       </JourneyProvider>
  //     </MockedProvider>
  //   )
  //   const textBox = await getByRole('textbox')
  //   fireEvent.change(textBox, {
  //     target: { value: image.src }
  //   })
  //   fireEvent.blur(textBox)
  //   await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
  //   expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
  //     { __ref: `CardBlock:${card.id}` },
  //     { __ref: `ImageBlock:${image.id}` }
  //   ])
  //   expect(cache.extract()[`CardBlock:${card.id}`]?.coverBlockId).toEqual(
  //     image.id
  //   )
  // })

  // it('replaces a video cover block', async () => {
  //   const videoCard: TreeBlock<CardBlock> = {
  //     ...card,
  //     coverBlockId: video.id,
  //     children: [video]
  //   }
  //   const cache = new InMemoryCache()
  //   cache.restore({
  //     ['Journey:' + journey.id]: {
  //       blocks: [
  //         { __ref: `CardBlock:${card.id}` },
  //         { __ref: `VideoBlock:${video.id}` }
  //       ],
  //       id: journey.id,
  //       __typename: 'Journey'
  //     },
  //     [`CardBlock:${card.id}`]: { ...card, coverBlockId: video.id }
  //   })
  //   const imageBlockResult = jest.fn(() => ({
  //     data: {
  //       imageBlockCreate: {
  //         id: image.id,
  //         src: image.src,
  //         alt: image.alt,
  //         __typename: 'ImageBlock',
  //         parentBlockId: card.id,
  //         width: image.width,
  //         height: image.height,
  //         parentOrder: image.parentOrder,
  //         blurhash: image.blurhash
  //       }
  //     }
  //   }))
  //   const { getByRole } = render(
  //     <MockedProvider
  //       cache={cache}
  //       mocks={[
  //         {
  //           request: {
  //             query: CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE,
  //             variables: {
  //               input: {
  //                 journeyId: journey.id,
  //                 parentBlockId: card.id,
  //                 src: image.src,
  //                 alt: image.alt,
  //                 isCover: true
  //               }
  //             }
  //           },
  //           result: imageBlockResult
  //         }
  //       ]}
  //     >
  //       <JourneyProvider value={{ journey, admin: true }}>
  //         <SnackbarProvider>
  //           <BackgroundMediaImage cardBlock={videoCard} />
  //         </SnackbarProvider>
  //       </JourneyProvider>
  //     </MockedProvider>
  //   )
  //   const textBox = await getByRole('textbox')
  //   fireEvent.change(textBox, {
  //     target: { value: image.src }
  //   })
  //   fireEvent.blur(textBox)
  //   await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
  //   expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
  //     { __ref: `CardBlock:${card.id}` },
  //     { __ref: `VideoBlock:${video.id}` },
  //     { __ref: `ImageBlock:${image.id}` }
  //   ])
  //   expect(cache.extract()[`CardBlock:${card.id}`]?.coverBlockId).toEqual(
  //     image.id
  //   )
  // })

  // describe('Existing image cover', () => {
  //   const existingCoverBlock: TreeBlock<CardBlock> = {
  //     ...card,
  //     coverBlockId: image.id,
  //     children: [
  //       {
  //         ...image,
  //         src: 'https://example.com/image2.jpg',
  //         alt: 'https://example.com/image2.jpg'
  //       }
  //     ]
  //   }

  //   it('updates image cover block', async () => {
  //     const cache = new InMemoryCache()
  //     cache.restore({
  //       ['Journey:' + journey.id]: {
  //         blocks: [
  //           { __ref: `CardBlock:${card.id}` },
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
  //           parentBlockId: card.id,
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
  //               query: CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE,
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
  //           <SnackbarProvider>
  //             <BackgroundMediaImage cardBlock={existingCoverBlock} />
  //           </SnackbarProvider>
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //     const textBox = await getByRole('textbox')
  //     fireEvent.change(textBox, {
  //       target: { value: image.src }
  //     })
  //     fireEvent.blur(textBox)
  //     await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
  //     await waitFor(() => expect(textBox).toHaveValue(image.src))
  //     expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
  //       { __ref: `CardBlock:${card.id}` },
  //       { __ref: `ImageBlock:${image.id}` }
  //     ])
  //   })

  //   it('shows loading icon', async () => {
  //     const { getByRole } = render(
  //       <MockedProvider mocks={[]}>
  //         <JourneyProvider value={{ journey, admin: true }}>
  //           <SnackbarProvider>
  //             <BackgroundMediaImage cardBlock={existingCoverBlock} />
  //           </SnackbarProvider>
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //     const textbox = getByRole('textbox')
  //     fireEvent.change(textbox, {
  //       target: { value: image.src }
  //     })
  //     fireEvent.blur(textbox)
  //     await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())
  //   })

  //   it('deletes an image block', async () => {
  //     const cache = new InMemoryCache()
  //     cache.restore({
  //       ['Journey:' + journey.id]: {
  //         blocks: [
  //           { __ref: `CardBlock:${card.id}` },
  //           { __ref: `ImageBlock:${image.id}` }
  //         ],
  //         id: journey.id,
  //         __typename: 'Journey'
  //       },
  //       ['ImageBlock:' + image.id]: { ...image }
  //     })
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
  //               query: BLOCK_DELETE_FOR_BACKGROUND_IMAGE,
  //               variables: {
  //                 id: image.id,
  //                 parentBlockId: card.parentBlockId,
  //                 journeyId: journey.id
  //               }
  //             },
  //             result: blockDeleteResult
  //           }
  //         ]}
  //       >
  //         <JourneyProvider value={{ journey, admin: true }}>
  //           <SnackbarProvider>
  //             <BackgroundMediaImage cardBlock={existingCoverBlock} />
  //           </SnackbarProvider>
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //     const button = await getByTestId('imageBlockHeaderDelete')
  //     fireEvent.click(button)
  //     await waitFor(() => expect(blockDeleteResult).toHaveBeenCalled())
  //     expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
  //       { __ref: `CardBlock:${card.id}` }
  //     ])
  //     expect(cache.extract()['ImageBlock:' + image.id]).toBeUndefined()
  //   })
  // })
})
