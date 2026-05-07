import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'

import { GET_MY_CLOUDFLARE_IMAGES } from '../MyCloudflareImagesGrid'

import { CustomImage } from '.'

describe('CustomImage', () => {
  const imageBlock: ImageBlock = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0,
    scale: null,
    focalLeft: 50,
    focalTop: 50,
    customizable: null
  }

  const myImagesMock: MockedResponse = {
    request: {
      query: GET_MY_CLOUDFLARE_IMAGES,
      variables: { offset: 0, limit: 9, isAi: false }
    },
    result: {
      data: {
        getMyCloudflareImages: [
          {
            __typename: 'CloudflareImage',
            id: 'a',
            url: 'https://imagedelivery.net/key/a',
            blurhash: null
          }
        ]
      }
    }
  }

  it('should render custom url image upload', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <CustomImage onChange={jest.fn()} selectedBlock={imageBlock} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    expect(getByText('Paste URL of image...')).toBeInTheDocument()
  })

  it('should not render the uploads grid when mediaLibrary flag is off', async () => {
    render(
      <MockedProvider mocks={[myImagesMock]}>
        <FlagsProvider flags={{ mediaLibrary: false }}>
          <CustomImage onChange={jest.fn()} selectedBlock={imageBlock} />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(screen.queryByText('Your uploads')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('MyCloudflareImagesGrid')
    ).not.toBeInTheDocument()
  })

  it('should render the uploads grid when mediaLibrary flag is on', async () => {
    render(
      <MockedProvider mocks={[myImagesMock]}>
        <FlagsProvider flags={{ mediaLibrary: true }}>
          <CustomImage onChange={jest.fn()} selectedBlock={imageBlock} />
        </FlagsProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Your uploads')).toBeInTheDocument()
    })
    expect(screen.getByTestId('MyCloudflareImagesGrid')).toBeInTheDocument()
  })
})
