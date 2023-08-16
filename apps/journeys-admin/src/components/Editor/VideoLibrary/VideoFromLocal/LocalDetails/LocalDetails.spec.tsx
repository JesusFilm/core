import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../__generated__/GetJourney'
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
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toEqual(
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg'
    )
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
      duration: 144,
      endAt: 144,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '529'
    })
  })

  it('should keep startAt and endAt values if already exist on select click', async () => {
    const onSelect = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'videoId',
              videoId: '2_Acts7302-0-0',
              source: VideoBlockSource.internal,
              duration: 144,
              startAt: 5,
              endAt: 41,
              videoVariantLanguageId: '529'
            } as unknown as TreeBlock<VideoBlock>
          }}
        >
          <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
        </EditorProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        duration: 144,
        endAt: 41,
        startAt: 5,
        source: VideoBlockSource.internal,
        videoId: '2_Acts7302-0-0',
        videoVariantLanguageId: '529'
      })
    )
  })
})
