import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

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
      <MockedProvider>
        <ImageBlockEditor onChange={jest.fn()} selectedBlock={imageBlock} />
      </MockedProvider>
    )
    expect(getByText('Selected Image')).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Custom' })).toBeInTheDocument()
  })

  it('should switch tabs', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <ImageBlockEditor onChange={jest.fn()} selectedBlock={imageBlock} />
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Gallery' })).toBeInTheDocument()
    expect(getByText('Unsplash')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    expect(getByText('Add image by URL')).toBeInTheDocument()
  })
})
