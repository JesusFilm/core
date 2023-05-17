import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import { GetJourneyVisitors_visitors_edges_node as VisitorNode } from '../../../../__generated__/GetJourneyVisitors'
import { VisitorCardHeader } from './VisitorCardHeader'
import { VisitorCardDetails } from './VisitorCardDetails'

interface Props {
  visitorNode: VisitorNode
}

export function VisitorCard({ visitorNode }: Props): ReactElement {
  return (
    <Card
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
        },
        '&:first-of-type': {
          borderTopLeftRadius: { xs: 0, sm: 12 },
          borderTopRightRadius: { xs: 0, sm: 12 }
        }
      }}
    >
      <CardActionArea>
        <CardContent sx={{ p: 6 }}>
          <VisitorCardHeader
            icon={visitorNode.visitor.status}
            name={
              visitorNode.visitor.name ?? `#${visitorNode.visitorId.slice(-12)}`
            }
            location={visitorNode.countryCode}
            source={visitorNode.visitor.referrer}
            createdAt={visitorNode.createdAt}
            duration={visitorNode.duration}
          />
          <VisitorCardDetails
            name={visitorNode.visitor.name ?? visitorNode.visitorId.slice(-12)}
            events={visitorNode.events}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
