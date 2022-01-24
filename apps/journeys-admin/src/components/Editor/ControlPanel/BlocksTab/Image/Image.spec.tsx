import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { Image, IMAGE_BLOCK_CREATE } from '.'

describe('Image', () => {
  it('should render the image button', () => {
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyid',
                  parentBlockId: 'parentblockid',
                  src: null,
                  alt: 'Default Image Icon'
                }
              }
            },
            result: {
              data: {
                imageBlockCreate: {
                  journeyId: 'journeyid',
                  parentBlockId: 'parentblockid',
                  src: null,
                  alt: 'Default Image Icon'
                }
              }
            }
          }
        ]}
      >
        <Image />
      </MockedProvider>
    )
    expect(getByText('Image')).toBeInTheDocument()
  })
})
