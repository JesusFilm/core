import { render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { VideoListItem } from './VideoListItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video List Item', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  const tempData = {
    title: 'NUA - Episode: Fact or Fiction',
    description: 'This is a short description for the video nua1',
    poster:
      'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1631&q=80',
    time: 94000,
    onSelect: () => console.log('onSelect')
  }
  it('should render the content of VideoListItem', () => {
    const { getByText } = render(
      <VideoListItem
        title={tempData.title}
        description={tempData.description}
        poster={tempData.poster}
        time={tempData.time}
        onSelect={tempData.onSelect}
      />
    )
    expect(getByText('NUA - Episode: Fact or Fiction')).toBeInTheDocument()
    expect(
      getByText('This is a short description for the video nua1')
    ).toBeInTheDocument()
    expect(getByText('1:34')).toBeInTheDocument()
  })
})
