import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { Videos } from './Videos'

const renderItem = jest.fn()

describe('Videos', () => {
  it('should render a carousel', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <Videos
          renderItem={renderItem}
          filter={{ availableVariantLanguageIds: ['529'] }}
          layout="carousel"
        />
      </MockedProvider>
    )
    expect(getByTestId('videos-carousel')).toBeInTheDocument()
  })

  it('should render a grid', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <Videos
          renderItem={renderItem}
          filter={{ availableVariantLanguageIds: ['529'] }}
          layout="grid"
        />
      </MockedProvider>
    )
    expect(getByTestId('videos-grid')).toBeInTheDocument()
  })
})
