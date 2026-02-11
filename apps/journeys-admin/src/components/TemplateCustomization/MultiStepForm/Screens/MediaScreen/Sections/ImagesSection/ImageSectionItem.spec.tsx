import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'
import * as useImageUploadHooks from '../../../../../../../libs/useImageUpload'
import { ImageSectionItem } from './ImageSectionItem'

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

jest.mock('../../../../../../../libs/useImageUpload', () => ({
  __esModule: true,
  ...jest.requireActual('../../../../../../../libs/useImageUpload')
}))

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
    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
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

  it('should call open when edit button is clicked', () => {
    const open = jest.fn()
    jest.spyOn(useImageUploadHooks, 'useImageUpload').mockReturnValue({
      getRootProps: jest.fn(),
      getInputProps: jest.fn(),
      open,
      loading: false
    } as any)

    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit image' }))
    expect(open).toHaveBeenCalled()
  })

  it('should show loading progress and disable edit button when uploading', () => {
    jest.spyOn(useImageUploadHooks, 'useImageUpload').mockReturnValue({
      getRootProps: jest.fn(),
      getInputProps: jest.fn(),
      open: jest.fn(),
      loading: true
    } as any)

    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    expect(
      screen.getByTestId('ImagesSection-upload-progress')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit image' })).toBeDisabled()
  })

  it('should hide loading progress when not uploading', () => {
    jest.spyOn(useImageUploadHooks, 'useImageUpload').mockReturnValue({
      getRootProps: jest.fn(),
      getInputProps: jest.fn(),
      open: jest.fn(),
      loading: false
    } as any)

    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={imageBlock}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    expect(
      screen.queryByTestId('ImagesSection-upload-progress')
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit image' })).toBeEnabled()
  })

  it('should call onUploadComplete when image upload finishes', () => {
    let onUploadCompleteCallback: (url: string) => void = () => {}
    jest.spyOn(useImageUploadHooks, 'useImageUpload').mockImplementation((options) => {
      onUploadCompleteCallback = options.onUploadComplete
      return {
        getRootProps: jest.fn(),
        getInputProps: jest.fn(),
        open: jest.fn(),
        loading: false
      } as any
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

  it('should pass correct blur data to NextImage when blurhash is present', () => {
    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={{ ...imageBlock, blurhash: 'L6PZfS_NcCIU_NcCIU_NcCIU' }}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('data-placeholder', 'blur')
    expect(image).toHaveAttribute(
      'data-blurdataurl',
      'L6PZfS_NcCIU_NcCIU_NcCIU'
    )
  })

  it('should not pass blur data to NextImage when blurhash is missing', () => {
    render(
      <MockedProvider>
        <ImageSectionItem
          imageBlock={{ ...imageBlock, blurhash: null }}
          onUploadComplete={onUploadComplete}
        />
      </MockedProvider>
    )

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('data-placeholder', 'empty')
    expect(image).not.toHaveAttribute('data-blurdataurl')
  })
})
