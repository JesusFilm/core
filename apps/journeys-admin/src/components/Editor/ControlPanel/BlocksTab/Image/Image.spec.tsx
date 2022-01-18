import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { Image } from '.'

describe('Image', () => {
  it('should render the image button', () => {
    const { getByText } = render(
      <MockedProvider>
        <Image />
      </MockedProvider>
    )
    expect(getByText('Image')).toBeInTheDocument()
  })
})
