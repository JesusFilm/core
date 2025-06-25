import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'

import {
  listUnsplashCollectionPhotosMock,
  triggerUnsplashDownloadMock
} from './UnsplashGallery/data'

import { ImageBlockEditor } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ImageBlockEditor', () => {
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
    focalTop: 50
  }

  it('should render the ImageBlockEditor', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ImageBlockEditor onChange={jest.fn()} selectedBlock={imageBlock} />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByText('Selected Image')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Custom' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'AI' })).toBeInTheDocument()
  })

  it('should switch tabs', async () => {
    const push = jest.fn()
    const on = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ImageBlockEditor onChange={jest.fn()} selectedBlock={imageBlock} />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('Unsplash')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'custom-image' }
        },
        undefined,
        { shallow: true }
      )
    })

    expect(screen.getByText('Add image by URL')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('tab', { name: 'AI' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Prompt' })).toBeInTheDocument()
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'ai-image' }
        },
        undefined,
        { shallow: true }
      )
    })

    fireEvent.click(screen.getByRole('tab', { name: 'Gallery' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'unsplash-image' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should render the UnsplashGallery', async () => {
    const handleChange = jest.fn()
    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            listUnsplashCollectionPhotosMock,
            triggerUnsplashDownloadMock
          ]}
        >
          <ImageBlockEditor onChange={handleChange} selectedBlock={null} />
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'white dome building during daytime' })
    )
    await waitFor(() =>
      expect(handleChange).toHaveBeenCalledWith({
        alt: 'white dome building during daytime',
        blurhash: 'LEA,%vRjE1ay.AV@WAj@tnoef5ju',
        height: 720,
        src: 'https://images.unsplash.com/photo-1618777618311-92f986a6519d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
        width: 1080,
        scale: 100,
        focalLeft: 50,
        focalTop: 50
      })
    )
  })
})
