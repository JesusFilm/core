import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'
import { GET_VIDEO, LocalDetails } from './LocalDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('LocalDetails', () => {
  const mocks = [
    {
      request: {
        query: GET_VIDEO,
        variables: {
          id: '2_Acts7302-0-0',
          languageId: '529'
        }
      },
      result: {
        data: {
          video: {
            id: '2_Acts7302-0-0',
            primaryLanguageId: '529',
            image:
              'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
            title: [
              {
                primary: true,
                value: 'Jesus Taken Up Into Heaven'
              }
            ],
            description: [
              {
                primary: true,
                value: 'Jesus promises the Holy Spirit.'
              }
            ],
            variant: {
              id: 'variantA',
              duration: 144,
              hls: 'https://arc.gt/opsgn'
            },
            variantLanguages: [
              {
                __typename: 'Language',
                id: '529',
                name: [
                  {
                    value: 'English',
                    primary: true,
                    __typename: 'Translation'
                  }
                ]
              }
            ]
          }
        }
      }
    }
  ]

  it('should render details of a video', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Jesus Taken Up Into Heaven' })
      ).toBeInTheDocument()
    )
    expect(getByText('Jesus promises the Holy Spirit.')).toBeInTheDocument()
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster')
    expect(imageTag).toHaveStyle(
      "background-image: url('https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg')"
    )
  })

  it('should not render show more or show less buttons for short video descriptions', async () => {
    const { queryByRole } = render(
      <MockedProvider mocks={mocks}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(queryByRole('button', { name: 'More' })).not.toBeInTheDocument()
    )
  })

  it('should expand and truncate video description on button click', async () => {
    const longVideoDescription =
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.'
    mocks[0].result.data.video.description[0].value = longVideoDescription
    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'More' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'More' }))
    expect(getByText(longVideoDescription)).toBeInTheDocument()
    expect(getByRole('button', { name: 'Less' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Less' }))
    expect(getByRole('button', { name: 'More' })).toBeInTheDocument()
  })

  it('should open the languages drawer on language button click', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={jest.fn()} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Other Languages' }))
    expect(getByText('Available Languages')).toBeInTheDocument()
  })

  it('should call onSelect on select click', async () => {
    const onSelect = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      endAt: 144,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '529'
    })
  })
})
