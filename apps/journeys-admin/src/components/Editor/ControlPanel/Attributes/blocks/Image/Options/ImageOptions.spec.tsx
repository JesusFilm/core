import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../../libs/context'
import { ImageOptions, IMAGE_BLOCK_UPDATE } from './ImageOptions'

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  locale: 'en-US',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: [],
  seoTitle: null,
  seoDescription: null
}

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: '',
  children: []
}

describe('ImageOptions', () => {
  it('updates image block', async () => {
    const imageBlockResult = jest.fn(() => ({
      data: {
        imageBlockUpdate: {
          id: image.id,
          src: image.src,
          alt: image.alt,
          __typename: 'ImageBlock',
          parentBlockId: image.parentBlockId,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: IMAGE_BLOCK_UPDATE,
              variables: {
                id: image.id,
                journeyId: journey.id,
                input: {
                  src: image.src,
                  alt: image.alt
                }
              }
            },
            result: imageBlockResult
          }
        ]}
      >
        <JourneyProvider value={journey}>
          <EditorProvider
            initialState={{
              selectedBlock: {
                ...image,
                src: 'https://example.com/image2.jpg'
              }
            }}
          >
            <ImageOptions />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: image.src }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
  })
})
