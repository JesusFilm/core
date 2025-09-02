import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { GET_VIDEO, LocalDetails } from './LocalDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('LocalDetails', () => {
  const getVideoMock = {
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
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
            }
          ],
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
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }
  }

  it('should render details of a video', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getVideoMock]}>
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
    expect(sourceTag?.getAttribute('src')).toBe('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe(
      'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
    )
  })

  it('should open the languages drawer on language button click', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={jest.fn()} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'English' }))
    expect(getByText('Available Languages')).toBeInTheDocument()
  })

  it('should render variant language', async () => {
    const result = jest.fn(() => ({
      data: {
        video: {
          id: '2_Acts7302-0-0',
          primaryLanguageId: '529',
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
            }
          ],
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
              id: '525',
              name: [
                {
                  value: 'Algerian',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEO,
              variables: {
                id: '2_Acts7302-0-0',
                languageId: '525'
              }
            },
            result
          }
        ]}
      >
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'videoId',
              videoId: '2_Acts7302-0-0',
              source: VideoBlockSource.internal,
              duration: 144,
              startAt: 0,
              endAt: 0,
              videoVariantLanguageId: '525',
              mediaVideo: {
                __typename: 'Video',
                id: '2_Acts7302-0-0'
              }
            } as unknown as TreeBlock<VideoBlock>
          }}
        >
          <LocalDetails id="2_Acts7302-0-0" open onSelect={jest.fn()} />
        </EditorProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Algerian' })).toBeInTheDocument()
    )
    expect(result).toHaveBeenCalled()
  })

  it('should call onSelect on select click', async () => {
    const onSelect = jest.fn()
    const result = jest.fn().mockReturnValue(getVideoMock.result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
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

  it('should disable select button if loading', async () => {
    const onSelect = jest.fn()
    const result = jest.fn().mockReturnValue(getVideoMock.result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Select' })).toBeDisabled()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('button', { name: 'Select' })).not.toBeDisabled()
  })

  it('should keep startAt and endAt values if already exist on select click', async () => {
    const onSelect = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'videoId',
              videoId: '2_Acts7302-0-0',
              source: VideoBlockSource.internal,
              duration: 0,
              startAt: 5,
              endAt: 41,
              videoVariantLanguageId: '529',
              mediaVideo: {
                __typename: 'Video',
                id: '2_Acts7302-0-0'
              }
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
        duration: 0,
        endAt: 41,
        startAt: 5,
        source: VideoBlockSource.internal,
        videoId: '2_Acts7302-0-0',
        videoVariantLanguageId: '529'
      })
    )
  })
})
