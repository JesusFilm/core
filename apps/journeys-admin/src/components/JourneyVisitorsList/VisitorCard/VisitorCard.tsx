import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Link from 'next/link'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { GetJourneyVisitors_visitors_edges_node as VisitorNode } from '../../../../__generated__/GetJourneyVisitors'
import { VisitorCardHeader } from './VisitorCardHeader'
import { VisitorCardDetails } from './VisitorCardDetails'
import { getStatusIcon } from './utils'

interface Props {
  visitorNode: VisitorNode
}

export function VisitorCard({ visitorNode }: Props): ReactElement {
  const status = getStatusIcon(visitorNode.visitor.status)
  return (
    <Card
      variant="outlined"
      aria-label={`visitor-card-${visitorNode.visitorId}`}
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
      <Link href={`/reports/visitors/${visitorNode.visitorId}`} passHref>
        <CardActionArea>
          <CardContent sx={{ p: 6, display: 'flex' }}>
            {status != null ? (
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
                icon={visitorNode.visitor.status}
                name={
                  visitorNode.visitor.name ??
                  `#${visitorNode.visitorId.slice(-12)}`
                }
                location={visitorNode.countryCode}
                source={visitorNode.visitor.referrer}
                createdAt={visitorNode.createdAt}
                duration={visitorNode.duration}
              />

              <VisitorCardDetails
                name={
                  visitorNode.visitor.name ?? visitorNode.visitorId.slice(-12)
                }
                events={visitorNode.events}
              />
            </Stack>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  )
}
