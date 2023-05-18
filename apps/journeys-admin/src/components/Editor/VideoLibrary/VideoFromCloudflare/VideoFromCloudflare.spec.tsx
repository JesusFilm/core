import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { VideoFromCloudflare } from '.'

describe('VideoFromCloudflare', () => {
  it('should render custom url video upload', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <VideoFromCloudflare onSelect={jest.fn()} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Add video by URL' }))
    expect(getByText('Paste URL of video...'))
  })
})
