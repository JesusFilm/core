import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { Video } from '.'

describe('Video', () => {
  it('should render the video button', () => {
    const { getByText } = render(
      <MockedProvider>
        <Video />
      </MockedProvider>
    )
    expect(getByText('Video')).toBeInTheDocument()
  })
})
