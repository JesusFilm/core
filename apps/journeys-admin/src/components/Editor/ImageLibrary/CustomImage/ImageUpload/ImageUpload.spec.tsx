import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { mswServer } from '../../../../../../test/mswServer'
import { CREATE_CLOUDFLARE_UPLOAD_BY_FILE, ImageUpload } from './ImageUpload'

describe('ImageUpload', () => {
  const getResponseAfterUpload = rest.get(
    'https://upload.imagedelivery.net/uploadId',
    (_req, res, ctx) => {
      return res(
        ctx.json({
          result: {
            id: 'uploadId',
            uploaded: '2022-01-31T16:39:28.458Z',
            requireSignedURLs: true,
            variants: [
              'https://imagedelivery.net/Vi7wi5KSItxGFsWRG2Us6Q/uploadId/public',
              'https://imagedelivery.net/Vi7wi5KSItxGFsWRG2Us6Q/uploadId/thumbnail'
            ],
            draft: true
          },
          errors: [],
          messages: [],
          success: true
        })
      )
    }
  )

  it('should check if the mutations gets called', async () => {
    const result = jest.fn(() => ({
      data: {
        createCloudflareUploadByUrl: {
          id: 'uploadId',
          upload: 'uploadUrl',
          __typename: 'CloudflareImage'
        }
      }
    }))
    const onChange = jest.fn()
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE
            },
            result
          }
        ]}
      >
        <ImageUpload onChange={onChange} loading={false} />
      </MockedProvider>
    )
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    const input = getByTestId('drop zone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should call onChange on file drop', async () => {
    mswServer.use(getResponseAfterUpload)
    const onChange = jest.fn()
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_UPLOAD_BY_FILE
            },
            result: {
              data: {
                createCloudflareUploadByFile: {
                  id: 'uploadId',
                  uploadUrl: 'https://upload.imagedelivery.net/uploadId',
                  userId: 'userId',
                  __typename: 'CloudflareImage'
                }
              }
            }
          }
        ]}
      >
        <ImageUpload onChange={onChange} loading={false} />
      </MockedProvider>
    )
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    const input = getByTestId('drop zone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
