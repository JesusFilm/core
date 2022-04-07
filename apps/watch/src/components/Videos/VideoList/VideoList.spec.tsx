// Note: some Carousel tests are missing currently due to an inability to mock the Carousel component.

import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { VideoList, GET_VIDEOS } from './VideoList'
import { videos } from './testData'

describe('VideoList', () => {
  describe('carousel', () => {
    it('should render a carousel', async () => {
      const { getByTestId } = render(
        <MockedProvider>
          <VideoList
            filter={{ availableVariantLanguageIds: ['529'] }}
            layout="carousel"
          />
        </MockedProvider>
      )
      expect(getByTestId('video-list-carousel')).toBeInTheDocument()
    })
    // skip this test becuase the carousel doesn't render properly in jest
    xit('should display videos', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {
                    availableVariantLanguageIds: ['529']
                  },
                  page: 1,
                  limit: 8
                }
              },
              result: {
                data: {
                  videos: videos
                }
              }
            }
          ]}
        >
          <VideoList
            filter={{ availableVariantLanguageIds: ['529'] }}
            layout="carousel"
          />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
        expect(getByText(videos[7].title[0].value)).toBeInTheDocument()
      })
    })
  })
  describe('grid', () => {
    it('should render a grid', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <VideoList
            filter={{ availableVariantLanguageIds: ['529'] }}
            layout="grid"
          />
        </MockedProvider>
      )
      expect(getByTestId('video-list-grid')).toBeInTheDocument()
    })
    it('should display videos', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {
                    availableVariantLanguageIds: ['529']
                  },
                  page: 1,
                  limit: 20
                }
              },
              result: {
                data: {
                  videos: videos
                }
              }
            }
          ]}
        >
          <VideoList
            filter={{ availableVariantLanguageIds: ['529'] }}
            layout="grid"
          />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
        expect(getByText(videos[7].title[0].value)).toBeInTheDocument()
      })
    })
  })
  describe('list', () => {
    it('should render a list', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <VideoList
            filter={{ availableVariantLanguageIds: ['529'] }}
            layout="list"
          />
        </MockedProvider>
      )
      expect(getByTestId('video-list-list')).toBeInTheDocument()
    })
    it('should display videos', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {
                    availableVariantLanguageIds: ['529']
                  },
                  page: 1,
                  limit: 8
                }
              },
              result: {
                data: {
                  videos: videos
                }
              }
            }
          ]}
        >
          <VideoList
            filter={{ availableVariantLanguageIds: ['529'] }}
            layout="list"
          />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
        expect(getByText(videos[7].title[0].value)).toBeInTheDocument()
      })
    })
  })
})
