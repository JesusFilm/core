import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import NextLink from 'next/link'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'

import { GetJourneyVisitors_visitors_edges_node as VisitorNode } from '../../../../__generated__/GetJourneyVisitors'
import { VisitorCardHeader } from './VisitorCardHeader'
import { VisitorCardDetails } from './VisitorCardDetails'
import { getStatusIcon } from './utils'

interface Props {
  visitorNode?: VisitorNode
  loading: boolean
}

export function VisitorCard({ visitorNode, loading }: Props): ReactElement {
  const status = getStatusIcon(visitorNode?.visitor.status ?? null)

  const withLink = (block: ReactElement): ReactElement => {
    return (
      <NextLink
        href={`/reports/visitors/${visitorNode?.visitorId ?? ''}`}
        passHref
      >
        {block}
      </NextLink>
    )
  }

  const Content: ReactElement = (
    <CardActionArea>
      <CardContent sx={{ p: 6, display: 'flex' }}>
        {loading ? (
          <Skeleton
            variant="circular"
            data-testid="loading-skeleton"
            width={25}
            height={25}
            sx={{ mr: 3, display: { xs: 'none', sm: 'flex' } }}
          />
        ) : status != null && !loading ? (
          <Typography sx={{ mr: 3, display: { xs: 'none', sm: 'flex' } }}>
            {status}
          </Typography>
        ) : (
          <PersonOutlineRoundedIcon
            sx={{ mr: 3, display: { xs: 'none', sm: 'flex' } }}
          />
        )}
        <Stack direction="column" sx={{ width: '100%' }}>
          <VisitorCardHeader
            loading={loading}
            icon={visitorNode?.visitor.status ?? null}
            name={
              visitorNode?.visitor?.name ??
              `#${visitorNode?.visitorId.slice(-12) as unknown as string}`
            }
            location={visitorNode?.countryCode ?? null}
            source={visitorNode?.visitor.referrer ?? null}
            createdAt={visitorNode?.createdAt}
            duration={visitorNode?.duration ?? null}
          />

          <VisitorCardDetails
            name={
              visitorNode?.visitor.name ?? visitorNode?.visitorId.slice(-12)
            }
            events={visitorNode?.events ?? []}
            loading={loading}
          />
        </Stack>
      </CardContent>
    </CardActionArea>
  )

  return (
    <Card
      variant="outlined"
      aria-label={`visitor-card-${visitorNode?.visitorId ?? 'empty'}`}
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        },
        '&:first-of-type': {
          borderTopLeftRadius: { xs: 0, sm: 12 },
          borderTopRightRadius: { xs: 0, sm: 12 }
        }
      }}
    >
      {!loading ? withLink(Content) : Content}
    </Card>
  )
}
