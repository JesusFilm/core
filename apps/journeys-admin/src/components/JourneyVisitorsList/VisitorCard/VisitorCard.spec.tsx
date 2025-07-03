import { render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import {
  GetJourneyVisitors_visitors_edges_node_visitor as Visitor,
  GetJourneyVisitors_visitors_edges_node as VisitorNode
} from '../../../../__generated__/GetJourneyVisitors'
import { VisitorStatus } from '../../../../__generated__/globalTypes'

import { VisitorCard } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('VisitorCard', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      query: { redirect: null }
    } as unknown as NextRouter)
  })

  const visitorNode: VisitorNode = {
    __typename: 'JourneyVisitor',
    visitorId: 'visitor.id-012345678901',
    createdAt: '2021-11-19T12:34:56.647Z',
    duration: 75,
    visitor: {
      __typename: 'Visitor',
      name: 'FirstName LastName',
      status: VisitorStatus.star,
      countryCode: 'Town, City',
      referrer: 'referrer.com'
    },
    events: [
      {
        __typename: 'ChatOpenEvent',
        id: 'chat.id',
        createdAt: '2021-11-19T12:35:56.647Z',
        label: 'button label',
        value: 'button value'
      }
    ]
  }

  it('should link to visitor details', () => {
    const { getByRole, getAllByText } = render(
      <VisitorCard visitorNode={visitorNode} loading={false} />
    )
    expect(getAllByText('FirstName LastName')).toHaveLength(2)
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/reports/visitors/visitor.id-012345678901'
    )
  })

  it('should pass journey id in query params if available', () => {
    mockUseRouter.mockReturnValue({
      query: { journeyId: 'journeyId' }
    } as unknown as NextRouter)

    const { getByRole, getAllByText } = render(
      <VisitorCard visitorNode={visitorNode} loading={false} />
    )
    expect(getAllByText('FirstName LastName')).toHaveLength(2)
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/reports/visitors/visitor.id-012345678901?journeyId=journeyId'
    )
  })

  it('should show name', () => {
    const emptyVisitor = {
      ...visitorNode,
      visitor: {
        __typename: 'Visitor',
        name: null,
        status: null,
        referrer: null
      } as unknown as Visitor,
      events: []
    }

    const { getAllByText } = render(
      <VisitorCard visitorNode={emptyVisitor} loading={false} />
    )
    expect(getAllByText('#012345678901')).toHaveLength(2)
  })

  it('should show skeleton when loading', () => {
    const visitorNode: VisitorNode = {
      __typename: 'JourneyVisitor',
      visitorId: 'visitor.id-012345678901',
      createdAt: '2021-11-19T12:34:56.647Z',
      duration: 75,
      visitor: {
        __typename: 'Visitor',
        name: 'FirstName LastName',
        countryCode: 'Town, City',
        status: VisitorStatus.star,
        referrer: 'referrer.com'
      },
      events: [
        {
          __typename: 'ChatOpenEvent',
          id: 'chat.id',
          createdAt: '2021-11-19T12:35:56.647Z',
          label: 'button label',
          value: 'button value'
        }
      ]
    }
    const { getByTestId, getAllByTestId } = render(
      <VisitorCard visitorNode={visitorNode} loading />
    )
    expect(getByTestId('header-skeleton')).toBeInTheDocument()
    expect(getAllByTestId('description-skeleton')).toHaveLength(2)
  })
})
