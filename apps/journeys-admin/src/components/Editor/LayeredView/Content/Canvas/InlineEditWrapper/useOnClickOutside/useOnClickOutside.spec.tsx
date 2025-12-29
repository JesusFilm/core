import { fireEvent, render } from '@testing-library/react'
import { ReactElement, RefObject } from 'react'

import { useOnClickOutside } from '.'

describe('useClickOutside', () => {
  const onClickOutside = jest
    .fn()
    .mockImplementation(async () => await Promise.resolve())

  const Content = (): ReactElement => {
    const inputRef = useOnClickOutside<HTMLParagraphElement>(onClickOutside)
    // forcing type cast until next 15
    return (
      <h2
        className="Mui-focused"
        ref={inputRef as RefObject<HTMLParagraphElement>}
      >
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

  it('calls the callback when clicking on the editor canvas on mobile', () => {
    const { getByRole } = render(
      <div>
        <h1 className="CanvasStack">Heading 1</h1>
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
