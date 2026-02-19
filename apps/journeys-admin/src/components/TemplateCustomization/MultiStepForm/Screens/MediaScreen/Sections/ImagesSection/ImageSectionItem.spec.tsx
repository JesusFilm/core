import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'
import {
  ImageUploadErrorCode,
  useImageUpload
} from '../../../../../../../libs/useImageUpload'

import { ImageSectionItem } from './ImageSectionItem'

jest.mock('next-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

jest.mock('@core/shared/ui/NextImage', () => ({
  NextImage: jest.fn(({ src, alt, placeholder, blurDataURL }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-placeholder={placeholder}
      data-blurdataurl={blurDataURL}
    />
  ))
}))

jest.mock('../../../../../../../libs/useImageUpload')
const mockUseImageUpload = jest.mocked(useImageUpload)

const defaultMockReturn = {
  getRootProps: jest.fn(),
  getInputProps: jest.fn(),
  open: jest.fn(),
  isDragActive: false,
  isDragAccept: false,
  isDragReject: false,
  loading: false,
  success: undefined,
  errorCode: undefined,
  errorMessage: undefined,
  acceptedFiles: [],
  fileRejections: [],
  resetState: jest.fn()
} as ReturnType<typeof useImageUpload>

describe('ImageSectionItem', () => {
  const imageBlock: ImageBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    src: 'https://example.com/image.jpg',
    alt: 'image alt text',
    width: 100,
    height: 100,
    blurhash: '',
    customizable: true,
    scale: null,
    focalTop: null,
    focalLeft: null
  }

  const onUploadComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseImageUpload.mockReturnValue(defaultMockReturn)
  })

  it('should render the image when src is provided', () => {
    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'image alt text')
  })

  it('should render alt="" when imageBlock.alt is null', () => {
    const { container } = render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={{ ...imageBlock, alt: '' }}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    const image = container.querySelector('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', '')
  })

  it('should render an empty state icon when src is not provided', () => {
    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={{ ...imageBlock, src: null }}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('ImageRoundedIcon')).toBeInTheDocument()
  })

  it('should render the edit button', () => {
    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Edit image' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('Edit2Icon')).toBeInTheDocument()
  })

  it('should open file picker when edit button is clicked', () => {
    const open = jest.fn()
    mockUseImageUpload.mockReturnValue({
      ...defaultMockReturn,
      open
    })

    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    const editButton = screen.getByRole('button', { name: 'Edit image' })
    expect(editButton).toBeEnabled()
    fireEvent.click(editButton)
    expect(open).toHaveBeenCalled()
  })

  it('should disable edit button and show spinner when loading', () => {
    mockUseImageUpload.mockReturnValue({
      ...defaultMockReturn,
      loading: true
    })

    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Edit image' })).toBeDisabled()
    expect(
      screen.getByTestId('ImagesSection-upload-progress')
    ).toBeInTheDocument()
  })

  it('should apply getRootProps to the outer Box', () => {
    mockUseImageUpload.mockReturnValue({
      ...defaultMockReturn,
      getRootProps: () =>
        ({
          'data-testid': 'dropzone-root',
          'aria-label': 'dropzone'
        }) as any
    })

    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    expect(screen.getByTestId('dropzone-root')).toBeInTheDocument()
  })

  it('should call onUploadComplete when image upload finishes', () => {
    let onUploadCompleteCallback: (url: string) => void = jest.fn()
    mockUseImageUpload.mockImplementation((options) => {
      onUploadCompleteCallback = options.onUploadComplete
      return defaultMockReturn
    })

    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    onUploadCompleteCallback('https://example.com/new-image.jpg')
    expect(onUploadComplete).toHaveBeenCalledWith(
      imageBlock.id,
      'https://example.com/new-image.jpg'
    )
  })

  it('should show error snackbar when onUploadError is called', () => {
    let onUploadErrorCallback:
      | ((errorCode: ImageUploadErrorCode, errorMessage: string) => void)
      | undefined
    mockUseImageUpload.mockImplementation((options) => {
      onUploadErrorCallback = options.onUploadError
      return defaultMockReturn
    })

    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    onUploadErrorCallback?.(5000, 'Something went wrong: (5000)')
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'Something went wrong: (5000)',
      { variant: 'error' }
    )
  })

  it('should render a file input with correct test id', () => {
    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    expect(
      screen.getByTestId(`ImagesSection-file-input-${imageBlock.id}`)
    ).toBeInTheDocument()
  })

  it.each([
    ['L6PZfS_NcCIU_NcCIU_NcCIU', 'blur'],
    ['', 'empty']
  ])(
    'should pass correct blur data to NextImage when blurhash is %s',
    (blurhash, expectedPlaceholder) => {
      render(
        <MockedProvider>
          <ImageSectionItem
            imageBlock={{ ...imageBlock, blurhash }}
            onUploadComplete={onUploadComplete}
          />
        </MockedProvider>
      )

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('data-placeholder', expectedPlaceholder)
      if (blurhash !== '') {
        expect(image).toHaveAttribute('data-blurdataurl', blurhash)
      }
    }
  )
})
