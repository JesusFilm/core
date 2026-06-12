import { render, screen } from '@testing-library/react'

import { AgentGenerateImageTool } from './GenerateImageTool'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

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
      result: [
        {
          url: 'https://example.com/generated-image.png',
          width: 256,
          height: 256
        }
      ]
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

      expect(screen.queryByText('Generating image...')).not.toBeInTheDocument()
    })

    it('should render multiple generated images when multiple results', () => {
      const multipleResultsPart = {
        ...resultPart,
        toolInvocation: {
          ...resultPart.toolInvocation,
          result: [
            { url: 'https://example.com/image1.png', width: 256, height: 256 },
            { url: 'https://example.com/image2.png', width: 256, height: 256 },
            { url: 'https://example.com/image3.png', width: 256, height: 256 }
          ]
        }
      }

      render(<AgentGenerateImageTool part={multipleResultsPart} />)

      const images = screen.getAllByTestId('generated-image')
      expect(images).toHaveLength(3)

      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.png')
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.png')
      expect(images[2]).toHaveAttribute('src', 'https://example.com/image3.png')

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
