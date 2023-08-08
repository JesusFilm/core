import { render } from '@testing-library/react'

import type { TreeBlock } from '../../libs/block'
import { blurImage } from '../../libs/blurImage'

import { ImageFields } from './__generated__/ImageFields'

import { Image } from '.'

jest.mock('../../libs/blurImage', () => ({
  __esModule: true,
  blurImage: jest.fn()
}))

describe('Image', () => {
  beforeEach(() => {
    const blurImageMock = blurImage as jest.Mock
    blurImageMock.mockReturnValue(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='
    )
  })

  const block: TreeBlock<ImageFields> = {
    __typename: 'ImageBlock',
    id: 'image0.id',
    src: 'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    width: 1600,
    height: 1067,
    alt: 'random image from unsplash',
    parentBlockId: 'Image1',
    parentOrder: 0,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    children: []
  }

  it('should have correct props', () => {
    const { getByRole } = render(<Image {...block} alt={block.alt} />)
    expect(getByRole('img')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )

    expect(blurImage).toHaveBeenCalledWith(block.blurhash, '#fff')
  })

  it('should render the default image', () => {
    const { getByTestId } = render(
      <Image {...block} src={null} alt="defaultImage" />
    )
    expect(getByTestId('ImageRoundedIcon')).toHaveClass('MuiSvgIcon-root')
  })
})
