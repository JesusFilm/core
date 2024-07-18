import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import { useOnClickOutside } from '.'

describe('useClickOutside', () => {
  const onClickOutside = jest
    .fn()
    .mockImplementation(async () => await Promise.resolve())

  const Content = (): ReactElement => {
    const inputRef = useOnClickOutside<HTMLParagraphElement>(onClickOutside)
    return (
      <h2 className="Mui-focused" ref={inputRef}>
        Content
      </h2>
    )
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  // E2E test needed to properly catch browser differences in rendering the ref element. See react issue.
  it('calls the callback when clicking on the editor canvas', () => {
    const { getByRole } = render(
      <div>
        <h1 className="EditorCanvas">Heading 1</h1>
        <h3 className="CanvasStack">Heading 1</h3>
        <iframe>
          <Content />
        </iframe>
      </div>
    )
    const heading = getByRole('heading', { level: 1 })
    const content = getByRole('heading', { level: 2 })
    const mobileHeading = getByRole('heading', { level: 3 })
    fireEvent.focus(content)
    expect(onClickOutside).not.toHaveBeenCalled()
    fireEvent.click(heading)
    expect(onClickOutside).toHaveBeenCalled()

    fireEvent.focus(content)
    fireEvent.click(mobileHeading)
    expect(onClickOutside).toHaveBeenCalledTimes(2)
  })

  it('does not call the callback when clicking somewhere not the editor canvas', () => {
    const { getByRole } = render(
      <div>
        <h1 className="NotEditorCanvas">Heading 1</h1>
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
    expect(onClickOutside).not.toHaveBeenCalled()
  })
})
