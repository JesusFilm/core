import { MockedProvider } from '@apollo/client/testing/react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from '../../../../libs/useCloudflareUploadByUrlMutation'
import { useImageUpload } from '../../../../libs/useImageUpload'
import type { UseImageUploadOptions } from '../../../../libs/useImageUpload'

import { ImagePicker, isHttpsUrl } from './ImagePicker'

vi.mock('../../../../libs/useImageUpload', () => ({
  useImageUpload: vi.fn()
}))

const PASTED = 'https://example.com/picture.jpg'
const STORED = 'https://imagedelivery.net/accountHash/cfId'

const uploadByUrlMock = {
  request: {
    query: CREATE_CLOUDFLARE_UPLOAD_BY_URL,
    variables: { url: PASTED, teamId: 'teamId' }
  },
  result: vi.fn(() => ({
    data: {
      createCloudflareUploadByUrl: {
        __typename: 'CloudflareImage',
        id: 'cfId',
        url: STORED
      }
    }
  }))
}

/** The upload hook as a stub: records its options and lets a test finish an upload. */
let uploadOptions: UseImageUploadOptions | undefined
const open = vi.fn()

function renderPicker(
  onPick = vi.fn(),
  mocks: Array<Record<string, unknown>> = [uploadByUrlMock]
): { onPick: ReturnType<typeof vi.fn> } {
  render(
    <MockedProvider mocks={mocks as never}>
      <ImagePicker teamId="teamId" onPick={onPick} />
    </MockedProvider>
  )
  return { onPick }
}

describe('ImagePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadOptions = undefined
    vi.mocked(useImageUpload).mockImplementation((options) => {
      uploadOptions = options
      return {
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        open,
        isDragActive: false,
        isDragAccept: false,
        isDragReject: false,
        loading: false,
        success: undefined,
        errorCode: undefined,
        acceptedFiles: [],
        fileRejections: []
      } as unknown as ReturnType<typeof useImageUpload>
    })
  })

  it('offers upload a file or paste an image URL, and no library browsing', () => {
    renderPicker()
    expect(
      screen.getByRole('button', { name: 'Upload a file' })
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Image URL' })).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.queryByText(/library/i)).not.toBeInTheDocument()
  })

  it('uploads under the campaign team', () => {
    renderPicker()
    expect(uploadOptions?.teamId).toBe('teamId')
    fireEvent.click(screen.getByRole('button', { name: 'Upload a file' }))
    expect(open).toHaveBeenCalled()
  })

  it('checks the https shape client-side before offering a preview', () => {
    const { onPick } = renderPicker()
    const input = screen.getByRole('textbox', { name: 'Image URL' })

    fireEvent.change(input, { target: { value: 'http://example.com/pic.jpg' } })

    expect(screen.getByText('Enter an https:// image link')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview' })).toBeDisabled()
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.queryByTestId('CampaignImagePickerPreview')).toBeNull()
    expect(onPick).not.toHaveBeenCalled()
    expect(isHttpsUrl('https://example.com/a.png')).toBe(true)
    expect(isHttpsUrl('ftp://example.com/a.png')).toBe(false)
    expect(isHttpsUrl('not a url')).toBe(false)
  })

  it('shows the pasted image before keeping it, then fetches it into Cloudflare under the team and picks the stored address', async () => {
    const { onPick } = renderPicker()

    fireEvent.change(screen.getByRole('textbox', { name: 'Image URL' }), {
      target: { value: ` ${PASTED} ` }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    expect(screen.getByTestId('CampaignImagePickerPreviewImage')).toHaveAttribute(
      'src',
      PASTED
    )
    expect(uploadByUrlMock.result).not.toHaveBeenCalled()
    expect(onPick).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Use image' }))

    await waitFor(() => expect(uploadByUrlMock.result).toHaveBeenCalled())
    await waitFor(() => expect(onPick).toHaveBeenCalledWith(`${STORED}/public`))
  })

  it('keeps an uploaded image directly: it is already on Cloudflare', async () => {
    const { onPick } = renderPicker()

    act(() => {
      uploadOptions?.onUploadComplete(`${STORED}/public`)
    })

    const preview = await screen.findByTestId('CampaignImagePickerPreviewImage')
    expect(preview).toHaveAttribute('src', `${STORED}/public`)
    fireEvent.click(screen.getByRole('button', { name: 'Use image' }))

    expect(onPick).toHaveBeenCalledWith(`${STORED}/public`)
    expect(uploadByUrlMock.result).not.toHaveBeenCalled()
  })

  it('shows the API’s message verbatim when the fetch into Cloudflare fails', async () => {
    const failing = {
      ...uploadByUrlMock,
      result: vi.fn(() => ({
        errors: [{ message: 'That link does not point at an image' }]
      }))
    }
    const { onPick } = renderPicker(vi.fn(), [failing])

    fireEvent.change(screen.getByRole('textbox', { name: 'Image URL' }), {
      target: { value: PASTED }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
    fireEvent.click(screen.getByRole('button', { name: 'Use image' }))

    expect(
      await screen.findByText('That link does not point at an image')
    ).toBeInTheDocument()
    expect(onPick).not.toHaveBeenCalled()
  })

  it('shows an upload error and drops the preview on Cancel', () => {
    renderPicker()
    act(() => {
      uploadOptions?.onUploadError?.('unknown-error', 'Something went wrong')
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')

    fireEvent.change(screen.getByRole('textbox', { name: 'Image URL' }), {
      target: { value: PASTED }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByTestId('CampaignImagePickerPreview')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByTestId('CampaignImagePickerPreview')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
