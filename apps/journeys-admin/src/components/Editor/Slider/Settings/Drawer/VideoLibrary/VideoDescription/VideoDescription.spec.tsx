import { fireEvent, render } from '@testing-library/react'

import { VideoDescription } from './VideoDescription'

describe('VideoDescription', () => {
  it('should elongate and truncate the text when the More and Less button is clicked', async () => {
    const videoDescription =
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.'

    const { getByRole } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    fireEvent.click(getByRole('button', { name: 'More' }))
    expect(getByRole('button', { name: 'Less' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Less' }))
    expect(getByRole('button', { name: 'More' })).toBeInTheDocument()
  })

  it('should not render More button on short text', async () => {
    const videoDescription =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    const { queryByRole } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    expect(queryByRole('button', { name: 'More' })).not.toBeInTheDocument()
  })

  it('should render each paragraph in its own element', () => {
    const videoDescription =
      'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'

    const { getByText } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    // Separate elements are what make the paragraph gap tunable — a single
    // pre-line block can only ever render a full blank line between them.
    expect(getByText('First paragraph.')).not.toBe(
      getByText('Second paragraph.')
    )
    expect(getByText('Third paragraph.')).toBeInTheDocument()
  })

  it('should split paragraphs on carriage return entities', () => {
    const videoDescription = 'First paragraph.&#13;&#13;Second paragraph.'

    const { getByText } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    expect(getByText('First paragraph.')).toBeInTheDocument()
    expect(getByText('Second paragraph.')).toBeInTheDocument()
  })

  it('should preserve single line breaks within a paragraph', () => {
    const videoDescription = 'Line one.\nLine two.\n\nSecond paragraph.'

    const { getByText } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    // Both lines stay in one paragraph element — only blank lines start a new one.
    expect(getByText('Line one. Line two.')).toBeInTheDocument()
    expect(getByText('Second paragraph.')).toBeInTheDocument()
  })

  it('should not render empty paragraphs', () => {
    const videoDescription =
      '\n\nFirst paragraph.\n\n\n\n   \n\nSecond paragraph.\n\n'

    const { getAllByTestId } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    expect(getAllByTestId('VideoDescriptionParagraph')).toHaveLength(2)
  })

  it('should render the toggle outside the description text', async () => {
    const videoDescription =
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.\n\nNascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.'

    const { getByRole, getByText } = render(
      <VideoDescription videoDescription={videoDescription} />
    )

    fireEvent.click(getByRole('button', { name: 'More' }))

    // Inline inside the text is what pushed the label off the shared left edge.
    expect(
      getByText(
        'Nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.'
      )
    ).not.toContainElement(getByRole('button', { name: 'Less' }))
  })

  it('should render nothing for an empty description', () => {
    const { queryAllByTestId, queryByRole } = render(
      <VideoDescription videoDescription="" />
    )

    expect(queryAllByTestId('VideoDescriptionParagraph')).toHaveLength(0)
    expect(queryByRole('button')).not.toBeInTheDocument()
  })
})
