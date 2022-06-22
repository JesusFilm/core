import { ReactElement, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { gql, useQuery } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { sortBy } from 'lodash'
import { useTranslation } from 'react-i18next'
import { GetArchivedJourneys } from '../../../../../__generated__/GetArchivedJourneys'
import { JourneyCard } from '../../JourneyCard'
import { SortOrder } from '../../JourneySort'

export const GET_ARCHIVED_JOURNEYS = gql`
  query GetArchivedJourneys {
    journeys: adminJourneys(status: [archived]) {
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

interface ArchivedStatusTabProps {
  onLoad: () => void
  sortOrder?: SortOrder
}

export function ArchivedStatusTab({
  onLoad,
  sortOrder
}: ArchivedStatusTabProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { data, loading, error } = useQuery<GetArchivedJourneys>(
    GET_ARCHIVED_JOURNEYS
  )
  const journeys = data?.journeys

  useEffect(() => {
    if (!loading && error == null) {
      onLoad()
    }
  }, [onLoad, loading, error])

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
          {sortedJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
          {journeys.length > 0 ? (
            <Box width="100%" sx={{ textAlign: 'center' }}>
              <Typography variant="caption">
                {t(
                  'Archived journeys are hidden from your active journey list for better organization.'
                )}
              </Typography>
            </Box>
          ) : (
            <>
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
                  {t('No archived journeys.')}
                </Typography>
              </Card>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  {t(
                    'You can archive a Journey to hide it from your active Journey list for better organization.'
                  )}
                </Typography>
              </Box>
            </>
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
