import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { rest } from 'msw'
import { mswServer } from '../../../../../../test/mswServer'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import { CLOUDFLARE_UPLOAD_URL } from './CustomUrl'
import { CustomUrl } from '.'

describe('CustomUrl', () => {
  const imageBlock: ImageBlock = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0
  }

  const createCloudflareImageMock = {
    request: {
      query: CLOUDFLARE_UPLOAD_URL
    },
    result: {
      data: {
        createCloudflareImage: {
          uploadUrl: 'uploadUrl',
          id: 'id'
        }
      }
    }
  }

  const fetchCloudflareUploadResponse = rest.get(
    'https://upload.imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/uploadId',
    (_req, res, ctx) => {
      return res(
        ctx.json({
          errors: [],
          messages: [],
          results: {
            filename: 'blob',
            id: 'uploadId',
            requiredSignedURLs: false,
            variants: [
              'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/uploadId/900x1600',
              'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/uploadId/public'
            ]
          },
          success: true
        })
      )
    }
  )

  it('should upload image to cloudlfare', async () => {
    mswServer.use(fetchCloudflareUploadResponse)
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[createCloudflareImageMock]}>
        <CustomUrl selectedBlock={imageBlock} onChange={onChange} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    expect(getByText('Paste URL of image...'))
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/123' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(
      'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/uploadId/public'
    ))
  })
})
