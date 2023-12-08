import { ApolloQueryResult } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'
import Image3Icon from '@core/shared/ui/icons/Image3'
import MoreIcon from '@core/shared/ui/icons/More'

import {
  GetAdminJourneys_journeys as AdminJourney,
  GetAdminJourneys
} from '../../../../__generated__/GetAdminJourneys'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { JourneyCardMenu } from '../../JourneyList/JourneyCard/JourneyCardMenu'

export interface TemplateListItemProps {
  journey?: AdminJourney | Journey
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

export function TemplateListItem({
  journey,
  refetch
}: TemplateListItemProps): ReactElement {
  const nativeLanguage =
    journey?.language.name.find(({ primary }) => primary)?.value ?? ''
  const localLanguage = journey?.language.name.find(
    ({ primary }) => !primary
  )?.value
  const displayLanguage =
    nativeLanguage === localLanguage || localLanguage == null
      ? nativeLanguage
      : `${nativeLanguage} (${localLanguage})`

  const date =
    journey != null
      ? intlFormat(parseISO(journey.createdAt), {
          day: 'numeric',
          month: 'long',
          year: isThisYear(parseISO(journey?.createdAt)) ? undefined : 'numeric'
        })
      : ''

  return (
    <Card
      aria-label="template-card"
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        height: '129px',
        display: 'flex',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }
      }}
      data-testid="JourneysAdminTemplateCard"
    >
      {journey?.primaryImageBlock?.src != null ? (
        <CardMedia
          component="img"
          image={journey.primaryImageBlock.src}
          height="129px"
          alt={journey.title}
          sx={{
            maxWidth: '129px',
            minWidth: '129px'
          }}
        />
      ) : (
        <CardMedia
          component="div"
          sx={{
            height: '129px',
            width: '129px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '129px',
            minWidth: '129px',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default'
          }}
        >
          <Image3Icon />
        </CardMedia>
      )}

      <Stack
        direction="column"
        sx={{
          width: `calc(100% - 129px)`,
          display: 'flex'
        }}
      >
        <NextLink
          href={journey != null ? `/publisher/${journey.id}` : ''}
          passHref
          legacyBehavior
          prefetch={false}
        >
          <CardActionArea>
            <CardContent>
              {journey != null ? (
                <>
                  <Typography variant="subtitle1" noWrap>
                    {journey.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ fontSize: 12 }}
                    suppressHydrationWarning
                  >
                    {date}
                    {journey?.description != null
                      ? ` - ${journey.description}`
                      : ''}
                  </Typography>
                </>
              ) : (
                <Box sx={{ height: '44px' }}>
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="text" width={150} />
                </Box>
              )}
            </CardContent>
          </CardActionArea>
        </NextLink>
        <CardActions sx={{ px: 4, py: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              mt: 0,
              display: 'flex',
              justifyContent: 'flex-start',
              width: '100%'
            }}
          >
            {journey != null ? (
              <>
                <Globe1Icon sx={{ fontSize: 13, pl: 0 }} />
                <Typography variant="body2" noWrap sx={{ ml: 1 }}>
                  {displayLanguage}
                </Typography>
              </>
            ) : (
              <>
                <Globe1Icon sx={{ fontSize: 13, p: 0 }} />
                <Skeleton
                  variant="text"
                  width={50}
                  height={20}
                  sx={{ ml: 1, p: 0 }}
                />
              </>
            )}
            <Box sx={{ display: 'flex', ml: 'auto' }}>
              {journey != null ? (
                <JourneyCardMenu
                  id={journey.id}
                  status={journey.status}
                  slug={journey.slug}
                  published={journey.publishedAt != null}
                  template
                  refetch={refetch}
                />
              ) : (
                <IconButton disabled>
                  <MoreIcon />
                </IconButton>
              )}
            </Box>
          </Stack>
        </CardActions>
      </Stack>
    </Card>
  )
}
