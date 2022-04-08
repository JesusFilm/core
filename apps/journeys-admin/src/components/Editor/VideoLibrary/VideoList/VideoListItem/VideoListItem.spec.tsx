import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { VideoListItem } from './VideoListItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video List Item', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  const video = {
    id: '2_0-AndreasStory',
    title: "Andreas' Story",
    description:
      'After living a life full of fighter planes and porsches, Andreas realizes something is missing.',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
    duration: 186
  }

  it('should render the content of VideoListItem', () => {
    const onSelect = jest.fn()
    const { getByText } = render(
      <MockedProvider>
        <VideoListItem
          id={video.id}
          title={video.title}
          description={video.description}
          image={video.image}
          duration={video.duration}
          onSelect={onSelect}
        />
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

  // add back test on calling VideoDetails on VideoListItem click
})
