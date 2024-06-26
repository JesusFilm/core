import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'

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
    parentOrder: 0
  }

  it('should render the ImageBlockEditor', () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ImageBlockEditor onChange={jest.fn()} selectedBlock={imageBlock} />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Selected Image')).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Custom' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'AI' })).toBeInTheDocument()
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

    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ImageBlockEditor onChange={jest.fn()} selectedBlock={imageBlock} />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
    await waitFor(() => expect(getByText('Unsplash')).toBeInTheDocument())
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'custom-image' }
        },
        undefined,
        { shallow: true }
      )
    })

    expect(getByText('Add image by URL')).toBeInTheDocument()
    await fireEvent.click(getByRole('tab', { name: 'AI' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Prompt' })).toBeInTheDocument()
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

    fireEvent.click(getByRole('tab', { name: 'Gallery' }))
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
})
