// div, heading, iframe, paragraph
import { ReactElement } from 'react'
import { render, fireEvent } from '@testing-library/react'
import { useOnClickOutside } from '.'

describe('useClickOutside', () => {
  const onClickOutside = jest
    .fn()
    .mockImplementation(async () => await Promise.resolve())

  const Content = (): ReactElement => {
    const inputRef = useOnClickOutside<HTMLParagraphElement>(onClickOutside)
    return <h2 ref={inputRef}>Content</h2>
  }

  // E2E test needed to properly catch browser differences in rendering the ref element. See react issue.
  it('calls the callback when clicking outside the ref element', () => {
    const { getByRole } = render(
      <div>
        <h1>Heading 1</h1>
        <iframe>
          <Content />
        </iframe>
      </div>
    )
    const heading = getByRole('heading', { level: 1 })
    const content = getByRole('heading', { level: 2 })
    fireEvent.focus(content)
    expect(onClickOutside).not.toHaveBeenCalled()
    fireEvent.click(heading)
    expect(onClickOutside).toHaveBeenCalled()
  })
})
