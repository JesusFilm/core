import { render, screen } from '@testing-library/react'

import { AgentGenerateImageTool } from './GenerateImageTool'

// Mock next-i18next following the established pattern
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockedImage({ src, alt, width, height }: any) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        data-testid="generated-image"
      />
    )
  }
})

describe('AgentGenerateImageTool', () => {
  const callPart = {
    type: 'tool-invocation' as const,
    toolInvocation: {
      toolCallId: 'test-id',
      toolName: 'agentGenerateImage',
      args: { prompt: 'test prompt' },
      state: 'call' as const
    }
  }

  const resultPart = {
    type: 'tool-invocation' as const,
    toolInvocation: {
      toolCallId: 'test-id',
      toolName: 'agentGenerateImage',
      args: { prompt: 'test prompt' },
      state: 'result' as const,
      result: [{ src: 'https://example.com/generated-image.png' }]
    }
  }

  const unknownPart = {
    type: 'tool-invocation' as const,
    toolInvocation: {
      toolCallId: 'test-id',
      toolName: 'agentGenerateImage',
      args: { prompt: 'test prompt' },
      state: 'unknown' as any
    }
  }

  describe('Call State', () => {
    it('should render generating message when state is call', () => {
      render(<AgentGenerateImageTool part={callPart} />)

      expect(screen.getByText('Generating image...')).toBeInTheDocument()

      // Should not render any images in call state
      expect(screen.queryByTestId('generated-image')).not.toBeInTheDocument()
    })
  })

  describe('Result State', () => {
    it('should render single generated image when state is result', () => {
      render(<AgentGenerateImageTool part={resultPart} />)

      const image = screen.getByTestId('generated-image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute(
        'src',
        'https://example.com/generated-image.png'
      )
      expect(image).toHaveAttribute('alt', 'Generated image')
      expect(image).toHaveAttribute('width', '256')
      expect(image).toHaveAttribute('height', '256')

      // Should not render generating message in result state
      expect(screen.queryByText('Generating image...')).not.toBeInTheDocument()
    })

    it('should render multiple generated images when multiple results', () => {
      const multipleResultsPart = {
        ...resultPart,
        toolInvocation: {
          ...resultPart.toolInvocation,
          result: [
            { src: 'https://example.com/image1.png' },
            { src: 'https://example.com/image2.png' },
            { src: 'https://example.com/image3.png' }
          ]
        }
      }

      render(<AgentGenerateImageTool part={multipleResultsPart} />)

      const images = screen.getAllByTestId('generated-image')
      expect(images).toHaveLength(3)

      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.png')
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.png')
      expect(images[2]).toHaveAttribute('src', 'https://example.com/image3.png')

      // All images should have consistent attributes
      images.forEach((image) => {
        expect(image).toHaveAttribute('alt', 'Generated image')
        expect(image).toHaveAttribute('width', '256')
        expect(image).toHaveAttribute('height', '256')
      })
    })

    it('should handle empty result array', () => {
      const emptyResultPart = {
        ...resultPart,
        toolInvocation: {
          ...resultPart.toolInvocation,
          result: []
        }
      }

      render(<AgentGenerateImageTool part={emptyResultPart} />)

      expect(screen.queryByTestId('generated-image')).not.toBeInTheDocument()
      expect(screen.queryByText('Generating image...')).not.toBeInTheDocument()
    })
  })

  describe('Default State', () => {
    it('should return null for unknown state', () => {
      const { container } = render(
        <AgentGenerateImageTool part={unknownPart} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
