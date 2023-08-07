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
  it('calls the callback when clicking on swiper container', () => {
    const { getByRole } = render(
      <div>
        <h1 className="swiper-container">Heading 1</h1>
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

  it('calls the callback when clicking on swiper-wrapper', () => {
    const { getByRole } = render(
      <div>
        <h1 className="swiper-wrapper">Heading 1</h1>
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
