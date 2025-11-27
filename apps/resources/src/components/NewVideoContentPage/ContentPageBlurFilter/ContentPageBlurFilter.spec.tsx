import { render, screen } from '@testing-library/react'

import { ContentPageBlurFilter } from './ContentPageBlurFilter'

const TEST_CONTENT = 'Test content'
const TEST_CONTENT_TEXT = 'This is test content'
const FIRST_CHILD_TEXT = 'First child'
const SECOND_CHILD_TEXT = 'Second child'
const THIRD_CHILD_TEXT = 'Third child'

describe('ContentPageBlurFilter', () => {
  it('should render the main content page container', () => {
    render(
      <ContentPageBlurFilter>
        <div>{TEST_CONTENT}</div>
      </ContentPageBlurFilter>
    )

    const contentPage = screen.getByTestId('ContentPage')
    expect(contentPage).toBeInTheDocument()
  })

  it('should render the blur filter overlay', () => {
    render(
      <ContentPageBlurFilter>
        <div>{TEST_CONTENT}</div>
      </ContentPageBlurFilter>
    )

    const blurFilter = screen.getByTestId('ContentPageBlurFilter')
    expect(blurFilter).toBeInTheDocument()
  })

  it('should render the content container', () => {
    render(
      <ContentPageBlurFilter>
        <div>{TEST_CONTENT}</div>
      </ContentPageBlurFilter>
    )

    const contentContainer = screen.getByTestId('ContentPageContainer')
    expect(contentContainer).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <ContentPageBlurFilter>
        <div>{TEST_CONTENT_TEXT}</div>
      </ContentPageBlurFilter>
    )

    expect(screen.getByText(TEST_CONTENT_TEXT)).toBeInTheDocument()
  })

  it('should apply correct styling to main container', () => {
    render(
      <ContentPageBlurFilter>
        <div>{TEST_CONTENT}</div>
      </ContentPageBlurFilter>
    )

    const contentPage = screen.getByTestId('ContentPage')
    expect(contentPage).toHaveClass(
      'bg-[#131111]',
      'text-white',
      'relative',
      'font-sans'
    )
    expect(contentPage).toHaveStyle({ minHeight: '100svh' })
  })

  it('should apply correct styling to blur filter', () => {
    render(
      <ContentPageBlurFilter>
        <div>{TEST_CONTENT}</div>
      </ContentPageBlurFilter>
    )

    const blurFilter = screen.getByTestId('ContentPageBlurFilter')
    expect(blurFilter).toHaveClass(
      'max-w-[1920px]',
      'z-[1]',
      'mx-auto',
      'sticky',
      'h-screen',
      'top-0',
      'bg-black/10'
    )
    const style = blurFilter.style
    expect(style['backdropFilter']).toBe('brightness(.6) blur(40px)')
  })

  it('should apply correct styling to content container', () => {
    render(
      <ContentPageBlurFilter>
        <div>{TEST_CONTENT}</div>
      </ContentPageBlurFilter>
    )

    const contentContainer = screen.getByTestId('ContentPageContainer')
    expect(contentContainer).toHaveClass('max-w-[1920px]', 'mx-auto')
    expect(contentContainer).toHaveStyle({ marginTop: '-100vh' })
  })

  it('should render multiple children correctly', () => {
    render(
      <ContentPageBlurFilter>
        <div data-testid="child-1">{FIRST_CHILD_TEXT}</div>
        <div data-testid="child-2">{SECOND_CHILD_TEXT}</div>
        <span data-testid="child-3">{THIRD_CHILD_TEXT}</span>
      </ContentPageBlurFilter>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
    expect(screen.getByText(FIRST_CHILD_TEXT)).toBeInTheDocument()
    expect(screen.getByText(SECOND_CHILD_TEXT)).toBeInTheDocument()
    expect(screen.getByText(THIRD_CHILD_TEXT)).toBeInTheDocument()
  })
})
