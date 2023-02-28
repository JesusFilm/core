import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from './CustomUrl'

export const createCloudflareUploadByUrlMock = {
  request: {
    query: CREATE_CLOUDFLARE_UPLOAD_BY_URL,
    variables: {
      url: 'https://example.com/image.jpg'
    }
  },
  result: {
    data: {
      createCloudflareUploadByUrl: {
        id: 'uploadId',
        __typename: 'CloudflareImage'
      }
    }
  }
}
