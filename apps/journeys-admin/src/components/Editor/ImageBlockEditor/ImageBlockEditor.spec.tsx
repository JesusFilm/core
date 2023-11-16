import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
// TODO: remove segmind ai flags when ready
import { SnackbarProvider } from 'notistack'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'

import { ImageBlockEditor } from '.'

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
      <FlagsProvider flags={{ segmind: true }}>
        <SnackbarProvider>
          <MockedProvider>
            <ImageBlockEditor onChange={jest.fn()} selectedBlock={imageBlock} />
          </MockedProvider>
        </SnackbarProvider>
      </FlagsProvider>
    )
    expect(getByText('Selected Image')).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Custom' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'AI' })).toBeInTheDocument()
  })

  it('should switch tabs', async () => {
    const { getByText, getByRole } = render(
      <FlagsProvider flags={{ segmind: true }}>
        <SnackbarProvider>
          <MockedProvider>
            <ImageBlockEditor onChange={jest.fn()} selectedBlock={imageBlock} />
          </MockedProvider>
        </SnackbarProvider>
      </FlagsProvider>
    )
    expect(getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
    expect(getByText('Unsplash')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    expect(getByText('Add image by URL')).toBeInTheDocument()
    await fireEvent.click(getByRole('tab', { name: 'AI' }))
    expect(getByRole('button', { name: 'Prompt' })).toBeInTheDocument()
  })
})
