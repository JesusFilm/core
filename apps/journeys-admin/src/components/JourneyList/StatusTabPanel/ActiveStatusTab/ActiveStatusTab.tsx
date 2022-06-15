import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import { gql, useQuery } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { sortBy } from 'lodash'
import { GetActiveJourneys } from '../../../../../__generated__/GetActiveJourneys'
import { JourneyCard } from '../../JourneyCard'
import { AddJourneyButton } from '../../AddJourneyButton'
import { SortOrder } from '../../JourneySort'

const GET_ACTIVE_JOURNEYS = gql`
  query GetActiveJourneys {
    journeys: adminJourneys {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      status
      seoTitle
      seoDescription
      userJourneys {
        id
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
    }
  }
`

interface ActiveStatusTabProps {
  sortOrder?: SortOrder
}

export function ActiveStatusTab({
  sortOrder
}: ActiveStatusTabProps): ReactElement {
  const { data } = useQuery<GetActiveJourneys>(GET_ACTIVE_JOURNEYS)
  const journeys = data?.journeys

  // orders of the first characters ascii value
  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? sortBy(journeys, 'title')
      : sortBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  return (
    <>
      {journeys != null ? (
        <>
          {/* Cant test the filter until the more statuses are added */}
          {sortedJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
          {journeys.length === 0 && (
            <Card
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                pt: 20,
                pb: 16,
                borderBottomLeftRadius: { xs: 0, sm: 12 },
                borderBottomRightRadius: { xs: 0, sm: 12 },
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0
              }}
            >
              <Typography variant="subtitle1" align="center" gutterBottom>
                No journeys to display.
              </Typography>
              <Typography variant="caption" align="center" gutterBottom>
                Create a journey, then find it here.
              </Typography>
              <AddJourneyButton variant="button" />
            </Card>
          )}
        </>
      ) : (
        <>
          <JourneyCard />
          <JourneyCard />
          <JourneyCard />
        </>
      )}
    </>
  )
}
