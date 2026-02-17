import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey as baseJourneyMock } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_logoImageBlock as LogoImageBlock
} from '../../../../../../../../__generated__/GetJourney'
// eslint-disable-next-line import/no-namespace
import * as useImageUploadHooks from '../../../../../../../libs/useImageUpload'

import { LOGO_IMAGE_BLOCK_UPDATE, LogoSection } from './LogoSection'

jest.mock('next-i18next', () => ({
  __esModule: true,
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('@core/shared/ui/NextImage', () => ({
  NextImage: jest.fn(({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ))
}))

jest.mock('../../../../../../../libs/useImageUpload', () => ({
  __esModule: true,
  ...jest.requireActual('../../../../../../../libs/useImageUpload')
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
    jest.restoreAllMocks()
  })

  function renderLogoSection(
    journeyData: Journey = journeyWithLogo,
    mocks: MockedResponse[] = []
  ): ReturnType<typeof render> {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <JourneyProvider value={{ journey: journeyData, variant: 'admin' }}>
          <LogoSection />
        </JourneyProvider>
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
    const open = jest.fn()
    jest.spyOn(useImageUploadHooks, 'useImageUpload').mockReturnValue({
      getRootProps: jest.fn(),
      getInputProps: jest.fn().mockReturnValue({}),
      open,
      loading: false
    } as any)

    renderLogoSection()

    fireEvent.click(screen.getByRole('button', { name: 'Upload File' }))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner and disables button during upload', () => {
    jest.spyOn(useImageUploadHooks, 'useImageUpload').mockReturnValue({
      getRootProps: jest.fn(),
      getInputProps: jest.fn().mockReturnValue({}),
      open: jest.fn(),
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
    let onUploadCompleteCallback: (url: string) => void = jest.fn()
    jest
      .spyOn(useImageUploadHooks, 'useImageUpload')
      .mockImplementation((options) => {
        onUploadCompleteCallback = options.onUploadComplete
        return {
          getRootProps: jest.fn(),
          getInputProps: jest.fn().mockReturnValue({}),
          open: jest.fn(),
          loading: false
        } as any
      })

    const mutationMock: MockedResponse = {
      request: {
        query: LOGO_IMAGE_BLOCK_UPDATE,
        variables: {
          id: 'logo-block-id',
          input: { src: 'https://example.com/new-logo.png', scale: 100, focalLeft: 50, focalTop: 50 }
        }
      },
      result: {
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
      }
    }

    renderLogoSection(journeyWithLogo, [mutationMock])

    onUploadCompleteCallback('https://example.com/new-logo.png')

    await waitFor(() => {
      expect(mutationMock.result).toBeDefined()
    })
  })

  it('does not call mutation when logoImageBlock is null', () => {
    let onUploadCompleteCallback: (url: string) => void = jest.fn()
    const mutationSpy = jest.fn()

    jest
      .spyOn(useImageUploadHooks, 'useImageUpload')
      .mockImplementation((options) => {
        onUploadCompleteCallback = options.onUploadComplete
        return {
          getRootProps: jest.fn(),
          getInputProps: jest.fn().mockReturnValue({}),
          open: jest.fn(),
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
          input: { src: 'https://example.com/new-logo.png', scale: 100, focalLeft: 50, focalTop: 50 }
        }
      },
      result: mutationSpy
    }

    renderLogoSection(journeyNoLogo, [mutationMock])

    onUploadCompleteCallback('https://example.com/new-logo.png')
    expect(mutationSpy).not.toHaveBeenCalled()
  })
})
