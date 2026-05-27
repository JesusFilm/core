import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey as baseJourneyMock } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_logoImageBlock as LogoImageBlock
} from '../../../../../../../../__generated__/GetJourney'
import { useImageUpload } from '../../../../../../../libs/useImageUpload'

import { LOGO_IMAGE_BLOCK_UPDATE, LogoSection } from './LogoSection'

const useImageUploadModule = await vi.importActual<
  typeof import('../../../../../../../libs/useImageUpload')
>('../../../../../../../libs/useImageUpload')

const mockedUseImageUpload = vi.mocked(useImageUpload)

vi.mock('@core/shared/ui/NextImage', async () => ({
  NextImage: vi.fn(({ src, alt }) => <img src={src} alt={alt} />)
}))

vi.mock('../../../../../../../libs/useImageUpload', async () => {
  const actual = (await vi.importActual('../../../../../../../libs/useImageUpload'))
  return {
    __esModule: true,
    ...actual,
    useImageUpload: vi.fn((...args: unknown[]) =>
      (
        actual as { useImageUpload: (...args: unknown[]) => unknown }
      ).useImageUpload(...args)
    )
  }
})

const mockEnqueueSnackbar = vi.fn()
vi.mock('notistack', async () => ({
  ...(await vi.importActual('notistack')),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

const logoImageBlock: LogoImageBlock = {
  __typename: 'ImageBlock',
  id: 'logo-block-id',
  parentBlockId: null,
  parentOrder: null,
  src: 'https://example.com/logo.png',
  alt: 'Logo',
  width: 100,
  height: 100,
  blurhash: '',
  scale: null,
  focalTop: null,
  focalLeft: null,
  customizable: true
}

const journeyWithLogo = {
  ...baseJourneyMock,
  logoImageBlock
} as unknown as Journey

const journeyWithoutLogoSrc = {
  ...baseJourneyMock,
  logoImageBlock: { ...logoImageBlock, src: null }
} as unknown as Journey

describe('LogoSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockedUseImageUpload.mockImplementation((...args) =>
      useImageUploadModule.useImageUpload(...args)
    )
  })

  function renderLogoSection(
    journeyData: Journey = journeyWithLogo,
    mocks: MockedResponse[] = []
  ): ReturnType<typeof render> {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: journeyData, variant: 'admin' }}>
            <LogoSection />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }

  it('renders with LogoSection data-testid visible', () => {
    renderLogoSection()
    expect(screen.getByTestId('LogoSection')).toBeInTheDocument()
  })

  it('renders Logo heading', () => {
    renderLogoSection()
    expect(screen.getByText('Logo')).toBeInTheDocument()
  })

  it('renders logo image when src is provided', () => {
    renderLogoSection()
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://example.com/logo.png')
    expect(image).toHaveAttribute('alt', 'Logo')
  })

  it('renders placeholder icon when logo src is null', () => {
    renderLogoSection(journeyWithoutLogoSrc)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })

  it('renders Upload File button', () => {
    renderLogoSection()
    expect(
      screen.getByRole('button', { name: 'Upload File' })
    ).toBeInTheDocument()
  })

  it('renders supported file types text', () => {
    renderLogoSection()
    expect(
      screen.getByText('Supports JPG, PNG, and GIF files.')
    ).toBeInTheDocument()
  })

  it('renders file input with correct test id', () => {
    renderLogoSection()
    expect(screen.getByTestId('LogoSection-file-input')).toBeInTheDocument()
  })

  it('calls open when Upload File button is clicked', () => {
    const open = vi.fn()
    mockedUseImageUpload.mockReturnValue({
      getRootProps: vi.fn(),
      getInputProps: vi.fn().mockReturnValue({}),
      open,
      loading: false
    } as any)

    renderLogoSection()

    fireEvent.click(screen.getByRole('button', { name: 'Upload File' }))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner and disables button during upload', () => {
    mockedUseImageUpload.mockReturnValue({
      getRootProps: vi.fn(),
      getInputProps: vi.fn().mockReturnValue({}),
      open: vi.fn(),
      loading: true
    } as any)

    renderLogoSection()

    expect(
      screen.getByTestId('LogoSection-upload-progress')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload File' })).toBeDisabled()
  })

  it('does not show loading spinner when not uploading', () => {
    renderLogoSection()
    expect(
      screen.queryByTestId('LogoSection-upload-progress')
    ).not.toBeInTheDocument()
  })

  it('calls imageBlockUpdate mutation on upload complete', async () => {
    let onUploadCompleteCallback: (url: string) => void = vi.fn()
    mockedUseImageUpload.mockImplementation((options) => {
      onUploadCompleteCallback = options.onUploadComplete
      return {
        getRootProps: vi.fn(),
        getInputProps: vi.fn().mockReturnValue({}),
        open: vi.fn(),
        loading: false
      } as any
    })

    const mutationResultSpy = vi.fn().mockReturnValue({
      data: {
        imageBlockUpdate: {
          id: 'logo-block-id',
          src: 'https://example.com/new-logo.png',
          alt: 'Logo',
          blurhash: '',
          width: 100,
          height: 100,
          scale: 100,
          focalTop: 50,
          focalLeft: 50
        }
      }
    })

    const mutationMock: MockedResponse = {
      request: {
        query: LOGO_IMAGE_BLOCK_UPDATE,
        variables: {
          id: 'logo-block-id',
          input: {
            src: 'https://example.com/new-logo.png',
            scale: 100,
            focalLeft: 50,
            focalTop: 50
          }
        }
      },
      result: mutationResultSpy
    }

    renderLogoSection(journeyWithLogo, [mutationMock])

    onUploadCompleteCallback('https://example.com/new-logo.png')

    await waitFor(() => {
      expect(mutationResultSpy).toHaveBeenCalled()
    })
  })

  it('shows error snackbar when mutation fails', async () => {
    let onUploadCompleteCallback: (url: string) => void = vi.fn()
    mockedUseImageUpload.mockImplementation((options) => {
      onUploadCompleteCallback = options.onUploadComplete
      return {
        getRootProps: vi.fn(),
        getInputProps: vi.fn().mockReturnValue({}),
        open: vi.fn(),
        loading: false
      } as any
    })

    const mutationMock: MockedResponse = {
      request: {
        query: LOGO_IMAGE_BLOCK_UPDATE,
        variables: {
          id: 'logo-block-id',
          input: {
            src: 'https://example.com/new-logo.png',
            scale: 100,
            focalLeft: 50,
            focalTop: 50
          }
        }
      },
      error: new Error('Network error')
    }

    renderLogoSection(journeyWithLogo, [mutationMock])

    onUploadCompleteCallback('https://example.com/new-logo.png')

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Upload failed. Please try again',
        { variant: 'error', autoHideDuration: 2000 }
      )
    })
  })

  it('does not call mutation when logoImageBlock is null', () => {
    let onUploadCompleteCallback: (url: string) => void = vi.fn()
    const mutationSpy = vi.fn()

    mockedUseImageUpload.mockImplementation((options) => {
      onUploadCompleteCallback = options.onUploadComplete
      return {
        getRootProps: vi.fn(),
        getInputProps: vi.fn().mockReturnValue({}),
        open: vi.fn(),
        loading: false
      } as any
    })

    const journeyNoLogo = {
      ...baseJourneyMock,
      logoImageBlock: null
    } as unknown as Journey

    const mutationMock: MockedResponse = {
      request: {
        query: LOGO_IMAGE_BLOCK_UPDATE,
        variables: {
          id: '',
          input: {
            src: 'https://example.com/new-logo.png',
            scale: 100,
            focalLeft: 50,
            focalTop: 50
          }
        }
      },
      result: mutationSpy
    }

    renderLogoSection(journeyNoLogo, [mutationMock])

    onUploadCompleteCallback('https://example.com/new-logo.png')
    expect(mutationSpy).not.toHaveBeenCalled()
  })
})
