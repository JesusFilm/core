import { render } from '@testing-library/react'

import type { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'

import { ExpandedCover } from '.'

describe('ExpandedCover', () => {
  const children = <p>How did we get here?</p>

  const blurUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='

  const imageBlock: TreeBlock<ImageFields> = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    children: []
  }

  it('should render children', () => {
    const { getByText } = render(<ExpandedCover>{children}</ExpandedCover>)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render background image', () => {
    const { getByTestId } = render(
      <ExpandedCover imageBlock={imageBlock} backgroundBlur={blurUrl}>
        {children}
      </ExpandedCover>
    )
    expect(getByTestId('CardExpandedImageCover')).toHaveStyle(
      `background-image: url(${blurUrl})`
    )
    expect(getByTestId('CardExpandedImageCover')).toHaveAccessibleName(
      imageBlock.alt
    )
  })
})
