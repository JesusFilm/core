import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { GetJourneyVisitors_visitors_edges_node as VisitorNode } from '../../../../__generated__/GetJourneyVisitors'

import { VisitorCardDetails } from './VisitorCardDetails'
import { VisitorCardHeader } from './VisitorCardHeader'

interface VisitorCardProps {
  visitorNode?: VisitorNode
  loading: boolean
}

export function VisitorCard({
  visitorNode,
  loading
}: VisitorCardProps): ReactElement {
  const router = useRouter()

  const withLink = (block: ReactElement): ReactElement => {
    return (
      <NextLink
        href={`/reports/visitors/${visitorNode?.visitorId ?? ''}/$${
          router.query?.journeyId != null
            ? `?journeyId=${router.query.journeyId as string}`
            : ''
        }`}
        prefetch={false}
      >
        {block}
      </NextLink>
    )
  }

  const Content: ReactElement = (
    <CardActionArea>
      <CardContent sx={{ p: 6, display: 'flex' }}>
        <Stack direction="column" sx={{ width: '100%' }}>
          <VisitorCardHeader
            loading={loading}
            icon={visitorNode?.visitor.status}
            name={
              visitorNode?.visitor?.name ??
              `#${visitorNode?.visitorId.slice(-12) as unknown as string}`
            }
            location={visitorNode?.visitor.countryCode}
            source={visitorNode?.visitor.referrer}
            createdAt={visitorNode?.createdAt}
            duration={visitorNode?.duration}
          />

          <VisitorCardDetails
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
      data-testid="VisitorCard"
    >
      {!loading ? withLink(Content) : Content}
    </Card>
  )
}
