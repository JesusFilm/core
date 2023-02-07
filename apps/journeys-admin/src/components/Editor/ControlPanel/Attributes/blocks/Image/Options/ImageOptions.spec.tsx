import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { ImageOptions, IMAGE_BLOCK_UPDATE } from './ImageOptions'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    bcp47: 'en',
    iso3: 'eng',
    id: '529',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
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
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
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
        <JourneyProvider value={{ journey, admin: true }}>
          <SnackbarProvider>
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
          </SnackbarProvider>
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

  it('shows loading icon', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey, admin: true }}>
          <SnackbarProvider>
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
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    const textbox = getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: image.src }
    })
    fireEvent.blur(textbox)
    await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())
  })
})
