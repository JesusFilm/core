import { gql, useQuery } from '@apollo/client'
import { reduce } from 'lodash'
import { ReactElement } from 'react'
import { VisitorJourneyListItem } from './VisitorJourneyListItem'

interface Props {
  id: string
  limit?: number
}

const GET_VISITOR_EVENTS = gql`
  query GetVisitorEvents($id: ID!) {
    visitor(id: $id) {
      events {
        id
      }
    }
  }
`

export function VisitorJourneyList({ id }: Props): ReactElement {
  const { data } = useQuery(GET_VISITOR_EVENTS, { variables: { id } })

  return (
    <>
      {data?.events.map((item) => (
        <VisitorJourneyListItem
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          events={item.events}
        />
      ))}
    </>
  )
}
