import { render, screen } from '@testing-library/react'

import { ScreenWrapper } from './ScreenWrapper'

describe('ScreenWrapper', () => {
  it('renders title and subtitle', () => {
    render(
      <ScreenWrapper title="Test Title" subtitle="Test Subtitle">
        <div>content</div>
      </ScreenWrapper>
    )

    expect(screen.getByTestId('ScreenWrapper')).toBeInTheDocument()
    expect(screen.getAllByText('Test Title')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Test Subtitle')[0]).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <ScreenWrapper title="Title" subtitle="Subtitle">
        <div data-testid="child">child content</div>
      </ScreenWrapper>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(
      <ScreenWrapper
        title="Title"
        subtitle="Subtitle"
        footer={<div data-testid="footer">footer content</div>}
      >
        <div>content</div>
      </ScreenWrapper>
    )

    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('does not render footer when not provided', () => {
    render(
      <ScreenWrapper title="Title" subtitle="Subtitle">
        <div>content</div>
      </ScreenWrapper>
    )

    expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
  })

  it('renders mobileTitle when provided', () => {
    render(
      <ScreenWrapper
        title="Desktop Title"
        mobileTitle="Mobile Title"
        subtitle="Subtitle"
      >
        <div>content</div>
      </ScreenWrapper>
    )

    expect(screen.getByText('Desktop Title')).toBeInTheDocument()
    expect(screen.getByText('Mobile Title')).toBeInTheDocument()
  })

  it('falls back to title when mobileTitle is not provided', () => {
    render(
      <ScreenWrapper title="Shared Title" subtitle="Subtitle">
        <div>content</div>
      </ScreenWrapper>
    )

    const titleElements = screen.getAllByText('Shared Title')
    expect(titleElements).toHaveLength(2)
  })

  it('renders mobileSubtitle when provided', () => {
    render(
      <ScreenWrapper
        title="Title"
        subtitle="Desktop Subtitle"
        mobileSubtitle="Mobile Subtitle"
      >
        <div>content</div>
      </ScreenWrapper>
    )

    expect(screen.getByText('Desktop Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Mobile Subtitle')).toBeInTheDocument()
  })

  it('falls back to subtitle when mobileSubtitle is not provided', () => {
    render(
      <ScreenWrapper title="Title" subtitle="Shared Subtitle">
        <div>content</div>
      </ScreenWrapper>
    )

    const subtitleElements = screen.getAllByText('Shared Subtitle')
    expect(subtitleElements).toHaveLength(2)
  })
})
