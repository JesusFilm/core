import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { useAlgoliaVideos } from '../../libs/algolia/useAlgoliaVideos'
import { VideosPage } from './VideosPage'

jest.mock('react-instantsearch')

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

jest.mock('react-instantsearch')
jest.mock('../../libs/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('VideosPage', () => {
  it('should render videos page', async () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      hits: [],
      showMore: jest.fn(),
      isLastPage: false
    })

    render(
      <MockedProvider>
        <VideosPage index />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('Languages')).toBeInTheDocument()
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
  })
})
