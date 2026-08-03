import { RenderResult, fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import { ThemeProvider } from '../../../../../../ThemeProvider'

import { VideoDescription } from './VideoDescription'

// The admin theme is what makes the assertions below meaningful: its spacing
// unit is 4 (so `mt: 3` is 12px, not MUI's default 24px) and it maps the
// caption variant onto an inline span, which is the mapping `component="p"`
// exists to override. Rendering bare would measure a theme the app never uses.
function renderWithTheme(ui: ReactElement): RenderResult {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

const LONG_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.'

describe('VideoDescription', () => {
  it('should elongate and truncate the text when the More and Less button is clicked', async () => {
    const { getByRole } = renderWithTheme(
      <VideoDescription videoDescription={LONG_DESCRIPTION} />
    )

    fireEvent.click(getByRole('button', { name: 'More' }))
    expect(getByRole('button', { name: 'Less' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Less' }))
    expect(getByRole('button', { name: 'More' })).toBeInTheDocument()
  })

  it('should not render More button on short text', async () => {
    const videoDescription =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    const { queryByRole } = renderWithTheme(
      <VideoDescription videoDescription={videoDescription} />
    )

    expect(queryByRole('button', { name: 'More' })).not.toBeInTheDocument()
  })

  it('should render each paragraph in its own element', () => {
    const videoDescription =
      'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'

    const { getAllByRole, getByText } = renderWithTheme(
      <VideoDescription videoDescription={videoDescription} />
    )

    // The paragraph role only matches block <p> elements, so this also pins
    // `component="p"` — without it the theme renders inline spans and this
    // query returns nothing.
    expect(getAllByRole('paragraph')).toHaveLength(3)
    expect(getByText('First paragraph.')).toBeInTheDocument()
    expect(getByText('Third paragraph.')).toBeInTheDocument()
  })

  it('should space paragraphs by a tightened gap rather than a blank line', () => {
    const videoDescription =
      'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.'

    const { getAllByRole } = renderWithTheme(
      <VideoDescription videoDescription={videoDescription} />
    )

    const [first, second, third] = getAllByRole('paragraph')
    // 12px against the theme's 18px caption leading — a clear break, well
    // short of the full blank line the pre-line rendering used to produce.
    expect(first).toHaveStyle('margin-top: 0px')
    expect(second).toHaveStyle('margin-top: 12px')
    expect(third).toHaveStyle('margin-top: 12px')
  })

  it('should break unbreakable text rather than overflow the drawer', () => {
    const videoDescription =
      'Watch the complete film in your own language at https://www.jesusfilm.org/watch/jesus.html/english.html?utm_source=youtube&utm_campaign=description'

    const { getAllByRole } = renderWithTheme(
      <VideoDescription videoDescription={videoDescription} />
    )

    // A URL has no spaces, so the browser treats it as one unbreakable word.
    // Without this it runs past the 328px drawer and gives the settings panel
    // a horizontal scrollbar — measured at +19px in Chromium and +33px in
    // WebKit. Firefox breaks URLs at slashes on its own and is unaffected.
    expect(getAllByRole('paragraph')[0]).toHaveStyle('overflow-wrap: anywhere')
  })

  it('should clamp the collapsed description to three lines', () => {
    const { getAllByRole } = renderWithTheme(
      <VideoDescription videoDescription={LONG_DESCRIPTION} />
    )

    const clamp = getAllByRole('paragraph')[0].parentElement as HTMLElement

    expect(clamp).toHaveStyle('display: -webkit-box')
    expect(clamp).toHaveStyle('overflow: hidden')
    // A line count, not a pixel height — a fixed height drifts whenever the
    // line height changes and clips mid-glyph.
    expect(getComputedStyle(clamp).getPropertyValue('-webkit-line-clamp')).toBe(
      '3'
    )
  })

  it('should remove the clamp when expanded', () => {
    const { getAllByRole, getByRole } = renderWithTheme(
      <VideoDescription videoDescription={LONG_DESCRIPTION} />
    )

    const clamp = getAllByRole('paragraph')[0].parentElement as HTMLElement

    fireEvent.click(getByRole('button', { name: 'More' }))

    expect(clamp).not.toHaveStyle('display: -webkit-box')
    expect(getComputedStyle(clamp).getPropertyValue('-webkit-line-clamp')).toBe(
      ''
    )
  })

  it('should align the toggle label flush with the description text', () => {
    const { getByRole } = renderWithTheme(
      <VideoDescription videoDescription={LONG_DESCRIPTION} />
    )

    const toggle = getByRole('button', { name: 'More' })

    // MUI centres a label inside a 64px minimum box; all three together are
    // what put the label on the same left edge as the text and language chip.
    expect(toggle).toHaveStyle('min-width: 0')
    expect(toggle).toHaveStyle('justify-content: flex-start')
    expect(toggle).toHaveStyle('margin-left: -5px')
  })

  it('should split paragraphs on carriage return entities', () => {
    const videoDescription = 'First paragraph.&#13;&#13;Second paragraph.'

    const { getByText } = renderWithTheme(
      <VideoDescription videoDescription={videoDescription} />
    )

    expect(getByText('First paragraph.')).toBeInTheDocument()
    expect(getByText('Second paragraph.')).toBeInTheDocument()
  })

  it('should preserve single line breaks within a paragraph', () => {
    const videoDescription = 'Line one.\nLine two.\n\nSecond paragraph.'

    const { getAllByRole } = renderWithTheme(
      <VideoDescription videoDescription={videoDescription} />
    )

    // Asserted on textContent, not a text query — Testing Library normalises
    // whitespace, so a matcher would pass whether the newline survived or not.
    const [first, second] = getAllByRole('paragraph')
    expect(first.textContent).toBe('Line one.\nLine two.')
    expect(second.textContent).toBe('Second paragraph.')
  })

  it('should not render empty paragraphs', () => {
    const videoDescription =
      '\n\nFirst paragraph.\n\n\n\n   \n\nSecond paragraph.\n\n'

    const { getAllByRole } = renderWithTheme(
      <VideoDescription videoDescription={videoDescription} />
    )

    expect(getAllByRole('paragraph')).toHaveLength(2)
  })

  it('should render the toggle outside the description text', async () => {
    const videoDescription =
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.\n\nNascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.'

    const { getAllByRole, getByRole } = renderWithTheme(
      <VideoDescription videoDescription={videoDescription} />
    )

    fireEvent.click(getByRole('button', { name: 'More' }))

    // Inline inside the text is what pushed the label off the shared left edge.
    for (const paragraph of getAllByRole('paragraph')) {
      expect(paragraph).not.toContainElement(
        getByRole('button', { name: 'Less' })
      )
    }
  })

  it('should render nothing for an empty description', () => {
    const { queryAllByRole, queryByRole } = renderWithTheme(
      <VideoDescription videoDescription="" />
    )

    expect(queryAllByRole('paragraph')).toHaveLength(0)
    expect(queryByRole('button')).not.toBeInTheDocument()
  })
})
