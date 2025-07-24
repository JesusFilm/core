import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { videos } from '../data'

import { VideoListItem } from './VideoListItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video List Item', () => {
  it('should render the content of VideoListItem', () => {
    const { getByText } = render(
      <MockedProvider>
        <VideoListItem {...videos[0]} onSelect={jest.fn()} />
      </MockedProvider>
    )
    expect(getByText("Andreas' Story")).toBeInTheDocument()
    expect(
      getByText(
        'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
      )
    ).toBeInTheDocument()
    expect(getByText('03:06')).toBeInTheDocument()
  })

  it('should open VideoDetails', async () => {
    const onSelect = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider>
        <VideoListItem {...videos[0]} onSelect={onSelect} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByText('Video Details')).toBeInTheDocument())
    fireEvent.click(getByRole('button', { name: 'Select' }))
  })
})
