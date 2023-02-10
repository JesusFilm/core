import { ReactElement, useRef, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import IconButton from '@mui/material/IconButton'
import Link from 'next/link'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { ApolloQueryResult } from '@apollo/client'
import { GetActiveJourneys } from '../../../../__generated__/GetActiveJourneys'
import { GetArchivedJourneys } from '../../../../__generated__/GetArchivedJourneys'
import { GetTrashedJourneys } from '../../../../__generated__/GetTrashedJourneys'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { JourneyCardMenu } from './JourneyCardMenu'
import { JourneyCardText } from './JourneyCardText'
import { JourneyCardInfo } from './JourneyCardInfo'

export enum JourneyCardVariant {
  'standard',
  'new',
  'actionRequired'
}

interface JourneyCardProps {
  journey?: Journey
  duplicatedJourneyId?: string
  variant?: JourneyCardVariant
  refetch?: () => Promise<
    ApolloQueryResult<
      GetActiveJourneys | GetArchivedJourneys | GetTrashedJourneys
    >
  >
}

export function JourneyCard({
  journey,
  duplicatedJourneyId,
  variant = JourneyCardVariant.standard,
  refetch
}: JourneyCardProps): ReactElement {
  const duplicatedJourneyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (duplicatedJourneyId != null && duplicatedJourneyRef.current != null) {
      duplicatedJourneyRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [duplicatedJourneyId, journey])

  return (
    <Card
      ref={
        journey?.id === duplicatedJourneyId ? duplicatedJourneyRef : undefined
      }
      aria-label="journey-card"
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <>
        <Link href={journey != null ? `/journeys/${journey.id}` : ''} passHref>
          <CardActionArea>
            <CardContent
              sx={{
                px: 6,
                py: 4
              }}
            >
              <JourneyCardText journey={journey} variant={variant} />
            </CardContent>
          </CardActionArea>
        </Link>
        <CardActions
          sx={{
            px: 6,
            pb: 4
          }}
        >
          <JourneyCardInfo journey={journey} variant={variant} />
          {journey != null ? (
            <JourneyCardMenu
              id={journey.id}
              status={journey.status}
              slug={journey.slug}
              published={journey.publishedAt != null}
              refetch={refetch}
            />
          ) : (
            <IconButton disabled>
              <MoreVertIcon />
            </IconButton>
          )}
        </CardActions>
      </>
    </Card>
  )
}
