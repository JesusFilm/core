import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, NextRouter } from 'next/router'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { DoneScreen } from './DoneScreen'
import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../__generated__/BlockFields'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DoneScreen', () => {
  let push: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    push = jest.fn()

    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)
  })

  it('renders the completion message', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <DoneScreen />
      </JourneyProvider>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Ready!'
    )
  })

  it('renders journey preview card with title and description', () => {
    const journeyWithContent = {
      ...journey,
      seoTitle: 'Test Journey Title',
      seoDescription: 'This is a test journey description for testing purposes',
      displayTitle: 'Display Title'
    }

    render(
      <JourneyProvider
        value={{ journey: journeyWithContent, variant: 'admin' }}
      >
        <DoneScreen />
      </JourneyProvider>
    )

    expect(screen.getByText('Test Journey Title')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This is a test journey description for testing purposes'
      )
    ).toBeInTheDocument()
  })

  it('renders GridEmptyIcon when no primary image is available', () => {
    const journeyWithoutImage = {
      ...journey,
      primaryImageBlock: null
    }

    render(
      <JourneyProvider
        value={{ journey: journeyWithoutImage, variant: 'admin' }}
      >
        <DoneScreen />
      </JourneyProvider>
    )

    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })

  it('renders journey image when primary image is available', async () => {
    const journeyWithImage = {
      ...journey,
      primaryImageBlock: {
        __typename: 'ImageBlock' as const,
        id: 'image-block-id',
        src: 'https://example.com/test-image.jpg',
        alt: 'Test Image Alt',
        width: 300,
        height: 200,
        parentBlockId: null,
        parentOrder: 0,
        blurhash: 'test-blurhash',
        scale: 1,
        focalTop: null,
        focalLeft: null
      } satisfies ImageBlock
    }

    render(
      <JourneyProvider value={{ journey: journeyWithImage, variant: 'admin' }}>
        <DoneScreen />
      </JourneyProvider>
    )

    await waitFor(() => {
      const image = screen.getByRole('img', { name: 'Test Image Alt' })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg')
    })
  })

  it('renders all action buttons', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <DoneScreen />
      </JourneyProvider>
    )

    expect(screen.getByTestId('DoneScreenPreviewButton')).toBeInTheDocument()
    expect(
      screen.getByTestId('DoneScreenContinueEditingButton')
    ).toBeInTheDocument()
  })

  it('renders preview button as link when journey has slug', () => {
    const journeyWithSlug = {
      ...journey,
      slug: 'test-journey-slug'
    }

    render(
      <JourneyProvider value={{ journey: journeyWithSlug, variant: 'admin' }}>
        <DoneScreen />
      </JourneyProvider>
    )

    const previewButton = screen.getByTestId('DoneScreenPreviewButton')
    expect(previewButton).toHaveAttribute(
      'href',
      '/api/preview?slug=test-journey-slug'
    )
    expect(previewButton).toHaveAttribute('target', '_blank')
  })

  it('navigates to journey edit page when continue editing is clicked', () => {
    const journeyWithId = {
      ...journey,
      id: 'test-journey-id'
    }

    render(
      <JourneyProvider value={{ journey: journeyWithId, variant: 'admin' }}>
        <DoneScreen />
      </JourneyProvider>
    )

    const continueEditingButton = screen.getByRole('button', {
      name: 'Continue Editing'
    })
    fireEvent.click(continueEditingButton)

    expect(push).toHaveBeenCalledWith('/journeys/test-journey-id')
  })

  it('does not navigate when journey has no id', () => {
    const journeyWithoutId = {
      ...journey,
      id: null
    } as any

    render(
      <JourneyProvider value={{ journey: journeyWithoutId, variant: 'admin' }}>
        <DoneScreen />
      </JourneyProvider>
    )

    const continueEditingButton = screen.getByRole('button', {
      name: 'Continue Editing'
    })
    fireEvent.click(continueEditingButton)

    expect(push).not.toHaveBeenCalled()
  })
})
