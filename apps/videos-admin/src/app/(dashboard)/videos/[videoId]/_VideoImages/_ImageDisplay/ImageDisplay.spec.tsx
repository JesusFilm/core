import { fireEvent, render, screen } from '@testing-library/react'

import { ImageAspectRatio } from '../../../constants'

import { ImageDisplay } from './ImageDisplay'

// Mock the next/navigation useRouter hook
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush
  }))
}))

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, style, priority }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-testid="next-image"
      data-fill={fill ? 'true' : 'false'}
      data-priority={priority ? 'true' : 'false'}
      style={style}
    />
  )
}))

// Mock MUI icons
jest.mock('@core/shared/ui/icons/Edit2', () => ({
  __esModule: true,
  default: () => <span data-testid="edit-icon">Edit Icon</span>
}))

jest.mock('@core/shared/ui/icons/Upload1', () => ({
  __esModule: true,
  default: () => <span data-testid="upload-icon">Upload Icon</span>
}))

// Mock MUI components
jest.mock('@mui/material/Box', () => ({
  __esModule: true,
  default: ({ children, sx, ...props }: any) => (
    <div
      data-testid="mui-box"
      style={{
        aspectRatio: sx?.aspectRatio,
        backgroundColor: sx?.bgcolor,
        position: sx?.position,
        width: sx?.width,
        borderRadius: sx?.borderRadius,
        overflow: sx?.overflow
      }}
      {...props}
    >
      {children}
    </div>
  )
}))

jest.mock('@mui/material/Stack', () => ({
  __esModule: true,
  default: ({ children, sx, ...props }: any) => (
    <div
      data-testid="mui-stack"
      style={{
        height: sx?.height,
        width: sx?.width,
        justifyContent: sx?.justifyContent,
        alignItems: sx?.alignItems,
        position: sx?.position,
        top: sx?.top,
        right: sx?.right
      }}
      {...props}
    >
      {children}
    </div>
  )
}))

jest.mock('@mui/material/IconButton', () => ({
  __esModule: true,
  default: ({ children, onClick, ...props }: any) => (
    <button data-testid="mui-icon-button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@mui/material/Tooltip', () => ({
  __esModule: true,
  default: ({ children, title, ...props }: any) => (
    <div data-testid="mui-tooltip" aria-label={title} {...props}>
      {children}
    </div>
  )
}))

jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => (
    <div data-testid="mui-typography" {...props}>
      {children}
    </div>
  )
}))

describe('ImageDisplay', () => {
  const defaultProps = {
    title: 'Test Image',
    aspectRatio: ImageAspectRatio.banner,
    videoId: 'test-video-123'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the image when src is provided', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        src="https://example.com/image.jpg"
        alt="Test alt text"
      />
    )

    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    expect(image).toHaveAttribute('alt', 'Test alt text')
    expect(image).toHaveAttribute('data-fill', 'true')
    expect(image).toHaveAttribute('data-priority', 'true')
  })

  it('renders upload placeholder when src is not provided', () => {
    render(<ImageDisplay {...defaultProps} src={undefined} alt={undefined} />)

    expect(screen.getByTestId('upload-icon')).toBeInTheDocument()
    expect(screen.getByText('Upload Test Image')).toBeInTheDocument()
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument()
  })

  it('uses a default alt text if none is provided', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        src="https://example.com/image.jpg"
        alt={undefined}
      />
    )

    const image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('alt', 'video image')
  })

  it('navigates to the correct URL when edit button is clicked', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        src="https://example.com/image.jpg"
        alt="Test alt text"
      />
    )

    const editButton = screen.getByTestId('mui-icon-button')
    fireEvent.click(editButton)

    expect(mockPush).toHaveBeenCalledWith(
      '/videos/test-video-123/image/banner',
      { scroll: false }
    )
  })

  it('shows a tooltip with the correct title', () => {
    render(
      <ImageDisplay
        {...defaultProps}
        src="https://example.com/image.jpg"
        alt="Test alt text"
      />
    )

    const tooltip = screen.getByTestId('mui-tooltip')
    expect(tooltip).toHaveAttribute('aria-label', 'Change Test Image')
  })
})
