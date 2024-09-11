import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import pick from 'lodash/pick'
import { v4 as uuidv4 } from 'uuid'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  LogoBlockCreate_imageBlockCreate as ImageBlock,
  LogoBlockCreate,
  LogoBlockCreateVariables
} from '../../../../../../../../__generated__/LogoBlockCreate'
import { createCloudflareUploadByUrlMock } from '../../../Drawer/ImageBlockEditor/CustomImage/CustomUrl/data'
import { listUnsplashCollectionPhotosMock } from '../../../Drawer/ImageBlockEditor/UnsplashGallery/data'

import { LOGO_BLOCK_CREATE } from './Logo'

import { Logo } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('Logo', () => {
  let originalEnv

  beforeEach(() => {
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const defaultJourney = {
    id: 'journeyId',
    __typename: 'Journey',
    logoImageBlock: null
  } as unknown as Journey

  it('should create logo image block', async () => {
    mockUuidv4.mockReturnValueOnce('logoImageBlockId')
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journeyId']: {
        blocks: [],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const imageBlock: ImageBlock = {
      __typename: 'ImageBlock',
      id: 'logoImageBlockId',
      parentBlockId: null,
      src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
      alt: 'public',
      scale: 1,
      parentOrder: null,
      width: 1,
      height: 1,
      blurhash: ''
    }

    const logoBlockCreateMock: MockedResponse<
      LogoBlockCreate,
      LogoBlockCreateVariables
    > = {
      request: {
        query: LOGO_BLOCK_CREATE,
        variables: {
          id: defaultJourney.id,
          imageBlockCreateInput: {
            ...pick(imageBlock, ['id', 'parentBlockId', 'src', 'alt', 'scale']),
            journeyId: defaultJourney.id
          },
          journeyUpdateInput: {
            logoImageBlockId: 'logoImageBlockId'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          imageBlockCreate: imageBlock,
          journeyUpdate: {
            __typename: 'Journey',
            id: defaultJourney.id,
            logoImageBlock: {
              id: 'logoImageBlockId',
              __typename: 'ImageBlock'
            }
          }
        }
      }))
    }

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          logoBlockCreateMock
        ]}
      >
        <JourneyProvider value={{ journey: defaultJourney }}>
          <CommandProvider>
            <Logo />
          </CommandProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Logo' }))
    await waitFor(() => fireEvent.click(screen.getByTestId('card click area')))
    await waitFor(() => fireEvent.click(screen.getByTestId('Image3Icon')))
    await waitFor(() => fireEvent.click(screen.getByTestId('CustomURL')))
    const textBox = screen
      .getByTestId('JourneysAdminTextFieldForm')
      .querySelector('input') as HTMLInputElement
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(logoBlockCreateMock.result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'ImageBlock:logoImageBlockId' }
    ])
  })

  it('should undo logo image block create', async () => {})

  it('should update logo image', async () => {})

  it('should undo logo image update', async () => {})

  it('should delete logo image block', async () => {})

  it('should undo logo image block delete', async () => {})

  it('should update logo scale', async () => {})

  it('should undo logo scale update', async () => {})
})
