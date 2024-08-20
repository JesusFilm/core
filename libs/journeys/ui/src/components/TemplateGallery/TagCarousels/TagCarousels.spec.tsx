import { MockedProvider } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useRefinementList } from 'react-instantsearch'

import { GET_TAGS } from '../../../libs/useTagsQuery'
import { getTagsMock } from '../data'

import { TagCarousels } from '.'

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

function mockRefinementList() {
  const onClick = jest.fn()
  mockUseRefinementList.mockReturnValue({
    refine: onClick
  } as unknown as RefinementListRenderState)
  return onClick
}

describe('TagCarousels', () => {
  beforeEach(() => {
    mockRefinementList()
  })

  it('should render TagCarousels', async () => {
    render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels />
      </MockedProvider>
    )

    const feltNeedsCarousel = screen.getByTestId('-template-gallery-carousel')
    expect(feltNeedsCarousel).toBeInTheDocument()

    await waitFor(async () => {
      expect(
        within(feltNeedsCarousel).getByRole('button', {
          // The name of the tag is the alt text + tag label + tag label
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', {
          name: 'NUA tag NUA NUA'
        })
      ).toBeInTheDocument()
    })
  })

  it('should render skeleton when no results', async () => {
    render(
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

    const feltNeedsCarousel = screen.getByTestId('felt-needs-carousel')
    expect(
      within(feltNeedsCarousel).getAllByTestId('felt-needs-button-loading')
    ).toHaveLength(8)

    expect(screen.getAllByTestId('collections-button-loading')).toHaveLength(2)
  })

  it('should filter by felt needs tag', async () => {
    const onChange = mockRefinementList()
    render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels />
      </MockedProvider>
    )

    await waitFor(async () => {
      expect(
        screen.getByRole('button', {
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Acceptance tag Acceptance Acceptance'
      })
    )

    expect(onChange).toHaveBeenCalledWith('Acceptance')
  })

  it('should filter out felt needs tags that have no backgrounds', async () => {
    render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels />
      </MockedProvider>
    )

    // Not for test but needed in order to ensure rendering is correct
    await waitFor(async () => {
      expect(
        screen.getByRole('button', {
          name: 'Acceptance tag Acceptance Acceptance'
        })
      ).toBeInTheDocument()
    })

    // Assert tags without backgrounds are filtered out
    await waitFor(async () => {
      expect(screen.queryAllByText('Fear/Power')).toHaveLength(0)
    })
  })

  it('should filter by collections tag', async () => {
    const onChange = mockRefinementList()
    render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagCarousels />
      </MockedProvider>
    )

    await waitFor(async () => {
      expect(
        screen.getByRole('button', {
          name: 'NUA tag NUA NUA'
        })
      ).toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'NUA tag NUA NUA'
      })
    )

    expect(onChange).toHaveBeenCalledWith('NUA')
  })
})
