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
            },
            {
              __typename: 'Language',
              id: '496',
              name: [
                {
                  value: 'Français',
                  primary: true,
                  __typename: 'LanguageName'
                },
                {
                  value: 'French',
                  primary: false,
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

  it('should open the language popover on chip click', async () => {
    const { getByRole, getByTestId, queryByTestId } = render(
      <MockedProvider mocks={[getVideoMock]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'English' })).toBeEnabled()
    )
    expect(queryByTestId('VideoLanguagePicker')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'English' }))
    expect(getByTestId('VideoLanguagePicker')).toBeInTheDocument()
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

  it('should call onSelect on select click when not preselected', async () => {
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

  it('should update staged language without calling onSelect when not preselected', async () => {
    const onSelect = jest.fn()
    const result = jest.fn().mockReturnValue(getVideoMock.result)
    const { getByRole, queryByTestId } = render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'English' }))
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))

    // popover closes after selection
    await waitFor(() =>
      expect(queryByTestId('VideoLanguagePicker')).not.toBeInTheDocument()
    )
    // chip reflects staged language
    expect(getByRole('button', { name: 'French' })).toBeInTheDocument()
    // onSelect not called yet — Select must be clicked to commit
    expect(onSelect).not.toHaveBeenCalled()

    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      duration: 144,
      endAt: 144,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '496'
    })
  })

  it('should auto-save language change immediately when preselected', async () => {
    const onSelect = jest.fn()
    const { getByRole, queryByRole, queryByTestId } = render(
      <MockedProvider mocks={[getVideoMock]}>
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'videoId',
              videoId: '2_Acts7302-0-0',
              source: VideoBlockSource.internal,
              duration: 144,
              startAt: 7,
              endAt: 60,
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

    // Select button is hidden in the preselected flow
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Select' })).not.toBeInTheDocument()
    )

    fireEvent.click(getByRole('button', { name: 'English' }))
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))

    expect(onSelect).toHaveBeenCalledWith({
      duration: 144,
      endAt: 60,
      startAt: 7,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '496'
    })
    // popover closes after auto-save
    await waitFor(() =>
      expect(queryByTestId('VideoLanguagePicker')).not.toBeInTheDocument()
    )
  })

  it('should keep startAt and endAt values when auto-saving a language change on a preselected video', async () => {
    const onSelect = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getVideoMock]}>
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
      expect(getByRole('button', { name: 'English' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'English' }))
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        duration: 144,
        endAt: 41,
        startAt: 5,
        source: VideoBlockSource.internal,
        videoId: '2_Acts7302-0-0',
        videoVariantLanguageId: '496'
      })
    )
  })
})
