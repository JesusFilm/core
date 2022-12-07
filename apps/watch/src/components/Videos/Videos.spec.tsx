// Note: some Carousel tests are missing currently due to an inability to mock the Carousel component.

import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { Videos, GET_VIDEOS } from './Videos'
import { videos } from './testData'

describe('Videos', () => {
  describe('carousel', () => {
    it('should render a carousel', async () => {
      const { getByTestId } = render(
        <MockedProvider>
          <Videos
            filter={{ availableVariantLanguageIds: ['529'] }}
            layout="carousel"
          />
        </MockedProvider>
      )
      expect(getByTestId('videos-carousel')).toBeInTheDocument()
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
                  limit: 8,
                  languageId: '529'
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
          <Videos
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
      const { getByLabelText } = render(
        <MockedProvider>
          <Videos
            filter={{ availableVariantLanguageIds: ['529'] }}
            layout="grid"
          />
        </MockedProvider>
      )
      expect(getByLabelText('videos-grid')).toBeInTheDocument()
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
                  offset: 0,
                  limit: 8,
                  languageId: '529'
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
          <Videos
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
})
