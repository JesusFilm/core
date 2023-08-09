import { render } from '@testing-library/react'

import { GetJourneyVisitors_visitors_edges_node_events as Event } from '../../../../../__generated__/GetJourneyVisitors'

import { VisitorCardDetails } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('VisitorCardDetails', () => {
  it('should show name', () => {
    const { getByText } = render(
      <VisitorCardDetails
        loading={false}
        name="test name"
        events={[
          {
            __typename: 'TextResponseSubmissionEvent',
            id: 'event.id',
            createdAt: 'isostring',
            label: 'label',
            value: 'value'
          }
        ]}
      />
    )
    expect(getByText('test name')).toBeInTheDocument()
  })

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
        value: 'text value'
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
      <VisitorCardDetails name="test name" events={events} loading={false} />
    )

    expect(getByText('Chat Started')).toBeInTheDocument()
    expect(getByText('text value')).toBeInTheDocument()
    expect(getByText('radio value')).toBeInTheDocument()
    expect(queryByText('button value')).not.toBeInTheDocument()
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
        value: 'text value'
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
      <VisitorCardDetails name="test name" events={events} loading />
    )

    expect(queryByText('Chat Started')).not.toBeInTheDocument()
    expect(queryByText('text value')).not.toBeInTheDocument()
    expect(queryByText('radio value')).not.toBeInTheDocument()
    expect(queryByText('button value')).not.toBeInTheDocument()
    expect(getAllByTestId('description-skeleton')).toHaveLength(2)
  })
})
