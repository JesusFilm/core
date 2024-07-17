import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import { getTagsMock } from '../data'

import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useRefinementList } from 'react-instantsearch'
import { TagCarousels } from '.'
import { GET_TAGS } from '../../../libs/useTagsQuery'

jest.mock('react-instantsearch')

function mockRefinementList() {
  jest.clearAllMocks()
  const onClick = jest.fn()
  const useRefinementListMocked = jest.mocked(useRefinementList)
  useRefinementListMocked.mockReturnValue({
    refine: onClick
  } as unknown as RefinementListRenderState)
  return onClick
}

describe('TagCarousels', () => {
  beforeEach(() => {
    mockRefinementList()
  })

  it('should render TagCarousels', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels />
      </MockedProvider>
    )

    const feltNeedsCarousel = getByTestId('-template-gallery-carousel')
    expect(feltNeedsCarousel).toBeInTheDocument()

    await waitFor(async () => {
      expect(
        within(feltNeedsCarousel).getByRole('button', {
          // The name of the tag is the alt text + tag label + tag label
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()

      expect(
        getByRole('button', {
          name: 'NUA tag NUA NUA'
        })
      ).toBeInTheDocument()
    })
  })

  it('should render skeleton when no results', async () => {
    const { getByTestId, getAllByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TAGS
            },
            result: {
              data: {
                tags: []
              }
            }
          }
        ]}
      >
        <TagCarousels />
      </MockedProvider>
    )

    const feltNeedsCarousel = getByTestId('-template-gallery-carousel')
    expect(
      within(feltNeedsCarousel).getAllByTestId('felt-needs-button-loading')
    ).toHaveLength(8)

    expect(getAllByTestId('collections-button-loading')).toHaveLength(2)
  })

  it('should filter by felt needs tag', async () => {
    const onChange = mockRefinementList()
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels />
      </MockedProvider>
    )

    await waitFor(async () => {
      expect(
        getByRole('button', {
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      getByRole('button', {
        name: 'Acceptance tag Acceptance Acceptance'
      })
    )

    expect(onChange).toHaveBeenCalledWith('Acceptance')
  })

  it('should filter out felt needs tags that have no backgrounds', async () => {
    const { getByRole, queryAllByText } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels />
      </MockedProvider>
    )

    // Not for test but needed in order to ensure rendering is correct
    await waitFor(async () => {
      expect(
        getByRole('button', {
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()
    })

    // Assert tags without backgrounds are filtered out
    await waitFor(async () => {
      expect(queryAllByText('Fear/Power')).toHaveLength(0)
    })
  })

  it('should filter by collections tag', async () => {
    const onChange = mockRefinementList()
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels />
      </MockedProvider>
    )

    await waitFor(async () => {
      expect(
        getByRole('button', {
          name: 'NUA tag NUA NUA'
        })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      getByRole('button', {
        name: 'NUA tag NUA NUA'
      })
    )

    expect(onChange).toHaveBeenCalledWith('NUA')
  })
})
