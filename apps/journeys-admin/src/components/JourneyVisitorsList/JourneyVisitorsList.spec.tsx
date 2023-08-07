import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'

import { GetJourneyVisitors_visitors_edges as VisitorEdge } from '../../../__generated__/GetJourneyVisitors'

import { JourneyVisitorsList } from '.'

describe('JourneyVisitorsList', () => {
  const visitorEdges: VisitorEdge[] = [
    {
      __typename: 'JourneyVisitorEdge',
      cursor: 'cursor1',
      node: {
        __typename: 'JourneyVisitor',
        visitorId: 'visitor1.id',
        createdAt: '2021-11-19T12:35:56.647Z',
        duration: null,
        visitor: {
          __typename: 'Visitor',
          name: null,
          countryCode: null,
          status: null,
          referrer: null
        },
        events: []
      }
    },
    {
      __typename: 'JourneyVisitorEdge',
      cursor: 'cursor2',
      node: {
        __typename: 'JourneyVisitor',
        visitorId: 'visitor2.id',
        createdAt: '2021-11-19T12:35:56.647Z',
        duration: null,
        visitor: {
          __typename: 'Visitor',
          name: null,
          countryCode: null,
          status: null,
          referrer: null
        },
        events: []
      }
    },
    {
      __typename: 'JourneyVisitorEdge',
      cursor: 'cursor3',
      node: {
        __typename: 'JourneyVisitor',
        visitorId: 'visitor3.id',
        createdAt: '2021-11-19T12:35:56.647Z',
        duration: null,
        visitor: {
          __typename: 'Visitor',
          name: null,
          countryCode: null,
          status: null,
          referrer: null
        },
        events: []
      }
    }
  ]

  it('should show visitors', () => {
    const { getByLabelText } = render(
      <JourneyVisitorsList
        visitorEdges={visitorEdges}
        fetchNext={noop}
        loading={false}
        hasNextPage={false}
      />
    )
    expect(getByLabelText('visitor-card-visitor1.id')).toBeInTheDocument()
    expect(getByLabelText('visitor-card-visitor2.id')).toBeInTheDocument()
    expect(getByLabelText('visitor-card-visitor3.id')).toBeInTheDocument()
  })

  it('should show visitors count', () => {
    const { getByText } = render(
      <JourneyVisitorsList
        visitorEdges={visitorEdges}
        visitorsCount={5}
        fetchNext={noop}
        loading={false}
        hasNextPage
      />
    )
    expect(getByText('Showing 3 visitors out of 5')).toBeInTheDocument()
  })

  it('should load more', () => {
    const handleFetchNext = jest.fn()
    const { getByRole } = render(
      <JourneyVisitorsList
        visitorEdges={visitorEdges}
        fetchNext={handleFetchNext}
        loading={false}
        hasNextPage
      />
    )
    fireEvent.click(getByRole('button', { name: 'Load More' }))
    expect(handleFetchNext).toHaveBeenCalled()
  })

  it('should disable load more', () => {
    const { getByRole } = render(
      <JourneyVisitorsList
        visitorEdges={visitorEdges}
        fetchNext={noop}
        loading={false}
      />
    )
    expect(getByRole('button', { name: 'Load More' })).toBeDisabled()
  })

  it('should show empty visitors placeholder', () => {
    const { getByRole, queryByRole, queryByText } = render(
      <JourneyVisitorsList fetchNext={noop} visitorsCount={5} loading={false} />
    )

    expect(getByRole('img')).toHaveAttribute('alt', 'visitors-placeholder')
    expect(queryByRole('button', { name: 'Load More' })).not.toBeInTheDocument()
    expect(queryByText('123')).not.toBeInTheDocument()
  })

  it('should show loading skeletons', async () => {
    const { getAllByTestId } = render(
      <JourneyVisitorsList fetchNext={noop} loading />
    )

    await waitFor(() =>
      expect(getAllByTestId('loading-skeleton')).toHaveLength(4)
    )
  })
})
