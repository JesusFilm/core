import { render } from '@testing-library/react'

import { GetJourneyVisitors_visitors_edges_node_events as Event } from '../../../../../__generated__/GetJourneyVisitors'

import { VisitorCardDetails } from '.'

describe('VisitorCardDetails', () => {
  it('should show filtered events', () => {
    const events: Event[] = [
      {
        __typename: 'ChatOpenEvent',
        id: 'ChatOpenEvent.id',
        createdAt: '2021-11-19T12:34:56.647Z',
        label: 'chat label',
        value: 'chat value'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'TextResponseSubmissionEvent.id',
        createdAt: 'isostring',
        label: 'text label',
        value: 'text value',
        blockId: 'blockId'
      },
      {
        __typename: 'RadioQuestionSubmissionEvent',
        id: 'RadioQuestionSubmissionEvent.id',
        createdAt: 'isostring',
        label: 'radio label',
        value: 'radio value'
      },
      {
        __typename: 'ButtonClickEvent',
        id: 'ButtonClickEvent.id',
        createdAt: 'isostring',
        label: 'button label',
        value: 'button value'
      }
    ]
    const { getByText, queryByText } = render(
      <VisitorCardDetails events={events} loading={false} />
    )

    expect(getByText('Chat Started')).toBeInTheDocument()
    expect(getByText('text value')).toBeInTheDocument()
    expect(getByText('radio value')).toBeInTheDocument()
    expect(queryByText('button value')).not.toBeInTheDocument()
  })

  it('should filter text response events by block and most recent submission', () => {
    const events: Event[] = [
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'TextResponseSubmissionEvent.id',
        createdAt: 'isostring',
        label: 'text label',
        value: 'text value block id 1',
        blockId: 'blockId'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'TextResponseSubmissionEvent.id',
        createdAt: 'isostring',
        label: 'text label',
        value: 'text value block id 1',
        blockId: 'blockId'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'TextResponseSubmissionEvent.id',
        // older by three minutes
        createdAt: '2024-05-15T10:27:00Z',
        label: 'text label',
        value: 'text value older block id 2',
        blockId: 'blockId-2'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'TextResponseSubmissionEvent.id',
        createdAt: '2024-05-15T10:30:00Z',
        label: 'text label',
        value: 'text value newer date block id 2',
        blockId: 'blockId-2'
      }
    ]
    const { getAllByText, getByText } = render(
      <VisitorCardDetails events={events} loading={false} />
    )

    expect(getAllByText('text value block id 1')).toHaveLength(1)
    expect(getByText('text value newer date block id 2')).toBeInTheDocument()
  })

  it('should only show skeletons while loading', () => {
    const events: Event[] = [
      {
        __typename: 'ChatOpenEvent',
        id: 'ChatOpenEvent.id',
        createdAt: '2021-11-19T12:34:56.647Z',
        label: 'chat label',
        value: 'chat value'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'TextResponseSubmissionEvent.id',
        createdAt: 'isostring',
        label: 'text label',
        value: 'text value',
        blockId: 'blockId'
      },
      {
        __typename: 'RadioQuestionSubmissionEvent',
        id: 'RadioQuestionSubmissionEvent.id',
        createdAt: 'isostring',
        label: 'radio label',
        value: 'radio value'
      },
      {
        __typename: 'ButtonClickEvent',
        id: 'ButtonClickEvent.id',
        createdAt: 'isostring',
        label: 'button label',
        value: 'button value'
      }
    ]
    const { queryByText, getAllByTestId } = render(
      <VisitorCardDetails events={events} loading />
    )

    expect(queryByText('Chat Started')).not.toBeInTheDocument()
    expect(queryByText('text value')).not.toBeInTheDocument()
    expect(queryByText('radio value')).not.toBeInTheDocument()
    expect(queryByText('button value')).not.toBeInTheDocument()
    expect(getAllByTestId('description-skeleton')).toHaveLength(2)
  })
})
